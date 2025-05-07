package com.paf.skillShareApi.repository;

import com.paf.skillShareApi.model.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorityRepository extends JpaRepository<Authority, Long> {
}