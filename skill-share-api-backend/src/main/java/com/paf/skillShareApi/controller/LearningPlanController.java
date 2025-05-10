package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateLearningPlanDTO;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.ProgressUpdate;
import com.paf.skillShareApi.model.Task;
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
    public ResponseEntity<LearningPlan> createLearningPlan(@Valid @RequestBody CreateLearningPlanDTO request) {
        LearningPlan learningPlan = learningPlanService.createLearningPlan(request);
        return ResponseEntity.ok(learningPlan);
    }

    @GetMapping
    public ResponseEntity<List<LearningPlan>> findAll() {
        List<LearningPlan> plans = learningPlanService.findAll();
        return ResponseEntity.ok(plans);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(@PathVariable Long id, @Valid @RequestBody CreateLearningPlanDTO request) {
        LearningPlan updatedPlan = learningPlanService.updatePlan(id, request);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        learningPlanService.deletePlan(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Task> completeTask(@PathVariable Long taskId) {
        Task task = learningPlanService.completeTask(taskId);
        return ResponseEntity.ok(task);
    }
}