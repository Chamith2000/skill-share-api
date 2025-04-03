package com.paf.skillShareApi.controller.response;

import lombok.Data;

@Data
public class ErrorResponse {
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
