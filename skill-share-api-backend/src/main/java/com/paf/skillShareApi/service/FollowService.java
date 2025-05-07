package com.paf.skillShareApi.service;
import com.paf.skillShareApi.controller.dto.FollowCountsDTO;
import com.paf.skillShareApi.controller.dto.UserSummaryDTO;
import com.paf.skillShareApi.controller.response.FollowResponseDTO;

import java.util.List;

public interface FollowService {
    FollowResponseDTO followUser(Long followerId, Long followeeId);
    FollowResponseDTO unfollowUser(Long followerId, Long followeeId);
    boolean isFollowing(Long followerId, Long followeeId);
    List<UserSummaryDTO> getFollowers(Long userId);
    List<UserSummaryDTO> getFollowing(Long userId);
    FollowCountsDTO getFollowCounts(Long userId);

}

