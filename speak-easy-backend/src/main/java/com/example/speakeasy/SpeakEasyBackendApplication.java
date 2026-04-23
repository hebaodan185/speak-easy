package com.example.speakeasy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;


@SpringBootApplication
@CrossOrigin(origins="*")
public class SpeakEasyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpeakEasyBackendApplication.class, args);
    }

}
