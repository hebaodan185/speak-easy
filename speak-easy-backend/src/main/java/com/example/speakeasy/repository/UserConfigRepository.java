package com.example.speakeasy.repository;

import com.example.speakeasy.entity.UserConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserConfigRepository extends JpaRepository<UserConfig, Long> {
    Optional<UserConfig> findByUserId(Long userId);
}