package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Follow;
import com.paf.skillShareApi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Follow findByFollowerAndFollowee(User follower, User followee);
}