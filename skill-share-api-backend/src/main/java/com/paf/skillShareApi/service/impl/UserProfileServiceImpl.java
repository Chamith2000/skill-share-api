package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CloudinaryService;
import com.paf.skillShareApi.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private static final Logger logger = LoggerFactory.getLogger(UserProfileServiceImpl.class);

    private static final String PROFILE_IMAGES_FOLDER = "profile-images";

    @Override
    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    @Override
    public User updateUserProfile(User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new UserNotFoundException(updatedUser.getId()));

        if (updatedUser.getPassword() == null || updatedUser.getPassword().isBlank()) {
            updatedUser.setPassword(existingUser.getPassword());
        }

        if (updatedUser.getProfileImageUrl() == null) {
            updatedUser.setProfileImageUrl(existingUser.getProfileImageUrl());
        }

        if (updatedUser.getCraftTokens() == null) {
            updatedUser.setCraftTokens(existingUser.getCraftTokens());
        }

        if (updatedUser.getUsername() == null) {
            updatedUser.setUsername(existingUser.getUsername());
        }

        if (updatedUser.getEmail() == null) {
            updatedUser.setEmail(existingUser.getEmail());
        }

        if (updatedUser.getBio() == null) {
            updatedUser.setBio(existingUser.getBio());
        }

        if (updatedUser.getSkillLevel() == null) {
            updatedUser.setSkillLevel(existingUser.getSkillLevel());
        }

        return userRepository.save(updatedUser);
    }

    @Override
    public String uploadProfileImage(Long userId, MultipartFile image) {
        try {
            logger.info("Starting profile image upload for user: {}", userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            if (image == null || image.isEmpty()) {
                throw new IllegalArgumentException("Image file cannot be empty");
            }

            String imageUrl = cloudinaryService.uploadFile(image, PROFILE_IMAGES_FOLDER);
            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            return imageUrl;
        } catch (Exception e) {
            logger.error("Error uploading profile image for user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public User updateUserProfileWithImage(User updatedUser, MultipartFile image) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new UserNotFoundException(updatedUser.getId()));

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(image, PROFILE_IMAGES_FOLDER);
            updatedUser.setProfileImageUrl(imageUrl);
        } else {
            updatedUser.setProfileImageUrl(existingUser.getProfileImageUrl());
        }

        if (updatedUser.getPassword() == null) {
            updatedUser.setPassword(existingUser.getPassword());
        }

        if (updatedUser.getUsername() == null) {
            updatedUser.setUsername(existingUser.getUsername());
        }

        if (updatedUser.getEmail() == null) {
            updatedUser.setEmail(existingUser.getEmail());
        }

        if (updatedUser.getBio() == null) {
            updatedUser.setBio(existingUser.getBio());
        }

        if (updatedUser.getSkillLevel() == null) {
            updatedUser.setSkillLevel(existingUser.getSkillLevel());
        }

        if (updatedUser.getCraftTokens() == null) {
            updatedUser.setCraftTokens(existingUser.getCraftTokens());
        }

        return userRepository.save(updatedUser);
    }
}
