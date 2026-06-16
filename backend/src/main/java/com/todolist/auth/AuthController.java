package com.todolist.auth;

import com.todolist.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * 인증 API — Google 로그인, 토큰 재발급, 로그아웃
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	/**
	 * Google OAuth 로그인 시작 — Spring Security OAuth2 엔드포인트로 리다이렉트
	 */
	@GetMapping("/google")
	public void googleLogin(HttpServletResponse response) throws IOException {
		response.sendRedirect("/oauth2/authorization/google");
	}

	/**
	 * Access Token 재발급 (Refresh Token은 httpOnly 쿠키에서 읽음)
	 */
	@PostMapping("/refresh")
	public ApiResponse<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
		authService.refreshAccessToken(request, response);
		return ApiResponse.success("토큰이 재발급되었습니다.", null);
	}

	/**
	 * 로그아웃 — Refresh Token 무효화 + 쿠키 삭제
	 */
	@PostMapping("/logout")
	public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
		authService.logout(request, response);
		return ApiResponse.success("로그아웃되었습니다.", null);
	}
}
