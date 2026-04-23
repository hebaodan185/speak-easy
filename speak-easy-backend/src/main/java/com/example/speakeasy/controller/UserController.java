package com.example.speakeasy.controller;


import com.example.speakeasy.dto.LoginRequest;
import com.example.speakeasy.dto.LoginResponse;
import com.example.speakeasy.entity.User;
import com.example.speakeasy.repository.UserRepository;
import com.example.speakeasy.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // 注册
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "用户名已存在";
        }
        userRepository.save(user);
        return "注册成功";
    }

    // 登录
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, "登录成功");
    }
}