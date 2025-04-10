package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/{postId}")
    public ResponseEntity<Map> createComment(
            @PathVariable(value = "postId") Long postId,
            @Valid @RequestBody CreateCommentRequestDTO commentRequest) {
        return commentService.createComment(postId, commentRequest);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Map> getAllCommentsByPostId(@PathVariable Long postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PutMapping("/{commentId}/{userId}")
    public ResponseEntity<Map> updateComment(
            @PathVariable Long commentId,
            @PathVariable Long userId,
            @Valid @RequestBody CreateCommentRequestDTO commentRequest) {
        return commentService.updateComment(commentId, userId, commentRequest);
    }

    @DeleteMapping("/{commentId}/{userId}")
    public ResponseEntity<Map> deleteComment(
            @PathVariable Long commentId,
            @PathVariable Long userId) {
        return commentService.deleteComment(commentId, userId);
    }
}
