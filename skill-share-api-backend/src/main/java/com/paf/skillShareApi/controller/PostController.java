package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import com.paf.skillShareApi.service.PostService;
import jakarta.validation.Valid;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/users/{user-id}/posts")
    public ResponseEntity<Map> createPost(
            @ModelAttribute CreatePostRequestDTO postRequest,
            @PathVariable("user-id") Long userId) {
        return postService.createPost(postRequest, userId);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Map> getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @GetMapping("/posts")
    public ResponseEntity<Map> getAllPosts() {
        return postService.getAllPosts();
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Map> updatePost(@PathVariable Long postId, @Valid @RequestBody CreatePostRequestDTO postRequest) throws FileUploadException {
        return postService.updatePost(postId, postRequest);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Map> deletePost(@PathVariable Long postId) {
        return postService.deletePost(postId);
    }
}