package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.PostNotFoundException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Like;
import com.paf.skillShareApi.model.Post;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.LikeRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.LikeService;
import com.paf.skillShareApi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public ResponseEntity<Map> toggleLike(Long postId, Long userId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

            // Check if the like already exists
            Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);

            if (existingLike.isPresent()) {
                // User already liked the post, so remove the like
                likeRepository.delete(existingLike.get());

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Like removed successfully");
                response.put("liked", false);
                response.put("likeCount", likeRepository.countByPostId(postId));

                return ResponseEntity.ok().body(response);
            } else {
                // User hasn't liked the post yet, so add a like
                Like newLike = new Like();
                newLike.setPost(post);
                newLike.setUser(user);
                newLike.setCreatedAt(new Date()); // Set current timestamp
                likeRepository.save(newLike);

                // Create notification for the post owner
                notificationService.createLikeNotification(user, post.getUser().getId());

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Post liked successfully");
                response.put("liked", true);
                response.put("likeCount", likeRepository.countByPostId(postId));

                return ResponseEntity.ok().body(response);
            }
        } catch (PostNotFoundException | UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace(); // Add this to see the detailed error in logs
            throw new RuntimeException("Failed to toggle like: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Map> getLikeStatus(Long postId, Long userId) {
        try {
            boolean isLiked = likeRepository.existsByPostIdAndUserId(postId, userId);
            long likeCount = likeRepository.countByPostId(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("liked", isLiked);
            response.put("likeCount", likeCount);

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get like status: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Map> getLikeCount(Long postId) {
        try {
            long likeCount = likeRepository.countByPostId(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("likeCount", likeCount);

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get like count: " + e.getMessage(), e);
        }
    }
}