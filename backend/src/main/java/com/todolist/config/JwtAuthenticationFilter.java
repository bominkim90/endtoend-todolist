package com.todolist.config;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * httpOnly 쿠키의 Access Token을 검증하고 SecurityContext에 유저 ID를 설정
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	public static final String ACCESS_TOKEN_COOKIE = "access_token";

	private final JwtTokenProvider jwtTokenProvider;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		// 헬스체크는 별도 SecurityFilterChain에서 처리 — JWT 검증 생략
		return "/health".equals(request.getRequestURI());
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {

		String token = extractTokenFromCookie(request);

		if (token != null) {
			try {
				jwtTokenProvider.validateToken(token);

				if (!jwtTokenProvider.isAccessToken(token)) {
					throw new BusinessException(ErrorCode.INVALID_TOKEN);
				}

				Long userId = jwtTokenProvider.getUserIdFromToken(token);
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(
								userId,
								null,
								List.of(new SimpleGrantedAuthority("ROLE_USER"))
						);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (BusinessException e) {
				SecurityContextHolder.clearContext();
			}
		}

		filterChain.doFilter(request, response);
	}

	private String extractTokenFromCookie(HttpServletRequest request) {
		if (request.getCookies() == null) {
			return null;
		}
		for (Cookie cookie : request.getCookies()) {
			if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}
		return null;
	}
}
