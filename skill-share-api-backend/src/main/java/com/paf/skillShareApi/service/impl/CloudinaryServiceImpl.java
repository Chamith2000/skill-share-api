package com.paf.skillShareApi.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.paf.skillShareApi.exception.FileUploadException;
import com.paf.skillShareApi.service.CloudinaryService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Resource
    private Cloudinary cloudinary;

    /**
     * Uploads a single file to Cloudinary.
     * @param file The file to upload
     * @param folderName The folder in Cloudinary where the file will be stored
     * @return The secure URL of the uploaded file
     * @throws FileUploadException if the upload fails
     */
    @Override
    public String uploadFile(MultipartFile file, String folderName) {
        try {
            if (file == null || file.isEmpty()) {
                throw new FileUploadException("File cannot be null or empty");
            }

            Map<Object, Object> options = new HashMap<>();
            options.put("folder", folderName);
            options.put("resource_type", "auto"); // Automatically detect image or video
            options.put("secure", true); // Ensure HTTPS URLs

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String publicId = (String) uploadResult.get("public_id");
            String format = (String) uploadResult.get("format");
            String resourceType = (String) uploadResult.get("resource_type");

            // Generate the appropriate URL based on resource type
            if ("video".equals(resourceType)) {
                return cloudinary.url().resourceType("video").format(format).secure(true).generate(publicId);
            } else {
                return cloudinary.url().secure(true).generate(publicId);
            }
        } catch (IOException e) {
            throw new FileUploadException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Uploads multiple files to Cloudinary with a maximum limit.
     * @param files List of files to upload
     * @param folderName The folder in Cloudinary where the files will be stored
     * @param maxFiles Maximum number of files allowed (e.g., 3 for ArtHive)
     * @return List of secure URLs for the uploaded files
     * @throws FileUploadException if the upload fails or exceeds the max limit
     */
    @Override
    public List<String> uploadMultipleFiles(List<MultipartFile> files, String folderName, int maxFiles) {
        try {
            if (files == null || files.isEmpty()) {
                throw new FileUploadException("File list cannot be null or empty");
            }

            if (files.size() > maxFiles) {
                throw new FileUploadException("Cannot upload more than " + maxFiles + " files");
            }

            List<String> uploadedUrls = new ArrayList<>();
            Map<Object, Object> options = new HashMap<>();
            options.put("folder", folderName);
            options.put("resource_type", "auto");
            options.put("secure", true);

            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
                    String publicId = (String) uploadResult.get("public_id");
                    String format = (String) uploadResult.get("format");
                    String resourceType = (String) uploadResult.get("resource_type");

                    String url;
                    if ("video".equals(resourceType)) {
                        url = cloudinary.url().resourceType("video").format(format).secure(true).generate(publicId);
                    } else {
                        url = cloudinary.url().secure(true).generate(publicId);
                    }
                    uploadedUrls.add(url);
                }
            }

            return uploadedUrls;
        } catch (IOException e) {
            throw new FileUploadException("Failed to upload multiple files to Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Deletes a file from Cloudinary using its public ID.
     * @param publicId The public ID of the file to delete
     * @throws FileUploadException if the deletion fails
     */
    @Override
    public void deleteFile(String publicId) {
        try {
            if (publicId == null || publicId.isEmpty()) {
                throw new FileUploadException("Public ID cannot be null or empty");
            }

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            if (!"ok".equals(result.get("result"))) {
                throw new FileUploadException("Failed to delete file with public ID: " + publicId);
            }
        } catch (Exception e) {
            throw new FileUploadException("Error deleting file from Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Retrieves details of a file stored in Cloudinary.
     * @param publicId The public ID of the file
     * @return Map containing file details (e.g., URL, type, size)
     * @throws FileUploadException if the file is not found or retrieval fails
     */
    @Override
    public Map<String, Object> getFileDetails(String publicId) {
        try {
            if (publicId == null || publicId.isEmpty()) {
                throw new FileUploadException("Public ID cannot be null or empty");
            }

            Map<String, Object> result = cloudinary.api().resource(publicId, ObjectUtils.asMap("resource_type", "auto"));
            Map<String, Object> details = new HashMap<>();
            details.put("url", result.get("secure_url"));
            details.put("resource_type", result.get("resource_type"));
            details.put("bytes", result.get("bytes"));
            details.put("width", result.get("width"));
            details.put("height", result.get("height"));

            return details;
        } catch (Exception e) {
            throw new FileUploadException("Failed to retrieve file details for public ID " + publicId + ": " + e.getMessage());
        }
    }
}