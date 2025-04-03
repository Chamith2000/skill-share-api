package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, Long> {
}