import type { JSONContent } from "@tiptap/core";

export interface BlobImageNode {
  src: string;
}

/** TipTap JSON 트리에서 blob: 이미지 노드 수집 */
export function extractBlobImageNodes(
  node: JSONContent,
  result: BlobImageNode[] = [],
): BlobImageNode[] {
  if (
    node.type === "image" &&
    typeof node.attrs?.src === "string" &&
    node.attrs.src.startsWith("blob:")
  ) {
    result.push({ src: node.attrs.src });
  }

  node.content?.forEach((child) => extractBlobImageNodes(child, result));
  return result;
}

/** blob URL을 최종 fileUrl로 치환한 JSON 반환 (원본 불변) */
export function replaceImageSrcInJson(
  node: JSONContent,
  urlMap: Map<string, string>,
): JSONContent {
  const cloned: JSONContent = { ...node };

  if (cloned.type === "image" && cloned.attrs?.src) {
    const src = cloned.attrs.src as string;
    const replaced = urlMap.get(src);
    if (replaced) {
      cloned.attrs = { ...cloned.attrs, src: replaced };
    }
  }

  if (cloned.content) {
    cloned.content = cloned.content.map((child) =>
      replaceImageSrcInJson(child, urlMap),
    );
  }

  return cloned;
}
