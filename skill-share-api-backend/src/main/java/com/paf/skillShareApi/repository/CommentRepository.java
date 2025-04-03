package com.paf.skillShareApi.repository;
import com.paf.skillShareApi.model.Comment;
import com.paf.skillShareApi.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    List<Comment> findByPost(Post post);
}