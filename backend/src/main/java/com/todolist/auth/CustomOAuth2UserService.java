package com.todolist.auth;

import com.todolist.user.entity.User;
import com.todolist.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Google OAuth 로그인 시 유저 조회/생성 후 OAuth2User 반환
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

	private final UserService userService;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2User oAuth2User = super.loadUser(userRequest);

		String providerId = oAuth2User.getAttribute("sub");
		String email = oAuth2User.getAttribute("email");
		String nickname = oAuth2User.getAttribute("name");

		if (providerId == null || email == null) {
			throw new OAuth2AuthenticationException("Google OAuth 필수 정보(sub, email)를 가져올 수 없습니다.");
		}

		if (nickname == null || nickname.isBlank()) {
			nickname = email.split("@")[0];
		}

		User user = userService.findOrCreateGoogleUser(email, nickname, providerId);

		Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
		attributes.put("userId", user.getId());

		return new DefaultOAuth2User(
				oAuth2User.getAuthorities(),
				attributes,
				"sub"
		);
	}
}
