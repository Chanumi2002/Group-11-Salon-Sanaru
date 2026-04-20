package com.sanaru.backend.repository;

import com.sanaru.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    //updated because use can filter
    @Query("SELECT p FROM Product p JOIN p.categories c " +
            "WHERE (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> findByFilters(@Param("categoryId") Long categoryId,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();
}