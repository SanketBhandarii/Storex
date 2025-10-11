package com.stationery_management.sm.service;

import com.stationery_management.sm.dto.ItemRequest;
import com.stationery_management.sm.entity.Item;
import com.stationery_management.sm.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public Item addItem(ItemRequest req) {
        Item item = Item.builder()
                .name(req.getName())
                .category(req.getCategory())
                .price(req.getPrice())
                .quantity(req.getQuantity())
                .available(req.getQuantity() > 0)
                .build();
        return itemRepository.save(item);
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public Item updateItem(Long id, ItemRequest req) {
        Item item = itemRepository.findById(id).orElseThrow();
        item.setName(req.getName());
        item.setCategory(req.getCategory());
        item.setPrice(req.getPrice());
        item.setQuantity(req.getQuantity());
        item.setAvailable(req.getQuantity() > 0);
        return itemRepository.save(item);
    }

    public String deleteItem(Long id) {
        itemRepository.deleteById(id);
        return "Item deleted successfully";
    }
}
