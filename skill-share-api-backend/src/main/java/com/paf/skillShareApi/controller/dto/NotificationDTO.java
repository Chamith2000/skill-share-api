package com.paf.skillShareApi.controller.dto;

import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private NotificationType type;
    private Long userId;

    // Constructor to convert from entity to DTO
    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.createdAt = notification.getCreatedAt();
        this.type = notification.getType();
        if (notification.getUser() != null) {
            this.userId = notification.getUser().getId();
        }
    }
}