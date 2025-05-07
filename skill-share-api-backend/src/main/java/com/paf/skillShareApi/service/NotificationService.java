package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.model.User;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message, String type);


}