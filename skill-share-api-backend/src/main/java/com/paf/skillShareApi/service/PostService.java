package com.paf.skillShareApi.service;
import com.paf.skillShareApi.controller.request.CreatePostRequestDTO;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface PostService {
    public ResponseEntity<Map> createPost(CreatePostRequestDTO postRequest);
    public ResponseEntity<Map> getPost(Long postId);
    ResponseEntity<Map> getAllPosts();
    public ResponseEntity<Map> updatePost(Long postId, CreatePostRequestDTO postRequest) throws FileUploadException;
    public ResponseEntity<Map> deletePost(Long postId);
}