package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateLearningPlanRequestDTO;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.ProgressUpdate;
import com.paf.skillShareApi.service.LearningPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@CrossOrigin(origins = "http://localhost:3000")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@Valid @RequestBody CreateLearningPlanRequestDTO request) {
        LearningPlan learningPlan = learningPlanService.createLearningPlan(request);
        return ResponseEntity.ok(learningPlan);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlan(@PathVariable Long id) {
        LearningPlan learningPlan = learningPlanService.getLearningPlan(id);
        return ResponseEntity.ok(learningPlan);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getAllLearningPlansByUserId(@PathVariable Long userId) {
        List<LearningPlan> learningPlans = learningPlanService.getAllLearningPlansByUserId(userId);
        return ResponseEntity.ok(learningPlans);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable Long id, @Valid @RequestBody CreateLearningPlanRequestDTO request) {
        LearningPlan updatedPlan = learningPlanService.updateLearningPlan(id, request);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable Long id) {
        learningPlanService.deleteLearningPlan(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<ProgressUpdate> addProgressUpdate(@PathVariable Long id,
                                                            @RequestParam String description,
                                                            @RequestParam Integer completionPercentage) {
        ProgressUpdate progressUpdate = learningPlanService.addProgressUpdate(id, description, completionPercentage);
        return ResponseEntity.ok(progressUpdate);
    }
}