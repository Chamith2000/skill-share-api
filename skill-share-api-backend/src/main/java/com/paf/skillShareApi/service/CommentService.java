package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface CommentService {
    ResponseEntity<Map> createComment(Long postId, CreateCommentRequestDTO commentRequest);
    ResponseEntity<Map> getCommentsByPostId(Long postId);
    ResponseEntity<Map> updateComment(Long commentId, Long userId, CreateCommentRequestDTO commentRequest);
    ResponseEntity<Map> deleteComment(Long commentId, Long userId);
}
