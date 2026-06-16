package com.todolist.user.dto;

import com.todolist.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 내 정보 조회 API 응답 DTO
 */
@Getter
@Builder
public class UserResponse {

	private Long id;
	private String email;
	private String nickname;
	private String provider;
	private LocalDateTime createdAt;

	public static UserResponse from(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.email(user.getEmail())
				.nickname(user.getNickname())
				.provider(user.getProvider())
				.createdAt(user.getCreatedAt())
				.build();
	}
}
