package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.response.UserResponseDTO;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CloudinaryService;
import com.paf.skillShareApi.service.UserProfileService;
import com.cloudinary.Transformation;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private static final Logger logger = LoggerFactory.getLogger(UserProfileServiceImpl.class);

    private static final String PROFILE_IMAGES_FOLDER = "profile-images";
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"};

    @Override
    public UserResponseDTO getUserProfile(Long userId) {
        logger.info("Fetching user profile for userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return convertToUserResponseDTO(user);
    }

    @Override
    public UserResponseDTO updateUserProfile(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }
        if (updatedUser.getSkillLevel() != null) {
            existingUser.setSkillLevel(updatedUser.getSkillLevel());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(updatedUser.getPassword()); // Consider using PasswordEncoder
        }
        if (updatedUser.getCraftTokens() != null) {
            existingUser.setCraftTokens(updatedUser.getCraftTokens());
        }
        if (updatedUser.getProfileImageUrl() != null) {
            existingUser.setProfileImageUrl(updatedUser.getProfileImageUrl());
        }

        User savedUser = userRepository.save(existingUser);
        return convertToUserResponseDTO(savedUser);
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

            String contentType = image.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                throw new IllegalArgumentException("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
            }

            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("folder", PROFILE_IMAGES_FOLDER);
            uploadOptions.put("transformation", new Transformation().width(150).height(150).crop("fill"));
            String imageUrl = cloudinaryService.uploadFile(image, uploadOptions.toString());
            if (imageUrl == null || imageUrl.isEmpty()) {
                throw new RuntimeException("Failed to upload image to Cloudinary");
            }

            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);
            logger.info("Profile image uploaded successfully for user: {}. URL: {}", userId, imageUrl);
            return imageUrl;
        } catch (Exception e) {
            logger.error("Error uploading profile image for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage(), e);
        }
    }

    @Override
    public UserResponseDTO updateUserProfileWithImage(Long userId, User updatedUser, MultipartFile image) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (image != null && !image.isEmpty()) {
            String contentType = image.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                throw new IllegalArgumentException("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
            }

            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("folder", PROFILE_IMAGES_FOLDER);
            uploadOptions.put("transformation", new Transformation().width(150).height(150).crop("fill"));
            String imageUrl = cloudinaryService.uploadFile(image, uploadOptions.toString());
            if (imageUrl == null || imageUrl.isEmpty()) {
                throw new RuntimeException("Failed to upload image to Cloudinary");
            }
            existingUser.setProfileImageUrl(imageUrl);
        }

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }
        if (updatedUser.getSkillLevel() != null) {
            existingUser.setSkillLevel(updatedUser.getSkillLevel());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(updatedUser.getPassword()); // Consider using PasswordEncoder
        }
        if (updatedUser.getCraftTokens() != null) {
            existingUser.setCraftTokens(updatedUser.getCraftTokens());
        }

        User savedUser = userRepository.save(existingUser);
        return convertToUserResponseDTO(savedUser);
    }

    private UserResponseDTO convertToUserResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setSkillLevel(user.getSkillLevel());
        dto.setCraftTokens(user.getCraftTokens());
        dto.setProfilePhotoUrl(user.getProfileImageUrl());
        return dto;
    }

    private boolean isValidImageType(String contentType) {
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }
}