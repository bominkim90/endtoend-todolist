package com.todolist.auth;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import com.todolist.config.CookieUtils;
import com.todolist.config.JwtTokenProvider;
import com.todolist.user.entity.User;
import com.todolist.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * JWT 발급, 재발급, 로그아웃 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
public class AuthService {

	private final JwtTokenProvider jwtTokenProvider;
	private final CookieUtils cookieUtils;
	private final UserService userService;

	@Transactional
	public void issueTokens(HttpServletResponse response, Long userId) {
		String accessToken = jwtTokenProvider.createAccessToken(userId);
		String refreshToken = jwtTokenProvider.createRefreshToken(userId);

		userService.saveRefreshToken(userId, refreshToken);

		cookieUtils.setAccessTokenCookie(response, accessToken);
		cookieUtils.setRefreshTokenCookie(response, refreshToken);
	}

	@Transactional
	public void refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = cookieUtils.extractRefreshToken(request.getCookies());

		if (refreshToken == null || refreshToken.isBlank()) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh Token이 없습니다.");
		}

		jwtTokenProvider.validateToken(refreshToken);

		if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}

		Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
		User user = userService.getUserById(userId);

		if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN, "유효하지 않은 Refresh Token입니다.");
		}

		String newAccessToken = jwtTokenProvider.createAccessToken(userId);
		cookieUtils.setAccessTokenCookie(response, newAccessToken);
	}

	@Transactional
	public void logout(HttpServletRequest request, HttpServletResponse response) {
		Cookie[] cookies = request.getCookies();
		String refreshToken = cookieUtils.extractRefreshToken(cookies);

		if (refreshToken != null) {
			try {
				jwtTokenProvider.validateToken(refreshToken);
				Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
				userService.clearRefreshToken(userId);
			} catch (BusinessException ignored) {
				// 만료/무효 토큰이어도 쿠키는 삭제
			}
		}

		cookieUtils.clearAuthCookies(response);
	}
}
