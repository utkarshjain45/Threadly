package online.threadly.order_and_cart_management.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartResponse {
    List<CartItemDTO> cart;

    Double totalAmount;
}
