package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateCommentRequestDTO;
import com.paf.skillShareApi.exception.CommentNotFoundException;
import com.paf.skillShareApi.exception.PostNotFoundException;
import com.paf.skillShareApi.exception.UserNotAuthorizedException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
        try {
            return commentService.createComment(postId, commentRequest);
        } catch (PostNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found", "details", e.getMessage()));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found", "details", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request", "details", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "details", e.getMessage()));
        }
    }

    // Existing route: GET /comments/{postId}
    @GetMapping("/{postId}")
    public ResponseEntity<Map> getAllCommentsByPostId(@PathVariable Long postId) {
        try {
            return commentService.getCommentsByPostId(postId);
        } catch (PostNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found", "details", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "details", e.getMessage()));
        }
    }



}