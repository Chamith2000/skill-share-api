package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.dto.FollowCountsDTO;
import com.paf.skillShareApi.controller.response.FollowResponseDTO;
import com.paf.skillShareApi.controller.dto.UserSummaryDTO;
import com.paf.skillShareApi.exception.ResourceNotFoundException;
import com.paf.skillShareApi.model.Follow;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.FollowRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.FollowService;
import com.paf.skillShareApi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FollowServiceImpl implements FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public FollowResponseDTO followUser(Long followerId, Long followeeId) {
        if (followerId.equals(followeeId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower user not found"));

        User followee = userRepository.findById(followeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Followee user not found"));

        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId);
        if (existingFollow.isPresent()) {
            return mapToResponseDTO(existingFollow.get(), true);
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowee(followee);
        Follow savedFollow = followRepository.save(follow);

        notificationService.createFollowNotification(follower, followee);

        return mapToResponseDTO(savedFollow, true);
    }

    @Override
    @Transactional
    public FollowResponseDTO unfollowUser(Long followerId, Long followeeId) {
        userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower user not found"));

        userRepository.findById(followeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Followee user not found"));

        Follow follow = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        FollowResponseDTO response = mapToResponseDTO(follow, false);
        followRepository.delete(follow);

        return response;
    }

    @Override
    public boolean isFollowing(Long followerId, Long followeeId) {
        return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
    }

    @Override
    public List<UserSummaryDTO> getFollowers(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Follow> followers = followRepository.findByFolloweeId(userId);
        return followers.stream()
                .map(follow -> mapUserToSummaryDTO(follow.getFollower()))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserSummaryDTO> getFollowing(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Follow> following = followRepository.findByFollowerId(userId);
        return following.stream()
                .map(follow -> mapUserToSummaryDTO(follow.getFollowee()))
                .collect(Collectors.toList());
    }

    @Override
    public FollowCountsDTO getFollowCounts(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long followersCount = followRepository.countByFolloweeId(userId);
        long followingCount = followRepository.countByFollowerId(userId);

        return new FollowCountsDTO(followersCount, followingCount);
    }

    private UserSummaryDTO mapUserToSummaryDTO(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getUsername(),
                user.getProfileImageUrl(),
                user.getBio()
        );
    }

    private FollowResponseDTO mapToResponseDTO(Follow follow, boolean followed) {
        return new FollowResponseDTO(
                follow.getId(),
                mapUserToSummaryDTO(follow.getFollower()),
                mapUserToSummaryDTO(follow.getFollowee()),
                followed
        );
    }
}