package com.example.speakeasy.controller;

import com.example.speakeasy.entity.User;
import com.example.speakeasy.entity.UserConfig;
import com.example.speakeasy.repository.UserConfigRepository;
import com.example.speakeasy.repository.UserRepository;
import com.example.speakeasy.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/config")
public class UserConfigController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserConfigRepository userConfigRepository;

    // 获取当前用户的配置
    @GetMapping
    public Map<String, Object> getConfig(@RequestHeader("Authorization") String authorization) {
        String token = authorization.substring(7);
        String username = jwtUtil.validateTokenAndGetUsername(token);
        if (username == null) {
            throw new RuntimeException("token无效");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        UserConfig config = userConfigRepository.findByUserId(user.getId()).orElse(null);
        Map<String, Object> response = new HashMap<>();
        if (config != null) {
            response.put("config", config.getConfigJson());
        } else {
            response.put("config", "{}"); // 空配置
        }
        return response;
    }

    // 保存或更新当前用户的配置
    @PostMapping
    public String saveConfig(@RequestHeader("Authorization") String authorization,
                             @RequestBody Map<String, String> payload) {
        String token = authorization.substring(7);
        String username = jwtUtil.validateTokenAndGetUsername(token);
        if (username == null) {
            throw new RuntimeException("token无效");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        String configJson = payload.get("config");
        UserConfig config = userConfigRepository.findByUserId(user.getId()).orElse(new UserConfig());
        config.setUserId(user.getId());
        config.setConfigJson(configJson);
        config.setUpdatedAt(java.time.LocalDateTime.now());
        userConfigRepository.save(config);

        return "配置已保存";
    }
}
