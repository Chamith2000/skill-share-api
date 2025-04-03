package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
}