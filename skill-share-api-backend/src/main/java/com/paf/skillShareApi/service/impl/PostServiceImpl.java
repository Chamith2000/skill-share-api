package com.paf.skillShareApi.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import com.paf.skillShareApi.exception.InvalidMediaException;
import com.paf.skillShareApi.exception.InvalidPostContentException;
import com.paf.skillShareApi.exception.PostNotFoundException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.*;
import com.paf.skillShareApi.repository.MediaRepository;
import com.paf.skillShareApi.repository.PostRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.PostService;
import org.apache.commons.codec.EncoderException;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ws.schild.jave.MultimediaObject;
import ws.schild.jave.info.MultimediaInfo;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    // Add the missing constant declaration
    private static final int MAX_VIDEO_DURATION_SECONDS = 30; // 1 minute max duration

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
                    MultipartFile file = postRequest.getFiles().get(i);
                    String contentType = file.getContentType();
                    boolean isVideo = contentType != null && contentType.startsWith("video");

                    // Validate video duration
                    if (isVideo) {
                        validateVideoDuration(file);
                    }

                    Map uploadOptions = new HashMap();
                    if (isVideo) {
                        // Set specific options for video uploads if needed
                        uploadOptions.put("resource_type", "video");
                    }

                    Map uploadResult = cloudinary.uploader().upload(
                            file.getBytes(),
                            uploadOptions
                    );

                    String uploadedUrl = (String) uploadResult.get("secure_url");
                    String publicId = (String) uploadResult.get("public_id");

                    Media media = new Media();
                    media.setUrl(uploadedUrl);
                    media.setCloudinaryPublicId(publicId);
                    media.setMediaType(isVideo ? "video" : "image");
                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);
                    mediaRepository.save(media);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Post created successfully");
            response.put("postId", post.getId());
            return ResponseEntity.ok().body(response);

        } catch (UserNotFoundException | InvalidPostContentException | InvalidMediaException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create post: " + e.getMessage(), e);
        }
    }

    private void validateVideoDuration(MultipartFile videoFile) throws InvalidMediaException {
        if (videoFile == null || !videoFile.getContentType().startsWith("video")) {
            return;
        }

        File tempFile = null;
        try {
            // Create a temporary file
            tempFile = File.createTempFile("video-upload", ".tmp");
            FileOutputStream fos = new FileOutputStream(tempFile);
            fos.write(videoFile.getBytes());
            fos.close();

            // Get video duration using jave library
            MultimediaObject multimediaObject = new MultimediaObject(tempFile);
            MultimediaInfo info = multimediaObject.getInfo();
            long durationInSeconds = info.getDuration() / 1000;

            if (durationInSeconds > MAX_VIDEO_DURATION_SECONDS) {
                throw new InvalidMediaException("Video duration exceeds maximum allowed limit of " +
                        MAX_VIDEO_DURATION_SECONDS + " seconds (Actual: " +
                        durationInSeconds + " seconds)");
            }
        } catch (IOException | ws.schild.jave.EncoderException e) {
            throw new InvalidMediaException("Failed to validate video file: " + e.getMessage());
        } finally {
            // Clean up the temporary file
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
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