package com.todolist.file.controller;

import com.todolist.common.dto.ApiResponse;
import com.todolist.file.dto.FileUploadResponse;
import com.todolist.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 API — 이미지 S3 업로드
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

	private final FileService fileService;

	@PostMapping("/upload")
	public ApiResponse<FileUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
		FileUploadResponse response = fileService.uploadImage(file);
		return ApiResponse.success("이미지 업로드 완료", response);
	}
}
