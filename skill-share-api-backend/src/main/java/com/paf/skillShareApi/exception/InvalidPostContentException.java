package com.paf.skillShareApi.exception;

public class InvalidPostContentException extends SkillShareException {
    public InvalidPostContentException(String reason) {
        super("Invalid post content: " + reason);
    }
}