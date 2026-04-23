package com.example.speakeasy.dto;

import java.util.List;
import java.util.Map;

public class StatsDto {
    private Map<String, Long> dailyCount;  // 日期 -> 命令数量
    private List<CommandCount> topCommands; // 常用命令排行

    // 内部类
    public static class CommandCount {
        private String command;
        private long count;

        public CommandCount(String command, long count) {
            this.command = command;
            this.count = count;
        }
        // getters and setters
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    // getters and setters
    public Map<String, Long> getDailyCount() { return dailyCount; }
    public void setDailyCount(Map<String, Long> dailyCount) { this.dailyCount = dailyCount; }
    public List<CommandCount> getTopCommands() { return topCommands; }
    public void setTopCommands(List<CommandCount> topCommands) { this.topCommands = topCommands; }
}
