package com.paf.skillShareApi.controller.request;

import com.paf.skillShareApi.controller.dto.TaskDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
public class CreateLearningPlanDTO {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotBlank(message = "topic is required")
    @Size(max = 50, message = "topic must be less than 100 characters")
    private String topic;

    private List<String> resources= new ArrayList<>();

    private List<TaskDTO> tasks; 
        
    

}