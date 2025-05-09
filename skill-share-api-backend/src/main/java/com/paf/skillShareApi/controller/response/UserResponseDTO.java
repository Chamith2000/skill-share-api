package com.paf.skillShareApi.controller.response;

import com.paf.skillShareApi.model.SkillLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserResponseDTO {
    private String username;
    private String email;
    private String bio;
    private String profilePhotoUrl;
    private Integer craftTokens;
    private SkillLevel skillLevel;
}
