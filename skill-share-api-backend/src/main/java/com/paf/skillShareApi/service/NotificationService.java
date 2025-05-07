package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.model.User;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message, String type);
    Notification createLikeNotification(User liker, Long postOwnerId);
    Notification createCommentNotification(User commenter, Long postOwnerId);
    Notification createFollowNotification(User follower, User followee);
    List<Notification> getNotificationsByUserId(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
