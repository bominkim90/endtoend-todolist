package com.todolist.todo.service;

import com.todolist.common.exception.BusinessException;
import com.todolist.common.exception.ErrorCode;
import com.todolist.todo.dto.TodoCreateRequest;
import com.todolist.todo.dto.TodoResponse;
import com.todolist.todo.dto.TodoUpdateRequest;
import com.todolist.todo.entity.Todo;
import com.todolist.todo.repository.TodoRepository;
import com.todolist.user.entity.User;
import com.todolist.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 투두 CRUD 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

	private final TodoRepository todoRepository;
	private final UserService userService;

	public List<TodoResponse> getMyTodos(Long userId) {
		return todoRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
				.map(TodoResponse::from)
				.toList();
	}

	public TodoResponse getTodo(Long userId, Long todoId) {
		Todo todo = getTodoOwnedByUser(userId, todoId);
		return TodoResponse.from(todo);
	}

	@Transactional
	public TodoResponse createTodo(Long userId, TodoCreateRequest request) {
		User user = userService.getUserById(userId);

		Todo todo = Todo.builder()
				.user(user)
				.title(request.getTitle())
				.content(request.getContent())
				.build();

		Todo saved = todoRepository.save(todo);
		return TodoResponse.from(saved);
	}

	@Transactional
	public TodoResponse updateTodo(Long userId, Long todoId, TodoUpdateRequest request) {
		Todo todo = getTodoOwnedByUser(userId, todoId);
		todo.update(request.getTitle(), request.getContent());
		return TodoResponse.from(todo);
	}

	@Transactional
	public void deleteTodo(Long userId, Long todoId) {
		Todo todo = getTodoOwnedByUser(userId, todoId);
		todoRepository.delete(todo);
	}

	@Transactional
	public TodoResponse toggleComplete(Long userId, Long todoId) {
		Todo todo = getTodoOwnedByUser(userId, todoId);
		todo.toggleComplete();
		return TodoResponse.from(todo);
	}

	private Todo getTodoOwnedByUser(Long userId, Long todoId) {
		return todoRepository.findByIdAndUser_Id(todoId, userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "투두를 찾을 수 없습니다."));
	}
}
