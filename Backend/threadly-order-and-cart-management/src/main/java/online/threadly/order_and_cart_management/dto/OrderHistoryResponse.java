package online.threadly.order_and_cart_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import online.threadly.order_and_cart_management.model.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryResponse {
    private UUID id;
    private Double totalAmount;
    private OrderStatus orderStatus;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
}
