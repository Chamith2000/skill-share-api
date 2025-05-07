package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.LoginRequest;
import com.paf.skillShareApi.controller.request.UserRegisterRequest;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserRegisterRequest userRegisterRequest) {
        User user = new User();
        user.setUsername(userRegisterRequest.getUsername());
        user.setPassword(userRegisterRequest.getPassword());
        user.setEmail(userRegisterRequest.getEmail());
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody LoginRequest loginRequest) {
        User authenticatedUser = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());

        Map<String, Object> userMap = Map.of(
                "id", authenticatedUser.getId(),
                "username", authenticatedUser.getUsername(),
                "email", authenticatedUser.getEmail()
        );

        return ResponseEntity.ok(userMap);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUserById(@PathVariable Long id, @RequestBody User updatedUser) {
        // Set the ID of the updated user to match the ID in the path variable
        updatedUser.setId(id);
        User updatedUserData = userService.updateUser(updatedUser);
        return ResponseEntity.ok(updatedUserData);
    }
}