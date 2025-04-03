package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.ProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {
}