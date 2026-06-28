import type { JSONContent } from "@tiptap/core";
import type { ApiResponse } from "@/types/api";
import { getApiUrl } from "@/lib/api/baseQuery";
import {
  extractBlobImageNodes,
  replaceImageSrcInJson,
} from "@/lib/utils/tiptapImage";

interface PresignedUrlData {
  presignedUrl: string;
  fileUrl: string;
}

/** 백엔드 Presigned URL 발급 */
async function requestPresignedUrl(
  fileName: string,
  contentType: string,
): Promise<PresignedUrlData> {
  const response = await fetch(getApiUrl("/api/files/presigned-url"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, contentType }),
  });

  const json = (await response.json()) as ApiResponse<PresignedUrlData>;

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? "Presigned URL 발급에 실패했습니다.");
  }

  return json.data;
}

/** Presigned URL로 S3에 직접 PUT 업로드 */
async function uploadFileToS3(presignedUrl: string, file: File): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("S3 업로드에 실패했습니다.");
  }
}

/** File Map에 없으면 blob URL에서 File 복원 */
async function resolveFile(
  blobUrl: string,
  fileMap: Map<string, File>,
): Promise<File> {
  const cached = fileMap.get(blobUrl);
  if (cached) {
    return cached;
  }

  const blob = await fetch(blobUrl).then((response) => response.blob());
  return new File([blob], "image", {
    type: blob.type || "application/octet-stream",
  });
}

/**
 * 저장 전 blob 이미지를 S3에 일괄 업로드하고 JSON 내 src를 CloudFront URL로 치환
 */
export async function prepareContentForSave(
  json: JSONContent,
  fileMap: Map<string, File>,
  onProgress?: (current: number, total: number) => void,
): Promise<string> {
  const blobNodes = extractBlobImageNodes(json);

  if (blobNodes.length === 0) {
    return JSON.stringify(json);
  }

  const urlMap = new Map<string, string>();

  for (let i = 0; i < blobNodes.length; i++) {
    onProgress?.(i + 1, blobNodes.length);

    const blobUrl = blobNodes[i].src;
    const file = await resolveFile(blobUrl, fileMap);
    const fileName = file.name || `image-${i + 1}`;

    const { presignedUrl, fileUrl } = await requestPresignedUrl(
      fileName,
      file.type,
    );
    await uploadFileToS3(presignedUrl, file);
    urlMap.set(blobUrl, fileUrl);
  }

  const finalJson = replaceImageSrcInJson(json, urlMap);
  return JSON.stringify(finalJson);
}
