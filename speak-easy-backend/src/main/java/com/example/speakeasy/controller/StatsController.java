package com.example.speakeasy.controller;

import com.example.speakeasy.dto.StatsDto;
import com.example.speakeasy.entity.User;
import com.example.speakeasy.repository.UserRepository;
import com.example.speakeasy.service.StatsService;
import com.example.speakeasy.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StatsService statsService;

    @GetMapping
    public StatsDto getStats(@RequestHeader("Authorization") String authorization) {
        String token = authorization.substring(7);
        String username = jwtUtil.validateTokenAndGetUsername(token);
        if (username == null) {
            throw new RuntimeException("无效的 token");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return statsService.getUserStats(user.getId());
    }
}
