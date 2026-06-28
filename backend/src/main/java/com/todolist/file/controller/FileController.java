package com.todolist.file.controller;

import com.todolist.common.dto.ApiResponse;
import com.todolist.file.dto.PresignedUrlRequest;
import com.todolist.file.dto.PresignedUrlResponse;
import com.todolist.file.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 파일 API — S3 Presigned URL 발급
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

	private final FileService fileService;

	@PostMapping("/presigned-url")
	public ApiResponse<PresignedUrlResponse> createPresignedUrl(
			@Valid @RequestBody PresignedUrlRequest request
	) {
		PresignedUrlResponse response = fileService.createPresignedUploadUrl(request);
		return ApiResponse.success("Presigned URL이 발급되었습니다.", response);
	}
}
