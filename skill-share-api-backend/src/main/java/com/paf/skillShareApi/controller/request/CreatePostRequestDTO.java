package com.paf.skillShareApi.controller.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
public class CreatePostRequestDTO {
    @NotBlank(message = "Description cannot be blank")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private List<MultipartFile> files = new ArrayList<>();
}