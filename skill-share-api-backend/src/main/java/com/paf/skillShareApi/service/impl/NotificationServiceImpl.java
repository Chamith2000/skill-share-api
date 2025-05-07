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




}