package com.todolist.todo.controller;

import com.todolist.common.dto.ApiResponse;
import com.todolist.common.security.SecurityUtils;
import com.todolist.todo.dto.TodoCreateRequest;
import com.todolist.todo.dto.TodoResponse;
import com.todolist.todo.dto.TodoUpdateRequest;
import com.todolist.todo.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 투두 API — CRUD + 완료 토글
 */
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

	private final TodoService todoService;

	@GetMapping
	public ApiResponse<List<TodoResponse>> getMyTodos(Authentication authentication) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		return ApiResponse.success(todoService.getMyTodos(userId));
	}

	@PostMapping
	public ApiResponse<TodoResponse> createTodo(
			Authentication authentication,
			@Valid @RequestBody TodoCreateRequest request
	) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		return ApiResponse.success(todoService.createTodo(userId, request));
	}

	@GetMapping("/{id}")
	public ApiResponse<TodoResponse> getTodo(
			Authentication authentication,
			@PathVariable Long id
	) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		return ApiResponse.success(todoService.getTodo(userId, id));
	}

	@PutMapping("/{id}")
	public ApiResponse<TodoResponse> updateTodo(
			Authentication authentication,
			@PathVariable Long id,
			@Valid @RequestBody TodoUpdateRequest request
	) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		return ApiResponse.success(todoService.updateTodo(userId, id, request));
	}

	@DeleteMapping("/{id}")
	public ApiResponse<Void> deleteTodo(
			Authentication authentication,
			@PathVariable Long id
	) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		todoService.deleteTodo(userId, id);
		return ApiResponse.success("투두가 삭제되었습니다.", null);
	}

	@PatchMapping("/{id}/complete")
	public ApiResponse<TodoResponse> toggleComplete(
			Authentication authentication,
			@PathVariable Long id
	) {
		Long userId = SecurityUtils.getCurrentUserId(authentication);
		return ApiResponse.success(todoService.toggleComplete(userId, id));
	}
}
