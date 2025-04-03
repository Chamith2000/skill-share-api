package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.model.Comment;
import com.paf.skillShareApi.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable(value = "postId") Long postId, @Valid @RequestBody CreateCommentRequestDTO commentRequest) {
        Comment comment = commentService.createComment(postId, commentRequest);
        return ResponseEntity.ok(comment);
    }


    @GetMapping("/{postId}")
    public ResponseEntity<List<Comment>> getAllCommentsByPostId(@PathVariable Long postId) {
        List<Comment> comments = commentService.getAllCommentsByPostId(postId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }


    @PutMapping("/{commentId}/{userId}")
    public ResponseEntity<String> updateComment(@PathVariable Long commentId, @PathVariable Long userId,@Valid @RequestBody CreateCommentRequestDTO commentRequest) {
        boolean updateSuccessful = commentService.updateComment(commentId, userId, commentRequest);
        if (updateSuccessful) {
            return ResponseEntity.ok("Comment updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found or user not authorized to update");
        }
    }

    @DeleteMapping("{commentId}/{userId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId, @PathVariable Long userId) {
        boolean deletionSuccessful = commentService.deleteComment(commentId, userId);
        if (deletionSuccessful) {
            return ResponseEntity.ok("Comment deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found or user not authorized to delete");
        }
    }

}