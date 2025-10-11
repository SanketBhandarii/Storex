package com.stationery_management.sm.repository;

import com.stationery_management.sm.entity.Order;
import com.stationery_management.sm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
}
