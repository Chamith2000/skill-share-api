package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.dto.TaskDTO;
import com.paf.skillShareApi.controller.request.CreateLearningPlanDTO;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.LearningPlan;
import com.paf.skillShareApi.model.LearningStatus;
import com.paf.skillShareApi.model.Task;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.LearningPlanRepository;
import com.paf.skillShareApi.repository.TaskRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LearningPlanServiceImpl implements LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        task.setStatus(LearningStatus.COMPLETED); // Assuming LearningStatus.COMPLETED exists
        return taskRepository.save(task);
    }

    @Override
    public LearningPlan createLearningPlan(CreateLearningPlanDTO learningPlanRequest) {
        User user = userRepository.findById(learningPlanRequest.getUserId())
                .orElseThrow(() -> new UserNotFoundException(learningPlanRequest.getUserId()));

        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setUser(user);
        learningPlan.setTopic(learningPlanRequest.getTopic());
        learningPlan.setResources(learningPlanRequest.getResources());

        // Map TaskDTOs to Task entities
        List<Task> tasks = new ArrayList<>();
        if (learningPlanRequest.getTasks() != null) {
            for (TaskDTO taskDTO : learningPlanRequest.getTasks()) {
                Task task = new Task();
                task.setDescription(taskDTO.getDescription());
                task.setStatus(taskDTO.getStatus() != null
                        ? LearningStatus.valueOf(taskDTO.getStatus())
                        : LearningStatus.NOT_STARTED); // Default to NOT_COMPLETED
                task.setLearningPlan(learningPlan);
                tasks.add(task);
            }
        }
        learningPlan.setTasks(tasks); // Set the tasks to the learning plan

        return learningPlanRepository.save(learningPlan);
    }

    @Override
    public List<LearningPlan> findAll() {
        return learningPlanRepository.findAll();
    }

    @Override
    public LearningPlan updatePlan(Long id, CreateLearningPlanDTO learningPlanRequest) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + id));

        User user = userRepository.findById(learningPlanRequest.getUserId())
                .orElseThrow(() -> new UserNotFoundException(learningPlanRequest.getUserId()));

        learningPlan.setUser(user);
        learningPlan.setTopic(learningPlanRequest.getTopic());
        learningPlan.setResources(learningPlanRequest.getResources());


        // Update tasks
        List<Task> tasks = new ArrayList<>();
        if (learningPlanRequest.getTasks() != null) {
            for (TaskDTO taskDTO : learningPlanRequest.getTasks()) {
                Task task = new Task();
                task.setDescription(taskDTO.getDescription());
                task.setLearningPlan(learningPlan);
                tasks.add(task);
            }
        }
        learningPlan.getTasks().clear(); // Remove existing tasks
        learningPlan.getTasks().addAll(tasks); // Add updated tasks

        return learningPlanRepository.save(learningPlan);
    }

    @Override
    public void deletePlan(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with ID: " + id));
        learningPlanRepository.delete(learningPlan);
    }

}