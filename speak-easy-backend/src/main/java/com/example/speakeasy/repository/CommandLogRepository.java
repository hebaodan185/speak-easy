package com.example.speakeasy.repository;

import com.example.speakeasy.entity.CommandLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CommandLogRepository extends JpaRepository<CommandLog,Long>{
    List<CommandLog> findByUserIdAndExecutedAtBetween(Long userId, LocalDateTime start,LocalDateTime end);
}
