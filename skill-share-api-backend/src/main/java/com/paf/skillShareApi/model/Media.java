package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "media")
@RequiredArgsConstructor
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId; // Unique identifier from Cloudinary

    @Column(name = "url")
    private String url; // Public URL provided by Cloudinary

    @Column(name = "media_type")
    private String mediaType; // "image" or "video"

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonBackReference
    private Post post;
}