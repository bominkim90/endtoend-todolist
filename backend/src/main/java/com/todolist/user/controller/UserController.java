package com.todolist.user.controller;

import com.todolist.common.dto.ApiResponse;
import com.todolist.common.security.SecurityUtils;
import com.todolist.user.dto.UserResponse;
import com.todolist.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 유저 API — 내 정보 조회
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/me")
	public ApiResponse<UserResponse> getMyInfo(Authentication authentication) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		UserResponse response = userService.getMyInfo(userId);
		return ApiResponse.success(response);
	}
}
