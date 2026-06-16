package com.todolist.todo.dto;

import com.todolist.todo.entity.Todo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 투두 응답 DTO
 */
@Getter
@Builder
public class TodoResponse {

	private Long id;
	private String title;
	private String content;
	private boolean completed;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static TodoResponse from(Todo todo) {
		return TodoResponse.builder()
				.id(todo.getId())
				.title(todo.getTitle())
				.content(todo.getContent())
				.completed(todo.isCompleted())
				.createdAt(todo.getCreatedAt())
				.updatedAt(todo.getUpdatedAt())
				.build();
	}
}
