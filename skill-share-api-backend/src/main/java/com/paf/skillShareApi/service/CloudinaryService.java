package com.paf.skillShareApi.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CloudinaryService {
    String uploadFile(MultipartFile file, String folderName);
    List<String> uploadMultipleFiles(List<MultipartFile> files, String folderName, int maxFiles);
    void deleteFile(String publicId);
    Map<String, Object> getFileDetails(String publicId);

}