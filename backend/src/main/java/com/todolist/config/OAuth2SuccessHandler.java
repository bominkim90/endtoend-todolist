package com.todolist.config;

import com.todolist.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Google OAuth 로그인 성공 시 JWT 발급 후 프론트로 리다이렉트
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final AuthService authService;
	private final AppProperties appProperties;

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request,
			HttpServletResponse response,
			Authentication authentication
	) throws IOException {

		OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
		Long userId = oAuth2User.getAttribute("userId");

		authService.issueTokens(response, userId);

		getRedirectStrategy().sendRedirect(request, response, appProperties.getFrontendUrl());
	}
}
