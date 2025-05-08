package com.paf.skillShareApi.controller.dto;

import com.paf.skillShareApi.model.Comment;
import lombok.Data;

import java.util.Date;

@Data
public class CommentDTO {
    private Long id;
    private String text;
    private String username;
    private UserDTO user; // Nested user object to include user.id
    private Date createdAt;
    private Date updatedAt;

    @Data
    public static class UserDTO {
        private Long id;
        private String username;

        public UserDTO(Long id, String username) {
            this.id = id;
            this.username = username;
        }
    }

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        this.username = comment.getUser().getUsername();
        this.user = new UserDTO(comment.getUser().getId(), comment.getUser().getUsername());
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}