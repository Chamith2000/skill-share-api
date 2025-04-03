package com.paf.skillShareApi.exception;

public class FollowOperationFailedException extends SkillShareException {
    public FollowOperationFailedException(String operation, String reason) {
        super("Failed to " + operation + ": " + reason);
    }
}