package online.threadly.order_and_cart_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import online.threadly.order_and_cart_management.model.OrderStatus;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderConfirmRequest {
    private OrderStatus status;
    private List<UUID> cartItemIds;
}
