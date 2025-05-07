package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.model.User;

public interface NotificationService {
    Notification createLikeNotification(User liker, Long postOwnerId);
}
