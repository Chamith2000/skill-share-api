package com.paf.skillShareApi.exception;

public class FileUploadException extends SkillShareException {
    public FileUploadException(String reason) {
        super("File upload failed: " + reason);
    }
}