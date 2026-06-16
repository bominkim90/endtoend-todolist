package com.todolist.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 앱 공통 설정 (프론트 URL, 쿠키 secure 여부)
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

	private String frontendUrl;
	private boolean cookieSecure;
}
