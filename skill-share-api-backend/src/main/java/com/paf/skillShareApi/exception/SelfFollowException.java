package com.paf.skillShareApi.exception;

public class SelfFollowException extends SkillShareException {
    public SelfFollowException() {
        super("Users cannot follow themselves");
    }
}
