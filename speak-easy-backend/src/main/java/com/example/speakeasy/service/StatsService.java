package com.example.speakeasy.service;

import com.example.speakeasy.dto.StatsDto;
import com.example.speakeasy.entity.CommandLog;
import com.example.speakeasy.repository.CommandLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private CommandLogRepository commandLogRepository;

    public StatsDto getUserStats(Long userId) {
        // 最近7天的起始时间
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // 查询该用户最近7天的所有命令
        List<CommandLog> logs = commandLogRepository.findByUserIdAndExecutedAtBetween(userId, startDateTime, endDateTime);

        // 1. 按日期分组统计
        Map<String, Long> dailyCount = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
        for (int i = 0; i < 7; i++) {
            String date = startDate.plusDays(i).format(formatter);
            dailyCount.put(date, 0L);
        }
        for (CommandLog log : logs) {
            String date = log.getExecutedAt().toLocalDate().format(formatter);
            dailyCount.put(date, dailyCount.getOrDefault(date, 0L) + 1);
        }

        // 2. 常用命令排行
        Map<String, Long> commandCount = logs.stream()
                .collect(Collectors.groupingBy(CommandLog::getCommand, Collectors.counting()));
        List<StatsDto.CommandCount> topCommands = commandCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new StatsDto.CommandCount(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        StatsDto dto = new StatsDto();
        dto.setDailyCount(dailyCount);
        dto.setTopCommands(topCommands);
        return dto;
    }
}