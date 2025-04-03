package com.paf.skillShareApi.service;


import com.paf.skillShareApi.controller.request.CreateCommentRequestDTO;
import com.paf.skillShareApi.model.Comment;

import java.util.List;

public interface CommentService {
    Comment createComment(Long postId, CreateCommentRequestDTO commentRequest);
    List<Comment> getAllCommentsByPostId(Long postId);
    boolean deleteComment(Long commentId, Long userId);
    boolean updateComment(Long commentId, Long userId, CreateCommentRequestDTO commentRequest);
}