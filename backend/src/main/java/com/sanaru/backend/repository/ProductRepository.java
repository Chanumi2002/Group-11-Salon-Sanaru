package com.sanaru.backend.repository;

import com.sanaru.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find by name
    List<Product> findByName(String name);

    // Filter by price greater than
    List<Product> findByPriceGreaterThan(BigDecimal price);

    // Filter by price range
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    // Combined condition
    List<Product> findByNameContainingAndPriceLessThan(String name, BigDecimal price);

    // Order by price ascending
    List<Product> findAllByOrderByPriceAsc();

    // Order by price descending
    List<Product> findAllByOrderByPriceDesc();
}