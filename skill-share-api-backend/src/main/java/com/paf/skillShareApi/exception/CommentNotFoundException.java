package com.paf.skillShareApi.exception;

public class CommentNotFoundException extends SkillShareException {
    public CommentNotFoundException(Long commentId) {
        super("Comment not found with ID: " + commentId);
    }
}