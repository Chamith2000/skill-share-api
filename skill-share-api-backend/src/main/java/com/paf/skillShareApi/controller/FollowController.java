package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.dto.FollowCountsDTO;
import com.paf.skillShareApi.controller.dto.FollowDTO;
import com.paf.skillShareApi.controller.dto.FollowStatusDTO;
import com.paf.skillShareApi.controller.dto.UserSummaryDTO;
import com.paf.skillShareApi.controller.response.FollowResponseDTO;
import com.paf.skillShareApi.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/follows")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping
    public ResponseEntity<FollowResponseDTO> followUser(@RequestBody FollowDTO followDTO) {
        FollowResponseDTO response = followService.followUser(followDTO.getFollowerId(), followDTO.getFolloweeId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{followerId}/{followeeId}")
    public ResponseEntity<FollowResponseDTO> unfollowUser(
            @PathVariable Long followerId,
            @PathVariable Long followeeId) {
        FollowResponseDTO response = followService.unfollowUser(followerId, followeeId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/status/{followerId}/{followeeId}")
    public ResponseEntity<FollowStatusDTO> checkFollowStatus(
            @PathVariable Long followerId,
            @PathVariable Long followeeId) {
        boolean isFollowing = followService.isFollowing(followerId, followeeId);
        FollowStatusDTO status = new FollowStatusDTO(isFollowing);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<UserSummaryDTO>> getFollowers(@PathVariable Long userId) {
        List<UserSummaryDTO> followers = followService.getFollowers(userId);
        return new ResponseEntity<>(followers, HttpStatus.OK);
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<UserSummaryDTO>> getFollowing(@PathVariable Long userId) {
        List<UserSummaryDTO> following = followService.getFollowing(userId);
        return new ResponseEntity<>(following, HttpStatus.OK);
    }

    @GetMapping("/counts/{userId}")
    public ResponseEntity<FollowCountsDTO> getFollowCounts(@PathVariable Long userId) {
        FollowCountsDTO counts = followService.getFollowCounts(userId);
        return new ResponseEntity<>(counts, HttpStatus.OK);
    }
}