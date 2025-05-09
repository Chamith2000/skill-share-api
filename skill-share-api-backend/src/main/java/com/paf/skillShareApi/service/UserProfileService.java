package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.response.UserResponseDTO;
import com.paf.skillShareApi.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserProfileService {
    UserResponseDTO getUserProfile(Long userId);
    UserResponseDTO updateUserProfile(Long userId, User updatedUser);
    String uploadProfileImage(Long userId, MultipartFile image);
    UserResponseDTO updateUserProfileWithImage(Long userId, User updatedUser, MultipartFile image);
}