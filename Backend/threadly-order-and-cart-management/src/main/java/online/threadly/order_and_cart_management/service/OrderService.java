package online.threadly.order_and_cart_management.service;

import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.client.ProductClient;
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

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class OrderService {

    private final CartItemService cartItemService;
    private final ProductClient productClient;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

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
            orderItem.setQuantity(product.getQuantity());
            orderItem.setProductName(product.getName());

            totalAmount += product.getPrice() * cartItem.getQuantity();

            orderItemRepository.save(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderStatus(OrderStatus.PLACED);
        orderRepository.save(order);

        cartItemService.deleteAllCartItems(cartItems);

        return new OrderResponse(order.getId(), order.getTotalAmount(), order.getOrderStatus());
    }
}
