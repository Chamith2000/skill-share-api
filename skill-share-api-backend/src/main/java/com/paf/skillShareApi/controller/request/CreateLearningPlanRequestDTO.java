package com.paf.skillShareApi.controller.request;

import com.paf.skillShareApi.model.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class CreateLearningPlanRequestDTO {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    private String description;

    @NotNull(message = "Skill level cannot be null")
    private SkillLevel skillLevel;
}