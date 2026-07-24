package online.threadly.order_and_cart_management.controller;

import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.dto.OrderConfirmRequest;
import online.threadly.order_and_cart_management.dto.OrderResponse;
import online.threadly.order_and_cart_management.service.OrderService;
import online.threadly.order_and_cart_management.dto.OrderHistoryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderHistoryResponse>> getUserOrders(@RequestHeader("X-USER-ID") UUID userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestHeader("X-USER-ID")UUID userId, @RequestBody List<UUID> cartItemId){
        return ResponseEntity.ok(orderService.checkout(userId, cartItemId));
    }

    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<OrderResponse> confirmOrder(@PathVariable UUID orderId, @RequestBody OrderConfirmRequest request){
        return ResponseEntity.ok(orderService.confirmOrder(orderId, request));
    }
}

