package com.paf.skillShareApi.controller.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@RequiredArgsConstructor
public class CreateCommentRequestDTO {
    @NotNull(message = "User ID cannot be null")
    private Long uid;

    @NotBlank(message = "Comment text cannot be blank")
    @Size(min = 1, max = 500, message = "Comment must be between 1 and 500 characters")
    private String text;
}