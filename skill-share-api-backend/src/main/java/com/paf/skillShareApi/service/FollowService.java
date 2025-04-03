package com.paf.skillShareApi.service;

public interface FollowService {
    void followUser(Long followerId, Long followeeId);
    void unfollowUser(Long followerId, Long followeeId);
}