package com.paf.skillShareApi.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCommentRequestDTO {
    @NotBlank(message = "Comment text cannot be blank")
    @Size(min = 1, max = 500)
    private String text;
}

