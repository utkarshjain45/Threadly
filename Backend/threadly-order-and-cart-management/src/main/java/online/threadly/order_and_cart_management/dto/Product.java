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

    private String category;

    private String subcategory;

    private String color;

    private String size;

    private Double originalPrice;

    private Double discount;

    private boolean bestSeller;

    private boolean newArrival;
}