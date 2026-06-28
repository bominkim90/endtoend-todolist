package com.todolist.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 헬스체크 API — 로드밸런서·EB 등에서 앱 생존 여부 확인용
 */
@RestController
public class HealthController {

	@GetMapping("/health")
	public ResponseEntity<Void> health() {
		return ResponseEntity.ok().build();
	}
}
