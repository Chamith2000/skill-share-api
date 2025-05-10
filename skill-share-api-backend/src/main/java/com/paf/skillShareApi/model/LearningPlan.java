package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "learning_plans")
@RequiredArgsConstructor
public class LearningPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
//    @JsonBackReference("user-learningplans")
    private User user;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "resources", nullable = false)
    private List<String> resources= new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-learning plans")
    private User user;


    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();
}