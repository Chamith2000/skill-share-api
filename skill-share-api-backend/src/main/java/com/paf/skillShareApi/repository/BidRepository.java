package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByRequestBoardId(Long requestBoardId);
    void deleteByRequestBoardId(Long requestId);
}