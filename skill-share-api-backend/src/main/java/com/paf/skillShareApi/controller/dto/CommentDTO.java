package com.paf.skillShareApi.controller.dto;

import com.paf.skillShareApi.model.Comment;
import lombok.Data;

import java.util.Date;

// CommentDTO.java
@Data
public class CommentDTO {
    private Long id;
    private String text;
    private String username;
    private Date createdAt;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        this.username = comment.getUser().getUsername();
        this.createdAt = comment.getCreatedAt();
    }
}

