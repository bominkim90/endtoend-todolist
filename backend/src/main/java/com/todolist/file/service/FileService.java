package com.todolist.file.service;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import com.todolist.config.AwsProperties;
import com.todolist.file.dto.PresignedUrlRequest;
import com.todolist.file.dto.PresignedUrlResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * S3 Presigned URL 발급 — 프론트가 S3에 직접 PUT 업로드
 */
@Service
@RequiredArgsConstructor
public class FileService {

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp"
	);

	private static final Duration PRESIGNED_URL_EXPIRATION = Duration.ofMinutes(10);

	private final S3Presigner s3Presigner;
	private final AwsProperties awsProperties;

	public PresignedUrlResponse createPresignedUploadUrl(PresignedUrlRequest request) {
		validateContentType(request.getContentType());

		String extension = extractExtension(request.getFileName());
		String key = "images/" + UUID.randomUUID() + extension;

		PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(awsProperties.getS3Bucket())
				.key(key)
				.contentType(request.getContentType())
				.build();

		PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
				.signatureDuration(PRESIGNED_URL_EXPIRATION)
				.putObjectRequest(putObjectRequest)
				.build();

		String presignedUrl = s3Presigner.presignPutObject(presignRequest).url().toString();
		String fileUrl = buildCloudFrontUrl(key);

		return new PresignedUrlResponse(presignedUrl, fileUrl);
	}

	private void validateContentType(String contentType) {
		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
			throw new BusinessException(ErrorCode.INVALID_FILE_TYPE);
		}
	}

	private String extractExtension(String filename) {
		if (filename == null || !filename.contains(".")) {
			return "";
		}
		return filename.substring(filename.lastIndexOf("."));
	}

	private String buildCloudFrontUrl(String key) {
		String cloudfrontDomain = awsProperties.getCloudfrontDomain();
		if (cloudfrontDomain.endsWith("/")) {
			cloudfrontDomain = cloudfrontDomain.substring(0, cloudfrontDomain.length() - 1);
		}
		return cloudfrontDomain + "/" + key;
	}
}
