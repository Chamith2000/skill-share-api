package com.paf.skillShareApi.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import com.paf.skillShareApi.exception.InvalidPostContentException;
import com.paf.skillShareApi.exception.PostNotFoundException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.*;
import com.paf.skillShareApi.repository.MediaRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.PostService;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public ResponseEntity<Map> createPost(CreatePostRequestDTO postRequest, Long userId) {
        try {
            if (postRequest.getDescription() == null || postRequest.getDescription().isEmpty()) {
                throw new InvalidPostContentException("Description cannot be empty");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

            Post post = new Post();
            post.setUser(user);
            post.setDescription(postRequest.getDescription());
            post.setDate(new Date(System.currentTimeMillis()));
            post = postRepository.save(post);

            if (postRequest.getFiles() != null && !postRequest.getFiles().isEmpty()) {
                for (int i = 0; i < Math.min(postRequest.getFiles().size(), 3); i++) {
                    var file = postRequest.getFiles().get(i);
                    Map uploadResult = cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );

                    String uploadedUrl = (String) uploadResult.get("secure_url");
                    String publicId = (String) uploadResult.get("public_id"); // Get the public_id from Cloudinary

                    Media media = new Media();
                    media.setUrl(uploadedUrl);
                    media.setCloudinaryPublicId(publicId); // Set the public_id
                    String contentType = file.getContentType();
                    media.setMediaType(contentType != null && contentType.startsWith("video") ? "video" : "image");
                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);
                    mediaRepository.save(media);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Post created successfully");
            response.put("postId", post.getId());
            return ResponseEntity.ok().body(response);

        } catch (UserNotFoundException | InvalidPostContentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create post: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Map> getPost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            Map<String, Object> response = new HashMap<>();
            response.put("id", post.getId());
            response.put("description", post.getDescription());
            response.put("date", post.getDate());

            // Add user information including username
            User user = post.getUser();
            if (user != null) {
                response.put("userId", user.getId());
                response.put("username", user.getUsername()); // Add username
            } else {
                response.put("userId", null);
                response.put("username", "Unknown User");
                response.put("tagline", "Business Company");
            }

            List<Map<String, Object>> mediaList = post.getMediaFiles().stream()
                    .map(media -> {
                        Map<String, Object> mediaMap = new HashMap<>();
                        mediaMap.put("url", media.getUrl());
                        mediaMap.put("mediaType", media.getMediaType());
                        mediaMap.put("uploadedAt", media.getUploadedAt());
                        return mediaMap;
                    })
                    .collect(Collectors.toList());
            response.put("media", mediaList);

            response.put("commentCount", post.getComments().size());
            response.put("likeCount", post.getLikes().size());
            response.put("skillLevel", post.getSkillLevel());

            // Add hashtags if available


            return ResponseEntity.ok().body(response);
        } catch (PostNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get post: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Map> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAll();

            if (posts == null) {
                throw new RuntimeException("Post repository returned null");
            }

            List<Map<String, Object>> postList = posts.stream()
                    .map(post -> {
                        try {
                            // Create a HashMap instead of using Map.of()
                            Map<String, Object> postMap = new HashMap<>();

                            // Basic post info
                            postMap.put("id", post.getId());
                            postMap.put("description", post.getDescription() != null ? post.getDescription() : "");
                            postMap.put("date", post.getDate());

                            // Add user information including username
                            User user = post.getUser();
                            if (user != null) {
                                postMap.put("userId", user.getId());
                                postMap.put("username", user.getUsername()); // Add username
                            } else {
                                postMap.put("userId", null);
                                postMap.put("username", "Unknown User");
                                postMap.put("tagline", "Business Company");
                            }

                            // Handle collections with null checks
                            List<Media> mediaFiles = post.getMediaFiles() != null ? post.getMediaFiles() : new ArrayList<>();
                            List<Comment> comments = post.getComments() != null ? post.getComments() : new ArrayList<>();
                            List<Like> likes = post.getLikes() != null ? post.getLikes() : new ArrayList<>();

                            // Add media information
                            List<Map<String, Object>> mediaList = mediaFiles.stream()
                                    .map(media -> {
                                        Map<String, Object> mediaMap = new HashMap<>();
                                        mediaMap.put("url", media.getUrl());
                                        mediaMap.put("mediaType", media.getMediaType());
                                        mediaMap.put("uploadedAt", media.getUploadedAt());
                                        return mediaMap;
                                    })
                                    .collect(Collectors.toList());
                            postMap.put("media", mediaList);
                            postMap.put("mediaCount", mediaFiles.size());

                            postMap.put("commentCount", comments.size());
                            postMap.put("likeCount", likes.size());
                            postMap.put("likes", likes.size());  // Added to match frontend expectation

                            // Skill level with default
                            SkillLevel skillLevel = post.getSkillLevel() != null ? post.getSkillLevel() : SkillLevel.BEGINNER;
                            postMap.put("skillLevel", skillLevel);

                            // Add hashtags if available

                            return postMap;
                        } catch (Exception e) {
                            throw new RuntimeException("Failed to process post with id: " + post.getId(), e);
                        }
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("posts", postList);
            response.put("total", posts.size());

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get all posts: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Map> updatePost(Long postId, CreatePostRequestDTO postRequest) throws FileUploadException {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            if (postRequest.getDescription() != null && !postRequest.getDescription().isEmpty()) {
                post.setDescription(postRequest.getDescription());
            }

            if (postRequest.getFiles() != null && !postRequest.getFiles().isEmpty()) {
                // Delete existing media files from Cloudinary
                for (Media media : post.getMediaFiles()) {
                    String publicId = media.getCloudinaryPublicId();
                    if (publicId != null && !publicId.isEmpty()) {
                        try {
                            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                        } catch (Exception e) {
                            System.err.println("Failed to delete media from Cloudinary with public_id: " + publicId);
                        }
                    }
                }

                mediaRepository.deleteAll(post.getMediaFiles());
                post.getMediaFiles().clear();

                for (int i = 0; i < Math.min(postRequest.getFiles().size(), 3); i++) {
                    var file = postRequest.getFiles().get(i);
                    Map uploadResult = cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );

                    String uploadedUrl = (String) uploadResult.get("secure_url");
                    String publicId = (String) uploadResult.get("public_id");

                    Media media = new Media();
                    media.setUrl(uploadedUrl);
                    media.setCloudinaryPublicId(publicId);
                    String contentType = file.getContentType();
                    media.setMediaType(contentType != null && contentType.startsWith("video") ? "video" : "image");
                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);
                    mediaRepository.save(media);
                }
            }

            postRepository.save(post);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Post updated successfully");
            response.put("postId", post.getId());

            return ResponseEntity.ok().body(response);
        } catch (PostNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new FileUploadException("Failed to update post: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Map> deletePost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new PostNotFoundException(postId));

            // Delete associated media from Cloudinary if public_id exists
            for (Media media : post.getMediaFiles()) {
                String publicId = media.getCloudinaryPublicId();
                if (publicId != null && !publicId.isEmpty()) {
                    try {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    } catch (Exception e) {
                        // Log the error but continue with deletion
                        System.err.println("Failed to delete media from Cloudinary with public_id: " + publicId + ". Error: " + e.getMessage());
                    }
                }
            }

            postRepository.delete(post);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Post deleted successfully");
            response.put("postId", postId);

            return ResponseEntity.ok().body(response);
        } catch (PostNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete post: " + e.getMessage(), e);
        }
    }
}