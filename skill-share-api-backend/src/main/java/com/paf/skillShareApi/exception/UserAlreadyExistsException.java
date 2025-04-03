package com.paf.skillShareApi.exception;

public class UserAlreadyExistsException extends SkillShareException {
    public UserAlreadyExistsException(String username) {
        super("User with username '" + username + "' already exists");
    }
}