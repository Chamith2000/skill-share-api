package com.paf.skillShareApi.exception;

public class InvalidEmailFormatException extends SkillShareException {
    public InvalidEmailFormatException(String email) {
        super("Invalid email format: " + email);
    }
}