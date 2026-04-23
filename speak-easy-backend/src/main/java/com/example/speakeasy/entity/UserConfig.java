package com.example.speakeasy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_config")
public class UserConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;  // 关联的用户ID，每个用户只有一条配置记录

    @Column(columnDefinition = "TEXT")
    private String configJson;  // 存储自定义命令的JSON，例如 {"摸鱼": "close_tab", "开灯": "light_on"}

    private LocalDateTime updatedAt = LocalDateTime.now();

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
