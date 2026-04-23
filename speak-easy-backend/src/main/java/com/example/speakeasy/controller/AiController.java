package com.example.speakeasy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    private final WebClient webClient;

    public AiController() {
        this.webClient = WebClient.builder().build();
    }

    @PostMapping("/chat")
    public Mono<String> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return Mono.just("请提供有效的问题。");
        }

        // 构造 DeepSeek API 请求体
        Map<String, Object> body = new HashMap<>();
        body.put("model", "deepseek-chat");
        body.put("messages", List.of(
                Map.of("role", "system", "content", "你是一个智能语音助手，请用简洁清晰的语言回答用户的问题。"),
                Map.of("role", "user", "content", userMessage)
        ));
        body.put("stream", false);

        return webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "抱歉，我无法理解你的问题。";
                });
    }
}
