package com.paf.skillShareApi.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import com.paf.skillShareApi.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

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

//    @Override
//    public ResponseEntity<Map> createPost(CreatePostRequestDTO postRequest, Long userId) {
//        try {
//            if (postRequest.getDescription() == null || postRequest.getDescription().isEmpty()) {
//                throw new InvalidPostContentException("Description cannot be empty");
//            }
//
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new UserNotFoundException("User not found id with : " + userId));
//
//            Post post = new Post();
//            post.setUser(user);
//            post.setDescription(postRequest.getDescription());
//            post.setDate(new Date(System.currentTimeMillis()));
//            post = postRepository.save(post); // Save post first to get ID
//
//            // Handle files without Cloudinary
//            if (postRequest.getFiles() != null && !postRequest.getFiles().isEmpty()) {
//                for (int i = 0; i < Math.min(postRequest.getFiles().size(), 3); i++) {
//                    var file = postRequest.getFiles().get(i);
//                    String filename = file.getOriginalFilename();
//
//                    Media media = new Media();
//                    // Store file locally or use a different service
//                    // Here we just set a placeholder URL
//                    String url = "/uploads/posts/" + post.getId() + "/" + filename;
//                    media.setUrl(url);
//
//                    // Simple type detection
//                    String contentType = file.getContentType();
//                    media.setMediaType(contentType != null && contentType.startsWith("video") ? "video" : "image");
//
//                    media.setUploadedAt(LocalDateTime.now());
//                    media.setPost(post);
//                    mediaRepository.save(media);
//
//                    // Note: You would need to implement actual file storage logic here
//                    // This could involve saving to local filesystem or another cloud storage
//                }
//            }
//
//            return ResponseEntity.ok().body(Map.of("message", "Post created successfully", "postId", post.getId()));
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to create post: " + e.getMessage());
//        }
//    }

    @Override
    public ResponseEntity<Map> createPost(CreatePostRequestDTO postRequest, Long userId) {
        try {
            if (postRequest.getDescription() == null || postRequest.getDescription().isEmpty()) {
                throw new InvalidPostContentException("Description cannot be empty");
            }

            // Check user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

            // Save Post
            Post post = new Post();
            post.setUser(user);
            post.setDescription(postRequest.getDescription());
            post.setDate(new Date(System.currentTimeMillis()));
            post = postRepository.save(post); // Save first to get post ID

            // Upload files to Cloudinary
            if (postRequest.getFiles() != null && !postRequest.getFiles().isEmpty()) {
                for (int i = 0; i < Math.min(postRequest.getFiles().size(), 3); i++) {
                    var file = postRequest.getFiles().get(i);

                    // Upload to Cloudinary
                    Map uploadResult = cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );

                    String uploadedUrl = (String) uploadResult.get("secure_url");

                    Media media = new Media();
                    media.setUrl(uploadedUrl);

                    String contentType = file.getContentType();
                    media.setMediaType(contentType != null && contentType.startsWith("video") ? "video" : "image");

                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);

                    mediaRepository.save(media);
                }
            }

            return ResponseEntity.ok().body(Map.of(
                    "message", "Post created successfully",
                    "postId", post.getId()
            ));

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

            // Create a list to hold post data with media files
            List<Map<String, Object>> postsWithMedia = new ArrayList<>();

            for (Post post : posts) {
                Map<String, Object> postData = new HashMap<>();
                postData.put("id", post.getId());
                postData.put("description", post.getDescription());
                postData.put("date", post.getDate());
                postData.put("user", post.getUser());
                postData.put("mediaFiles", post.getMediaFiles());

                postsWithMedia.add(postData);
            }

            return ResponseEntity.ok().body(Map.of(
                    "message", "Posts retrieved successfully",
                    "posts", postsWithMedia
            ));
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
                for (int i = 0; i < Math.min(postRequest.getFiles().size(), 3); i++) {
                    var file = postRequest.getFiles().get(i);
                    String filename = file.getOriginalFilename();

                    Media media = new Media();
                    // Store file locally or use a different service
                    String url = "/uploads/posts/" + post.getId() + "/" + filename;
                    media.setUrl(url);

                    // Simple type detection
                    String contentType = file.getContentType();
                    media.setMediaType(contentType != null && contentType.startsWith("video") ? "video" : "image");

                    media.setUploadedAt(LocalDateTime.now());
                    media.setPost(post);
                    mediaRepository.save(media);

                    // Note: You would need to implement actual file storage logic here
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

            // No need to delete from Cloudinary anymore
            // Just delete the post from the database
            postRepository.delete(post);
            return ResponseEntity.ok().body(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete post: " + e.getMessage());
        }
    }
}