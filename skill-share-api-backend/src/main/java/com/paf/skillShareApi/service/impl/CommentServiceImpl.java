package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.dto.CommentDTO;
import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateCommentRequestDTO;
import com.paf.skillShareApi.exception.*;
import com.paf.skillShareApi.model.Comment;
import com.paf.skillShareApi.model.Post;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.CommentRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CommentService;
import com.paf.skillShareApi.service.NotificationService;
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

    @Autowired
    private NotificationService notificationService;

    @Override
    public ResponseEntity<Map> createComment(Long postId, CreateCommentRequestDTO commentRequest) {
        if (commentRequest == null || commentRequest.getText() == null || commentRequest.getUid() == null) {
            throw new IllegalArgumentException("Invalid comment request");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        User user = userRepository.findById(commentRequest.getUid())
                .orElseThrow(() -> new UserNotFoundException(commentRequest.getUid()));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setText(commentRequest.getText());
        comment.setCreatedAt(new Date());

        Comment savedComment = commentRepository.save(comment);

        // Create notification for the post owner
        notificationService.createCommentNotification(user, post.getUser().getId());

        return ResponseEntity.ok(Map.of(
                "message", "Comment created successfully",
                "commentId", savedComment.getId()
        ));
    }

    @Override
    public ResponseEntity<Map> getCommentsByPostId(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

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


}