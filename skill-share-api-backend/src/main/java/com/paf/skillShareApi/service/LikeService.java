package com.paf.skillShareApi.service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface LikeService {
    ResponseEntity<Map> toggleLike(Long postId, Long userId);
    ResponseEntity<Map> getLikeStatus(Long postId, Long userId);
}