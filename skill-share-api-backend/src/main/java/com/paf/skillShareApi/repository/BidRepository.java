package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bid, Long> {
}