package com.todolist.file.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * S3 Presigned URL 발급 요청 DTO
 */
@Getter
@NoArgsConstructor
public class PresignedUrlRequest {

	@NotBlank(message = "파일명은 필수입니다.")
	private String fileName;

	@NotBlank(message = "Content-Type은 필수입니다.")
	private String contentType;
}
