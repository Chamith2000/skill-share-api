package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message, String type);
    List<Notification> getNotificationsByUserId(Long userId);
    void markAsRead(Long notificationId);
}