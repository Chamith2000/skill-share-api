package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.exception.*;
import com.paf.skillShareApi.model.Comment;
import com.paf.skillShareApi.model.Post;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.CommentRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ResponseEntity<Map> createComment(Long postId, CreateCommentRequestDTO commentRequest) {
        try {
            Comment newComment = new Comment();

            // Find the post and user
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            User user = userRepository.findById(commentRequest.getUid())
                    .orElseThrow(() -> new UserNotFoundException(commentRequest.getUid()));

            // Set the relationships
            newComment.setPost(post);
            newComment.setUser(user);
            newComment.setText(commentRequest.getText());
            newComment.setCreatedAt(new Date(System.currentTimeMillis()));

            Comment savedComment = commentRepository.save(newComment);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Comment created successfully",
                    "commentId", savedComment.getId(),
                    "comment", savedComment
            ));
        } catch (PostNotFoundException | UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("create", e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> getCommentsByPostId(Long postId) {
        try {
            // Find the post
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            // Query the comment repository
            List<Comment> comments = commentRepository.findByPost(post);

            return ResponseEntity.ok().body(Map.of(
                    "comments", comments
            ));
        } catch (PostNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve comments: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> updateComment(Long commentId, Long userId, CreateCommentRequestDTO commentRequest) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));

            // Check if the user is authorized to update the comment
            if (!comment.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "User not authorized to update this comment"));
            }

            comment.setText(commentRequest.getText());
            comment.setUpdatedAt(new Date(System.currentTimeMillis()));
            commentRepository.save(comment);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Comment updated successfully",
                    "commentId", comment.getId()
            ));
        } catch (CommentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("update", e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> deleteComment(Long commentId, Long userId) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));

            // Check if the user ID matches the owner of the comment
            if (!comment.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "User not authorized to delete this comment"));
            }

            commentRepository.delete(comment);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Comment deleted successfully"
            ));
        } catch (CommentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("delete", e.getMessage());
        }
    }
}
