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
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Comment createComment(Long postId, CreateCommentRequestDTO commentRequest) {
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

            return commentRepository.save(newComment);
        } catch (PostNotFoundException | UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("create", e.getMessage());
        }
    }

    @Override
    public List<Comment> getAllCommentsByPostId(Long postId) {
        // Find the post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        // Query the comment repository
        return commentRepository.findByPost(post);
    }

    @Override
    public boolean updateComment(Long commentId, Long userId, CreateCommentRequestDTO commentRequest) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));

            // Check if the user is authorized to update the comment
            if (!comment.getUser().getId().equals(userId)) {
                throw new UserUnauthorizedException();
            }

            comment.setText(commentRequest.getText());
            commentRepository.save(comment);
            return true;
        } catch (CommentNotFoundException | UserUnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("update", e.getMessage());
        }
    }

    @Override
    public boolean deleteComment(Long commentId, Long userId) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));

            // Check if the user ID matches the owner of the comment
            if (!comment.getUser().getId().equals(userId)) {
                throw new UserUnauthorizedException();
            }

            commentRepository.delete(comment);
            return true;
        } catch (CommentNotFoundException | UserUnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentOperationFailedException("delete", e.getMessage());
        }
    }
}