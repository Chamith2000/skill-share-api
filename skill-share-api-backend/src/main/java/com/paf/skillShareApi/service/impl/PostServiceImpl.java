package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import com.paf.skillShareApi.exception.InvalidPostContentException;
import com.paf.skillShareApi.exception.PostNotFoundException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Media;
import com.paf.skillShareApi.model.Post;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.MediaRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CloudinaryService;
import com.paf.skillShareApi.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Override
    public ResponseEntity<Map> createPost(CreatePostRequestDTO postRequest) {
        try {
            if (postRequest.getDescription() == null || postRequest.getDescription().isEmpty()) {
                throw new InvalidPostContentException("Description cannot be empty");
            }

            User user = userRepository.findById(postRequest.getUserId())
                    .orElseThrow(() -> new UserNotFoundException(postRequest.getUserId()));

            Post post = new Post();
            post.setUser(user);
            post.setDescription(postRequest.getDescription());
            post.setDate(new Date(System.currentTimeMillis()));
            post = postRepository.save(post); // Save post first to get ID

            // Handle multiple file uploads (up to 3)
            List<String> uploadedUrls = cloudinaryService.uploadMultipleFiles(postRequest.getFiles(), "posts/" + post.getId(), 3);
            for (String url : uploadedUrls) {
                Media media = new Media();
                media.setUrl(url);
                media.setMediaType(url.contains("video") ? "video" : "image"); // Simple detection, improve if needed
                media.setUploadedAt(LocalDateTime.now());
                media.setPost(post);
                media.setCloudinaryPublicId(extractPublicIdFromUrl(url)); // Optional: Store public ID
                mediaRepository.save(media);
            }

            return ResponseEntity.ok().body(Map.of("message", "Post created successfully", "postId", post.getId()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create post: " + e.getMessage());
        }
    }

    // Helper method to extract public ID from URL (simplified, adjust as needed)
    private String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/");
        String lastPart = parts[parts.length - 1];
        return lastPart.substring(0, lastPart.lastIndexOf("."));
    }

    // Other methods remain unchanged or need minor updates
    @Override
    public ResponseEntity<Map> getPost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));
            return ResponseEntity.ok().body(Map.of("post", post, "media", post.getMediaFiles()));
        } catch (PostNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve post: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAll();
            return ResponseEntity.ok().body(Map.of("posts", posts));
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve posts: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> updatePost(Long postId, CreatePostRequestDTO postRequest) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            if (postRequest.getDescription() != null && !postRequest.getDescription().isEmpty()) {
                post.setDescription(postRequest.getDescription());
            }

            if (postRequest.getFiles() != null && !postRequest.getFiles().isEmpty()) {
                List<String> uploadedUrls = cloudinaryService.uploadMultipleFiles(postRequest.getFiles(), "posts/" + post.getId(), 3);
                for (String url : uploadedUrls) {
                    Media media = new Media();
                    media.setUrl(url);
                    media.setMediaType(url.contains("video") ? "video" : "image");
                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);
                    media.setCloudinaryPublicId(extractPublicIdFromUrl(url));
                    mediaRepository.save(media);
                }
            }

            postRepository.save(post);
            return ResponseEntity.ok().body(Map.of("message", "Post updated successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update post: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> deletePost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            // Delete associated media from Cloudinary
            for (Media media : post.getMediaFiles()) {
                if (media.getCloudinaryPublicId() != null) {
                    cloudinaryService.deleteFile(media.getCloudinaryPublicId());
                }
            }

            postRepository.delete(post);
            return ResponseEntity.ok().body(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete post: " + e.getMessage());
        }
    }
}