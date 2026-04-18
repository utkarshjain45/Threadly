package online.threadly.order_and_cart_management.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID orderId;

    private UUID productId;

    private String productName;

    private String[] images;

    private Double price;

    private Integer quantity;
}
