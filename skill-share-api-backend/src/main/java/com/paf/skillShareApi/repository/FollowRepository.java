package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    List<Follow> findByFolloweeId(Long followeeId);

    List<Follow> findByFollowerId(Long followerId);

    long countByFolloweeId(Long followeeId);

    long countByFollowerId(Long followerId);

    void deleteByFollowerIdAndFolloweeId(Long followerId, Long followeeId);
}