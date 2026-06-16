package com.todolist.common.security;

import org.springframework.security.core.Authentication;

/**
 * SecurityContext에서 꺼낸 인증 정보
 * principal에 userId(Long)가 저장됨
 */
public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static Long getCurrentUserId(Authentication authentication) {
		if (authentication == null || authentication.getPrincipal() == null) {
			return null;
		}
		return (Long) authentication.getPrincipal();
	}
}
