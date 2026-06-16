package com.todolist.config;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Access/Refresh 토큰 생성 및 검증
 */
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

	private static final String TOKEN_TYPE_ACCESS = "access";
	private static final String TOKEN_TYPE_REFRESH = "refresh";

	private final JwtProperties jwtProperties;

	public String createAccessToken(Long userId) {
		return createToken(userId, TOKEN_TYPE_ACCESS, jwtProperties.getAccessTokenExpiration());
	}

	public String createRefreshToken(Long userId) {
		return createToken(userId, TOKEN_TYPE_REFRESH, jwtProperties.getRefreshTokenExpiration());
	}

	private String createToken(Long userId, String tokenType, long expirationMs) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
				.subject(String.valueOf(userId))
				.claim("type", tokenType)
				.issuedAt(now)
				.expiration(expiry)
				.signWith(getSigningKey())
				.compact();
	}

	public Long getUserIdFromToken(String token) {
		Claims claims = parseClaims(token);
		return Long.parseLong(claims.getSubject());
	}

	public boolean isAccessToken(String token) {
		return TOKEN_TYPE_ACCESS.equals(parseClaims(token).get("type", String.class));
	}

	public boolean isRefreshToken(String token) {
		return TOKEN_TYPE_REFRESH.equals(parseClaims(token).get("type", String.class));
	}

	public void validateToken(String token) {
		try {
			parseClaims(token);
		} catch (ExpiredJwtException e) {
			throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
		} catch (MalformedJwtException | IllegalArgumentException e) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}
	}

	private Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	private SecretKey getSigningKey() {
		byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
