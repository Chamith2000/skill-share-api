package com.paf.skillShareApi.controller.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class UpdateBidRequestDTO {

    private boolean isAccepted;
    private boolean isResolved;

    @NotBlank(message = "Solution cannot be empty")
    private String solution;

    // Getters and setters
    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }
}