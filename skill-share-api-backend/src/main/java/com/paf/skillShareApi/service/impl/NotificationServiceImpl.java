package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.model.NotificationType;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.NotificationRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Notification createNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(NotificationType.valueOf(type.toUpperCase()));
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification createLikeNotification(User liker, Long postOwnerId) {
        User postOwner = userRepository.findById(postOwnerId)
                .orElseThrow(() -> new UserNotFoundException(postOwnerId));

        // Don't create notification if user likes their own post
        if (liker.getId().equals(postOwnerId)) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(postOwner);
        notification.setMessage(String.format("%s liked your post", liker.getUsername()));
        notification.setType(NotificationType.LIKE);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification createCommentNotification(User commenter, Long postOwnerId) {
        User postOwner = userRepository.findById(postOwnerId)
                .orElseThrow(() -> new UserNotFoundException(postOwnerId));

        // Don't create notification if user comments on their own post
        if (commenter.getId().equals(postOwnerId)) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(postOwner);
        notification.setMessage(String.format("%s commented on your post", commenter.getUsername()));
        notification.setType(NotificationType.COMMENT);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification createFollowNotification(User follower, User followee) {
        Notification notification = new Notification();
        notification.setUser(followee);
        notification.setMessage(String.format("%s started following you", follower.getUsername()));
        notification.setType(NotificationType.FOLLOW);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
}