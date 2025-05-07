package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateCommentRequestDTO;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface CommentService {
    ResponseEntity<Map> createComment(Long postId, CreateCommentRequestDTO commentRequest);
    ResponseEntity<Map> getCommentsByPostId(Long postId);
    ResponseEntity<Map> updateComment(Long commentId, Long userId, UpdateCommentRequestDTO commentRequest);

}