package com.todolist.todo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 투두 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class TodoUpdateRequest {

	@NotBlank(message = "제목은 필수입니다.")
	private String title;

	private String content;
}
