package com.paf.skillShareApi.service;

import com.paf.skillShareApi.model.User;

import java.util.List;

public interface UserService {
    User registerUser(User user);
    User loginUser(String username, String password);
    List<User> getAllUsers();
    User getUserById(Long id);
    User updateUser(User updatedUser);
}