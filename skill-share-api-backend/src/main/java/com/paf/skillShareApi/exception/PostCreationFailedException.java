package com.paf.skillShareApi.exception;

public class PostCreationFailedException extends SkillShareException {
    public PostCreationFailedException(String reason) {
        super("Failed to create post: " + reason);
    }
}