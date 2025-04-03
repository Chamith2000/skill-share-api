package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateFollowRequestDTO;
import com.paf.skillShareApi.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @PostMapping("/follow-user")
    public ResponseEntity<Void> followUser(@Valid @RequestBody CreateFollowRequestDTO followRequest) {
        followService.followUser(followRequest.getFollowerId(), followRequest.getFolloweeId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unfollow-user")
    public ResponseEntity<Void> unfollowUser(@Valid @RequestBody CreateFollowRequestDTO followRequest) {
        followService.unfollowUser(followRequest.getFollowerId(), followRequest.getFolloweeId());
        return ResponseEntity.ok().build();
    }
}