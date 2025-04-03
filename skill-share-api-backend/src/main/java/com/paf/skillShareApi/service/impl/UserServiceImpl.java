package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.InvalidCredentialsException;
import com.paf.skillShareApi.exception.InvalidEmailFormatException;
import com.paf.skillShareApi.exception.UserAlreadyExistsException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        if (!isValidEmail(user.getEmail())) {
            throw new InvalidEmailFormatException(user.getEmail());
        }

        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null) {
            throw new UserAlreadyExistsException(user.getUsername());
        }

        return userRepository.save(user);
    }

    @Override
    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null || !password.equals(user.getPassword())) {
            throw new InvalidCredentialsException(); // Now resolved
        }
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id)); // Now resolved
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    }

    @Override
    public User updateUser(User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new UserNotFoundException(updatedUser.getId())); // Now resolved

        if (!isValidEmail(updatedUser.getEmail())) {
            throw new InvalidEmailFormatException(updatedUser.getEmail());
        }

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setEmail(updatedUser.getEmail());
        return userRepository.save(existingUser);
    }
}