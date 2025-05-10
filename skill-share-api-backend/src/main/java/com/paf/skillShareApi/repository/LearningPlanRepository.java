package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    @Query("SELECT t FROM Task t WHERE t.id = :taskId")
    Task findTaskById(@Param("taskId") Long taskId);
    List<LearningPlan> findByUserId(Long userId);

}