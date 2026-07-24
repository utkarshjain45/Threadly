package online.threadly.order_and_cart_management.service;

import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.client.ProductClient;
import online.threadly.order_and_cart_management.dto.OrderConfirmRequest;
import online.threadly.order_and_cart_management.dto.OrderResponse;
import online.threadly.order_and_cart_management.dto.Product;
import online.threadly.order_and_cart_management.model.CartItem;
import online.threadly.order_and_cart_management.model.Order;
import online.threadly.order_and_cart_management.model.OrderItem;
import online.threadly.order_and_cart_management.model.OrderStatus;
import online.threadly.order_and_cart_management.repository.OrderItemRepository;
import online.threadly.order_and_cart_management.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import online.threadly.order_and_cart_management.repository.CartRepository;

import online.threadly.order_and_cart_management.dto.OrderHistoryResponse;
import online.threadly.order_and_cart_management.dto.OrderItemDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class OrderService {

    private final CartItemService cartItemService;
    private final ProductClient productClient;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;

    public List<OrderHistoryResponse> getUserOrders(UUID userId) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .filter(order -> order.getOrderStatus() == OrderStatus.PLACED 
                        || order.getOrderStatus() == OrderStatus.DELIVERED
                        || (order.getOrderStatus() == OrderStatus.CREATED && order.getCreatedAt().isAfter(cutoff)))
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    List<OrderItemDTO> itemDTOs = items.stream().map(item -> OrderItemDTO.builder()
                            .id(item.getId())
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .images(item.getImages())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .build()
                    ).toList();

                    return OrderHistoryResponse.builder()
                            .id(order.getId())
                            .totalAmount(order.getTotalAmount())
                            .orderStatus(order.getOrderStatus())
                            .createdAt(order.getCreatedAt())
                            .items(itemDTOs)
                            .build();
                }).toList();
    }

    public OrderResponse checkout(UUID userId, List<UUID> cartItemsIds){
        List<CartItem> cartItems = cartItemService.getCartItemsByCartItemsIds(cartItemsIds);

        if (cartItems.isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is Empty");
        }

        List<UUID> productIds = cartItems.stream().map(CartItem::getProductId).toList();

        List<Product> products = productClient.getProductByIds(productIds);

        Order order = new Order();
        order.setUserId(userId);
        Double totalAmount = 0.0;
        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems){
            Product product = products.stream()
                    .filter(p -> p.getId().equals(cartItem.getProductId()))
                    .findFirst()
                    .orElseThrow();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrderId(order.getId());
            orderItem.setProductId(product.getId());
            orderItem.setImages(product.getImages());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setProductName(product.getName());

            totalAmount += product.getPrice() * cartItem.getQuantity();

            orderItemRepository.save(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderStatus(OrderStatus.CREATED);
        orderRepository.save(order);

        return new OrderResponse(order.getId(), order.getTotalAmount(), order.getOrderStatus());
    }

    public OrderResponse confirmOrder(UUID orderId, OrderConfirmRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (request.getStatus() != null) {
            order.setOrderStatus(request.getStatus());
        } else {
            order.setOrderStatus(OrderStatus.PLACED);
        }
        orderRepository.save(order);

        if (order.getOrderStatus() == OrderStatus.PLACED) {
            if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
                List<CartItem> cartItems = cartItemService.getCartItemsByCartItemsIds(request.getCartItemIds());
                if (!cartItems.isEmpty()) {
                    cartItemService.deleteAllCartItems(cartItems);
                }
            } else {
                List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
                List<UUID> productIds = orderItems.stream().map(OrderItem::getProductId).toList();
                cartRepository.findByUserId(order.getUserId()).ifPresent(cart -> {
                    List<CartItem> itemsToDelete = cart.getItems().stream()
                            .filter(item -> productIds.contains(item.getProductId()))
                            .toList();
                    if (!itemsToDelete.isEmpty()) {
                        cartItemService.deleteAllCartItems(itemsToDelete);
                    }
                });
            }
        }

        return new OrderResponse(order.getId(), order.getTotalAmount(), order.getOrderStatus());
    }

    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    @Transactional
    public void cleanupPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Order> expiredOrders = orderRepository.findByOrderStatusAndCreatedAtBefore(OrderStatus.CREATED, cutoff);
        for (Order order : expiredOrders) {
            orderItemRepository.deleteByOrderId(order.getId());
            orderRepository.delete(order);
        }
    }
}

