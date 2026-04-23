package com.example.speakeasy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="command_log")
public class CommandLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false,length = 500)
    private String command;

    private LocalDateTime executedAt=LocalDateTime.now();

    //getter/setter
    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public Long getUserId(){return userId;}
    public void setUserId(Long userId){this.userId=userId;}
    public String getCommand(){return command;}
    public void setCommand(String command){this.command=command;}
    public LocalDateTime getExecutedAt(){return executedAt;}
    public void setExecutedAt(LocalDateTime executedAt){this.executedAt=executedAt;}
}
