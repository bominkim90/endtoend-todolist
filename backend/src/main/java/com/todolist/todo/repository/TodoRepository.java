package com.todolist.todo.repository;

import com.todolist.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * todos 테이블 JPA 접근
 */
public interface TodoRepository extends JpaRepository<Todo, Long> {

	List<Todo> findByUser_IdOrderByCreatedAtDesc(Long userId);

	Optional<Todo> findByIdAndUser_Id(Long id, Long userId);
}
