package online.threadly.order_and_cart_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import online.threadly.order_and_cart_management.model.OrderStatus;

import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderResponse {

    private UUID orderId;

    private Double amount;

    private OrderStatus orderStatus;
}
