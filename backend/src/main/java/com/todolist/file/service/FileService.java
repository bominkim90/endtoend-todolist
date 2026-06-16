package com.todolist.file.service;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import com.todolist.config.AwsProperties;
import com.todolist.file.dto.FileUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * S3 이미지 업로드 비즈니스 로직
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

	private final S3Client s3Client;
	private final AwsProperties awsProperties;

	public FileUploadResponse uploadImage(MultipartFile file) {
		validateFile(file);

		String originalFilename = file.getOriginalFilename();
		String extension = extractExtension(originalFilename);
		String key = "images/" + UUID.randomUUID() + extension;

		try {
			PutObjectRequest putRequest = PutObjectRequest.builder()
					.bucket(awsProperties.getS3Bucket())
					.key(key)
					.contentType(file.getContentType())
					.build();

			s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
		} catch (IOException e) {
			throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
		}

		String cloudfrontDomain = awsProperties.getCloudfrontDomain();
		if (cloudfrontDomain.endsWith("/")) {
			cloudfrontDomain = cloudfrontDomain.substring(0, cloudfrontDomain.length() - 1);
		}

		String url = cloudfrontDomain + "/" + key;
		return new FileUploadResponse(url);
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BusinessException(ErrorCode.INVALID_INPUT, "업로드할 파일이 없습니다.");
		}

		String contentType = file.getContentType();
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
}
