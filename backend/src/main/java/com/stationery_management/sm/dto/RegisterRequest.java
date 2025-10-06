package com.stationery_management.sm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data   
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullname;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
