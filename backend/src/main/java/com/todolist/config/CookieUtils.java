package com.todolist.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * JWT httpOnly 쿠키 설정/삭제 유틸
 */
@Component
@RequiredArgsConstructor
public class CookieUtils {

	public static final String REFRESH_TOKEN_COOKIE = "refresh_token";

	private final JwtProperties jwtProperties;
	private final AppProperties appProperties;

	public void setAccessTokenCookie(HttpServletResponse response, String token) {
		response.addHeader("Set-Cookie", buildCookie(
				JwtAuthenticationFilter.ACCESS_TOKEN_COOKIE,
				token,
				(int) (jwtProperties.getAccessTokenExpiration() / 1000)
		).toString());
	}

	public void setRefreshTokenCookie(HttpServletResponse response, String token) {
		response.addHeader("Set-Cookie", buildCookie(
				REFRESH_TOKEN_COOKIE,
				token,
				(int) (jwtProperties.getRefreshTokenExpiration() / 1000)
		).toString());
	}

	public void clearAuthCookies(HttpServletResponse response) {
		response.addHeader("Set-Cookie", buildCookie(JwtAuthenticationFilter.ACCESS_TOKEN_COOKIE, "", 0).toString());
		response.addHeader("Set-Cookie", buildCookie(REFRESH_TOKEN_COOKIE, "", 0).toString());
	}

	public String extractRefreshToken(Cookie[] cookies) {
		if (cookies == null) {
			return null;
		}
		for (Cookie cookie : cookies) {
			if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}
		return null;
	}

	private ResponseCookie buildCookie(String name, String value, int maxAgeSeconds) {
		return ResponseCookie.from(name, value)
				.httpOnly(true)
				.secure(appProperties.isCookieSecure())
				.path("/")
				.sameSite("Lax")
				.maxAge(maxAgeSeconds)
				.build();
	}
}
