package com.sanaru.backend.repository;

import com.sanaru.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name); // to prevent duplicates
}