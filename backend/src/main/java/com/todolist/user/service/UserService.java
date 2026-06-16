package com.todolist.user.service;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import com.todolist.user.dto.UserResponse;
import com.todolist.user.entity.User;
import com.todolist.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 유저 조회 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

	private final UserRepository userRepository;

	public UserResponse getMyInfo(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "유저를 찾을 수 없습니다."));
		return UserResponse.from(user);
	}

	@Transactional
	public User findOrCreateGoogleUser(String email, String nickname, String providerId) {
		return userRepository.findByProviderAndProviderId("google", providerId)
				.map(existing -> {
					existing.updateNickname(nickname);
					return existing;
				})
				.orElseGet(() -> userRepository.save(
						User.builder()
								.email(email)
								.nickname(nickname)
								.provider("google")
								.providerId(providerId)
								.build()
				));
	}

	@Transactional
	public void saveRefreshToken(Long userId, String refreshToken) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
		user.updateRefreshToken(refreshToken);
	}

	@Transactional
	public void clearRefreshToken(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
		user.clearRefreshToken();
	}

	public User getUserById(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "유저를 찾을 수 없습니다."));
	}
}
