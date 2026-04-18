package online.threadly.order_and_cart_management.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CartItemDTO {

    private UUID id;

    private UUID productId;

    private String name;

    private String slug;

    private String[] images;

    private Double price;

    private Integer quantity;
}
