package com.paf.skillShareApi.exception;

public class UserUnauthorizedException extends SkillShareException {
    public UserUnauthorizedException() {
        super("User is not authorized to perform this action");
    }
}