package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/posts/{postId}/likes/{userId}")
    public ResponseEntity<Map> toggleLike(
            @PathVariable Long postId,
            @PathVariable Long userId) {
        return likeService.toggleLike(postId, userId);
    }

    @GetMapping("/posts/{postId}/likes/{userId}/status")
    public ResponseEntity<Map> getLikeStatus(
            @PathVariable Long postId,
            @PathVariable Long userId) {
        return likeService.getLikeStatus(postId, userId);
    }


}