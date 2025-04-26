package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        User user = userProfileService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/{userId}/full-update", consumes = {"multipart/form-data"})
    public ResponseEntity<User> updateUserProfileWithImage(
            @PathVariable Long userId,
            @RequestPart("user") User updatedUser,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "userId", required = true) Long requestUserId) {

        if (!userId.equals(requestUserId)) {
            return ResponseEntity.status(403).build();
        }

        updatedUser.setId(userId);
        User updated = userProfileService.updateUserProfileWithImage(updatedUser, image);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{userId}/upload-image")
    public ResponseEntity<String> uploadProfileImage(
            @PathVariable Long userId,
            @RequestPart("image") MultipartFile image,
            @RequestHeader(value = "userId", required = true) Long requestUserId) {

        if (!userId.equals(requestUserId)) {
            return ResponseEntity.status(403).build();
        }

        String imageUrl = userProfileService.uploadProfileImage(userId, image);
        return ResponseEntity.ok(imageUrl);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody User updatedUser,
            @RequestHeader(value = "userId", required = true) Long requestUserId) {

        if (!userId.equals(requestUserId)) {
            return ResponseEntity.status(403).build();
        }

        updatedUser.setId(userId);
        User updated = userProfileService.updateUserProfile(updatedUser);
        return ResponseEntity.ok(updated);
    }
}