package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "request_boards")
@RequiredArgsConstructor
public class RequestBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER) // Changed to EAGER to ensure user data is loaded
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-request boards")
    private User user;

    @OneToMany(mappedBy = "requestBoard", cascade = CascadeType.ALL)
    @JsonManagedReference("request board-bids")
    private List<Bid> bids = new ArrayList<>();

    @Column(name = "is_resolved")
    private boolean isResolved;

    // Explicit setter to resolve the compilation error
    public void setIsResolved(boolean isResolved) {
        this.isResolved = isResolved;
    }
}