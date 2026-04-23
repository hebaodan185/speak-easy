package com.example.speakeasy.controller;

import com.example.speakeasy.entity.CommandLog;
import com.example.speakeasy.entity.User;
import com.example.speakeasy.repository.CommandLogRepository;
import com.example.speakeasy.repository.UserRepository;
import com.example.speakeasy.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/command")
public class CommandController {

    @Autowired
    private CommandLogRepository commandLogRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/log")
    public String logCommand(@RequestHeader("Authorization") String authorization,
                             @RequestBody Map<String, String> payload) {
        // 1. 从 Authorization 头提取 token
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return "未提供有效的认证信息";
        }
        String token = authorization.substring(7);

        // 2. 解析 token 获取用户名
        String username = jwtUtil.validateTokenAndGetUsername(token);
        if (username == null) {
            return "token 无效或已过期";
        }

        // 3. 根据用户名查找用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 4. 保存命令日志
        CommandLog log = new CommandLog();
        log.setUserId(user.getId());
        log.setCommand(payload.get("command"));
        commandLogRepository.save(log);

        return "命令已记录";
    }
}
