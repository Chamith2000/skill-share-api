package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "posts")
@Data
@RequiredArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private String url; // Optional: Could be removed if all media is in Media entity

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-posts")
    private User user;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @JsonManagedReference("post-comments")
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Media> mediaFiles = new ArrayList<>(); // List of Cloudinary-stored media

    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;
}