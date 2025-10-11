package com.stationery_management.sm.dto;

import lombok.Data;

@Data
public class ItemRequest {
    private String name;
    private String category;
    private int quantity;
    private double price;
}
