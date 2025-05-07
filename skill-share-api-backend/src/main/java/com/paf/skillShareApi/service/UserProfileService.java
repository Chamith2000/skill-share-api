package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserProfileService {
    User getUserProfile(Long userId);
    User updateUserProfile(User updatedUser);
    String uploadProfileImage(Long userId, MultipartFile image);
    User updateUserProfileWithImage(User updatedUser, MultipartFile image);

}

