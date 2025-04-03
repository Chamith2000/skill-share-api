package com.paf.skillShareApi.controller.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@RequiredArgsConstructor
public class CreateFollowRequestDTO {
    @NotNull(message = "Follower ID cannot be null")
    private Long followerId;

    @NotNull(message = "Followee ID cannot be null")
    private Long followeeId;
}