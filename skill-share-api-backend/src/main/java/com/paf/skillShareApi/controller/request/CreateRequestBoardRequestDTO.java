package com.paf.skillShareApi.controller.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@RequiredArgsConstructor
public class CreateRequestBoardRequestDTO {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;
}