package online.threadly.order_and_cart_management.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class Product {
    private UUID id;

    private String name;

    private String slug;

    private String[] images;

    private Double price;

    private Integer quantity;
}