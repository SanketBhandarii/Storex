package com.stationery_management.sm.service;

import com.stationery_management.sm.dto.OrderRequest;
import com.stationery_management.sm.entity.*;
import com.stationery_management.sm.repository.ItemRepository;
import com.stationery_management.sm.repository.OrderRepository;
import com.stationery_management.sm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public String placeOrder(String userEmail, OrderRequest req) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Item item = itemRepository.findById(req.getItemId()).orElseThrow();

        if (item.getQuantity() < req.getQuantity()) {
            return "Not enough stock available!";
        }

        double total = req.getQuantity() * item.getPrice();

        Order order = Order.builder()
                .user(user)
                .item(item)
                .quantity(req.getQuantity())
                .totalPrice(total)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .build();

        item.setQuantity(item.getQuantity() - req.getQuantity());
        item.setAvailable(item.getQuantity() > 0);
        itemRepository.save(item);

        orderRepository.save(order);

        return "Order placed successfully!";
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public String updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
        return "Order status updated to " + status;
    }
}
