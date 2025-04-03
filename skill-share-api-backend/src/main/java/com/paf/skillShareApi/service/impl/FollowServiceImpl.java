package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.exception.FollowOperationFailedException;
import com.paf.skillShareApi.exception.SelfFollowException;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Follow;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.FollowRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    public void followUser(Long followerId, Long followeeId) {
        // Check if user is trying to follow themselves
        if (followerId.equals(followeeId)) {
            throw new SelfFollowException();
        }

        try {
            // Find the follower user
            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new UserNotFoundException(followerId));

            // Find the followee user
            User followee = userRepository.findById(followeeId)
                    .orElseThrow(() -> new UserNotFoundException(followeeId));

            // Check if already following
            Follow existingFollow = followRepository.findByFollowerAndFollowee(follower, followee);
            if (existingFollow != null) {
                throw new FollowOperationFailedException("follow", "Already following this user");
            }

            // Create and save the follow relationship
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowee(followee);
            followRepository.save(follow);
        } catch (UserNotFoundException | SelfFollowException | FollowOperationFailedException e) {
            throw e;
        } catch (Exception e) {
            throw new FollowOperationFailedException("follow", e.getMessage());
        }
    }

    @Override
    public void unfollowUser(Long followerId, Long followeeId) {
        // Check if user is trying to unfollow themselves
        if (followerId.equals(followeeId)) {
            throw new SelfFollowException();
        }

        try {
            // Find the follower user
            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new UserNotFoundException(followerId));

            // Find the followee user
            User followee = userRepository.findById(followeeId)
                    .orElseThrow(() -> new UserNotFoundException(followeeId));

            // Find the follow relationship
            Follow follow = followRepository.findByFollowerAndFollowee(follower, followee);
            if (follow == null) {
                throw new FollowOperationFailedException("unfollow", "Not following this user");
            }

            // Delete the follow relationship
            followRepository.delete(follow);
        } catch (UserNotFoundException | SelfFollowException | FollowOperationFailedException e) {
            throw e;
        } catch (Exception e) {
            throw new FollowOperationFailedException("unfollow", e.getMessage());
        }
    }
}