package com.paf.skillShareApi.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
@RequiredArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    @Column(name = "is_read") // Match the database column name
    private boolean isRead; // Ensure this field exists

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    // Explicit setter to resolve the compilation error
    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }
}