package com.paf.skillShareApi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @ManyToOne
    @JoinColumn(name = "learning_plan_id")
    @JsonIgnore
    private LearningPlan learningPlan;

    @Enumerated(EnumType.STRING)
    private LearningStatus status = LearningStatus.NOT_STARTED;


}
