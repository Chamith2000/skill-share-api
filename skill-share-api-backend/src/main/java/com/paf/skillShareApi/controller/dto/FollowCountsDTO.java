package com.paf.skillShareApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowCountsDTO {
    private Long followersCount;
    private Long followingCount;
}