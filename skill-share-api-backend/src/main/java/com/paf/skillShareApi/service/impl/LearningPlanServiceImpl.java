package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.request.CreateLearningPlanRequestDTO;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.ProgressUpdate;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.LearningPlanRepository;
import com.paf.skillShareApi.repository.ProgressUpdateRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LearningPlanServiceImpl implements LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public LearningPlan createLearningPlan(CreateLearningPlanRequestDTO learningPlanRequest) {
        User user = userRepository.findById(learningPlanRequest.getUserId())
                .orElseThrow(() -> new UserNotFoundException(learningPlanRequest.getUserId()));

        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setTitle(learningPlanRequest.getTitle());
        learningPlan.setDescription(learningPlanRequest.getDescription());
        learningPlan.setSkillLevel(learningPlanRequest.getSkillLevel());
        learningPlan.setUser(user);
        learningPlan.setCreatedAt(LocalDateTime.now());
        learningPlan.setUpdatedAt(LocalDateTime.now());

        return learningPlanRepository.save(learningPlan);
    }

    @Override
    public LearningPlan getLearningPlan(Long id) {
        return learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + id));
    }

    @Override
    public List<LearningPlan> getAllLearningPlansByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return learningPlanRepository.findAll().stream()
                .filter(plan -> plan.getUser().getId().equals(userId))
                .toList();
    }

    @Override
    public LearningPlan updateLearningPlan(Long id, CreateLearningPlanRequestDTO learningPlanRequest) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + id));

        learningPlan.setTitle(learningPlanRequest.getTitle());
        learningPlan.setDescription(learningPlanRequest.getDescription());
        learningPlan.setSkillLevel(learningPlanRequest.getSkillLevel());
        learningPlan.setUpdatedAt(LocalDateTime.now());

        return learningPlanRepository.save(learningPlan);
    }

    @Override
    public void deleteLearningPlan(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + id));
        learningPlanRepository.delete(learningPlan);
    }

    @Override
    public ProgressUpdate addProgressUpdate(Long learningPlanId, String description, Integer completionPercentage) {
        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + learningPlanId));

        ProgressUpdate progressUpdate = new ProgressUpdate();
        progressUpdate.setLearningPlan(learningPlan);
        progressUpdate.setDescription(description);
        progressUpdate.setCompletionPercentage(completionPercentage);
        progressUpdate.setUpdatedAt(LocalDateTime.now());

        return progressUpdateRepository.save(progressUpdate);
    }
}