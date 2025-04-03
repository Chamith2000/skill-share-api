package com.paf.skillShareApi.exception;

public class PostNotFoundException extends SkillShareException {
    public PostNotFoundException(Long postId) {
        super("Post not found with ID: " + postId);
    }
}