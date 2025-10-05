package com.stationery_management.sm.controller;

import com.stationery_management.sm.dto.RegisterRequest;
import com.stationery_management.sm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class Auth {

    private final UserService userservice;
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        String message = userservice.registerUser(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam String token) {
        String message = userservice.verifyToken(token);
        return ResponseEntity.ok(message);
    }
}
