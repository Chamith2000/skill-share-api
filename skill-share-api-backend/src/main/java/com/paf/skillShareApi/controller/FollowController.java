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


}