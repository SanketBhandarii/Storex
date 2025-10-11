package com.stationery_management.sm.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private Long itemId;
    private int quantity;
}
