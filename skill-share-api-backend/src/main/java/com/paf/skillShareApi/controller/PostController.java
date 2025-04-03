package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import com.paf.skillShareApi.service.PostService;
import jakarta.validation.Valid;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/upload")
    public ResponseEntity<Map> upload(@Valid @RequestBody CreatePostRequestDTO postRequest) {
        return postService.createPost(postRequest);
    }

    // Other existing methods remain unchanged
    @GetMapping("/{postId}")
    public ResponseEntity<Map> getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @GetMapping
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