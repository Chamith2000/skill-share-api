package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.dto.NotificationDTO;
import com.paf.skillShareApi.model.Notification;
import com.paf.skillShareApi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestParam Long userId,
                                                              @RequestParam String message,
                                                              @RequestParam String type) {
        Notification notification = notificationService.createNotification(userId, message, type);
        return ResponseEntity.ok(new NotificationDTO(notification));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUserId(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        List<NotificationDTO> notificationDTOs = notifications.stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notificationDTOs);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}