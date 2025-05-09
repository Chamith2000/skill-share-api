package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.response.ErrorResponse;
import com.paf.skillShareApi.controller.response.UserResponseDTO;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.UnsupportedMediaTypeStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000"}, allowCredentials = "true", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;
    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            logger.info("Fetching profile for userId: {}", userId);
            UserResponseDTO user = userProfileService.getUserProfile(userId);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching profile for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error", e.getMessage()));
        }
    }

    @PatchMapping(value = "/{userId}", consumes = {"application/json"})
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody User updatedUser,
            @RequestHeader(value = "userId", required = true) String requestUserId) {
        try {
            if (!userId.toString().equals(requestUserId)) {
                logger.warn("Unauthorized attempt to update userId {} by requestUserId {}", userId, requestUserId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Unauthorized", "User ID mismatch"));
            }
            logger.info("Updating profile for userId: {}", userId);
            UserResponseDTO updated = userProfileService.updateUserProfile(userId, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (UserNotFoundException e) {
            logger.error("User not found for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));
        } catch (UnsupportedMediaTypeStatusException e) {
            logger.error("Unsupported media type for update userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(new ErrorResponse("Unsupported media type", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating profile for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error", e.getMessage()));
        }
    }

    @PostMapping(value = "/{userId}/upload-image", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long userId,
            @RequestPart("image") MultipartFile image,
            @RequestHeader(value = "userId", required = true) String requestUserId) {
        try {
            if (!userId.toString().equals(requestUserId)) {
                logger.warn("Unauthorized attempt to upload image for userId {} by requestUserId {}", userId, requestUserId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Unauthorized", "User ID mismatch"));
            }
            logger.info("Uploading profile image for userId: {}", userId);
            String imageUrl = userProfileService.uploadProfileImage(userId, image);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid image upload request for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid request", e.getMessage()));
        } catch (UserNotFoundException e) {
            logger.error("User not found for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error uploading profile image for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to upload image", e.getMessage()));
        }
    }

    @PutMapping(value = "/{userId}/full-update", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> updateUserProfileWithImage(
            @PathVariable Long userId,
            @RequestPart("user") User updatedUser,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "userId", required = true) String requestUserId) {
        try {
            if (!userId.toString().equals(requestUserId)) {
                logger.warn("Unauthorized attempt to update userId {} by requestUserId {}", userId, requestUserId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Unauthorized", "User ID mismatch"));
            }
            logger.info("Updating full profile with image for userId: {}", userId);
            UserResponseDTO updated = userProfileService.updateUserProfileWithImage(userId, updatedUser, image);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid full-update request for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid request", e.getMessage()));
        } catch (UserNotFoundException e) {
            logger.error("User not found for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found", e.getMessage()));
        } catch (UnsupportedMediaTypeStatusException e) {
            logger.error("Unsupported media type for full-update userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(new ErrorResponse("Unsupported media type", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating full profile for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error", e.getMessage()));
        }
    }
}