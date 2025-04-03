package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.request.CreateLearningPlanRequestDTO;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.ProgressUpdate;

import java.util.List;

public interface LearningPlanService {
    LearningPlan createLearningPlan(CreateLearningPlanRequestDTO learningPlanRequest);
    LearningPlan getLearningPlan(Long id);
    List<LearningPlan> getAllLearningPlansByUserId(Long userId);
    LearningPlan updateLearningPlan(Long id, CreateLearningPlanRequestDTO learningPlanRequest);
    void deleteLearningPlan(Long id);
    ProgressUpdate addProgressUpdate(Long learningPlanId, String description, Integer completionPercentage);
}