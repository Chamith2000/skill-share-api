package com.paf.skillShareApi.exception;

public class CommentOperationFailedException extends SkillShareException {
    public CommentOperationFailedException(String operation, String reason) {
        super("Failed to " + operation + " comment: " + reason);
    }
}