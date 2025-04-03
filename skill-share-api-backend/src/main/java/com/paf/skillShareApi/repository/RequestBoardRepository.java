package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.RequestBoard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestBoardRepository extends JpaRepository<RequestBoard, Long> {
}