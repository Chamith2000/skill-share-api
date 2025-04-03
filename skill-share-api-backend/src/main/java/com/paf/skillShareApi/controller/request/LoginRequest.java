package com.paf.skillShareApi.controller.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@RequiredArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;
}