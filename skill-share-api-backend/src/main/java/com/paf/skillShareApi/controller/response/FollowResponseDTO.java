package com.paf.skillShareApi.controller.response;

import com.paf.skillShareApi.controller.dto.UserSummaryDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponseDTO {
    private Long id;
    private UserSummaryDTO follower;
    private UserSummaryDTO followee;
    private boolean followed; // true for follow, false for unfollow
}