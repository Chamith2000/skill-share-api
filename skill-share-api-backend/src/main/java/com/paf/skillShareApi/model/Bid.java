package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bids")
@RequiredArgsConstructor
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String solution;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-bids")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_board_id")
    @JsonBackReference("request board-bids")
    private RequestBoard requestBoard;

    @Column(name = "is_accepted")
    private boolean isAccepted;

    // Explicit setter to resolve the compilation error
    public void setIsAccepted(boolean isAccepted) {
        this.isAccepted = isAccepted;
    }
}