package com.todolist.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * API 요청 인증 실패 시 401 JSON 반환 — OAuth 302 리다이렉트 방지 (SPA fetch 호환)
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException authException
	) throws IOException {

		if (isApiRequest(request)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);

			// ApiResponse.fail("인증이 필요합니다.")와 동일한 형식
			response.getWriter().write(
					"{\"success\":false,\"message\":\"인증이 필요합니다.\",\"data\":null}"
			);
			return;
		}

		// API가 아닌 브라우저 페이지 요청은 기본 401
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
	}

	private boolean isApiRequest(HttpServletRequest request) {
		if (request.getRequestURI().startsWith("/api/")) {
			return true;
		}

		String accept = request.getHeader("Accept");
		return accept != null && accept.contains("application/json");
	}
}
