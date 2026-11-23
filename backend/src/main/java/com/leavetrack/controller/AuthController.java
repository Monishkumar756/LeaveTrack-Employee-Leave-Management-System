package com.leavetrack.controller;

import com.leavetrack.dto.JwtResponse;
import com.leavetrack.dto.LoginRequest;
import com.leavetrack.dto.RegisterRequest;
import com.leavetrack.entity.Employee;
import com.leavetrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Employee created = authService.registerUser(registerRequest);
        return new ResponseEntity<>(Map.of(
                "message", "User registered successfully",
                "employeeId", created.getEmployeeId(),
                "email", created.getEmail()
        ), HttpStatus.CREATED);
    }
}
