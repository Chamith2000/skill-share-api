package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.InvalidCredentialsException;
import com.paf.skillShareApi.exception.InvalidEmailFormatException;
import com.paf.skillShareApi.exception.UserAlreadyExistsException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Authority;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(User user) {
        if (!isValidEmail(user.getEmail())) {
            throw new InvalidEmailFormatException(user.getEmail());
        }

        Optional<User> existingUserOptional = userRepository.findByUsername(user.getUsername());
        if (existingUserOptional.isPresent()) {
            throw new UserAlreadyExistsException(user.getUsername());
        }

        User newUser = new User();
        newUser.setUsername(user.getUsername());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setEmail(user.getEmail());
        newUser.setBio(user.getBio());
        newUser.setProfileImageUrl(user.getProfileImageUrl());
        newUser.setCraftTokens(0);
        newUser.setSkillLevel(user.getSkillLevel());
//        newUser.setEnabled(true);

        Authority userAuthority = new Authority();
        userAuthority.setAuthority("ROLE_USER");
        userAuthority.setUser(newUser);

        newUser.setAuthorities(Collections.singletonList(userAuthority));

        return userRepository.save(newUser);
    }

    @Override
    public User loginUser(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        User user = userOptional.orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
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
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    }

    @Override
    public User updateUser(User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new UserNotFoundException(updatedUser.getId()));

        if (!isValidEmail(updatedUser.getEmail())) {
            throw new InvalidEmailFormatException(updatedUser.getEmail());
        }

        existingUser.setUsername(updatedUser.getUsername());
        // Don't override password if it's not provided in the update
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setBio(updatedUser.getBio());
        existingUser.setProfileImageUrl(updatedUser.getProfileImageUrl());
        existingUser.setSkillLevel(updatedUser.getSkillLevel());

        return userRepository.save(existingUser);
    }
}