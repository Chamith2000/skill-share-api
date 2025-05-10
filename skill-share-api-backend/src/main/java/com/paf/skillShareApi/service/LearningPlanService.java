package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.request.CreateLearningPlanDTO;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.ProgressUpdate;
import com.paf.skillShareApi.model.Task;

import java.util.List;

public interface LearningPlanService {
    LearningPlan createLearningPlan(CreateLearningPlanDTO learningPlanRequest);
    List<LearningPlan> findAll();
    LearningPlan updatePlan(Long id, CreateLearningPlanDTO learningPlanRequest);
    void deletePlan(Long id);
    Task completeTask(Long taskId);
}
