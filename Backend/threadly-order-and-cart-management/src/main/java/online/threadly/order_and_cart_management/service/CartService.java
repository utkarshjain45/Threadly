package online.threadly.order_and_cart_management.service;

import jakarta.ws.rs.BadRequestException;
import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.client.ProductClient;
import online.threadly.order_and_cart_management.dto.*;
import online.threadly.order_and_cart_management.exception.quantityCannotBeZero;
import online.threadly.order_and_cart_management.model.Cart;
import online.threadly.order_and_cart_management.model.CartItem;
import online.threadly.order_and_cart_management.repository.CartItemRepository;
import online.threadly.order_and_cart_management.repository.CartRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;

    public AddToCartResponse addToCart(UUID userId, AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new quantityCannotBeZero("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            return cartRepository.save(newCart);
        });

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId()).orElseGet(() -> {
            CartItem newCartItem = new CartItem();
            newCartItem.setCart(cart);
            newCartItem.setProductId(request.getProductId());
            newCartItem.setQuantity(0);
            return newCartItem;
        });

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItemRepository.save(cartItem);

        return new AddToCartResponse("Item added to Cart successfully", cart.getId());
    }

    public CartResponse getCartForUser(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);

        if (cart == null) {
            CartResponse emptyCartResponse = new CartResponse();
            emptyCartResponse.setCart(new ArrayList<>());
            emptyCartResponse.setTotalAmount(0.0);
            return emptyCartResponse;
        }

        List<CartItem> items = cartItemRepository.findAllByCartId(cart.getId());
        List<UUID> productIds = items.stream().map(CartItem::getProductId).toList();
        List<Product> products = productClient.getProductByIds(productIds);

        List<CartItemDTO> userCart = new ArrayList<>();
        CartResponse cartResponse = new CartResponse();
        Double totalAmount = 0.0;
        for (CartItem cartItem : items) {
            for (Product product : products) {
                if (cartItem.getProductId().equals(product.getId())) {
                    CartItemDTO cartItemDTO =
                            CartItemDTO.builder()
                                    .id(cartItem.getId())
                                    .productId(cartItem.getProductId())
                                    .price(product.getPrice())
                                    .images(product.getImages())
                                    .slug(product.getSlug())
                                    .quantity(cartItem.getQuantity())
                                    .name(product.getName())
                                    .build();
                    userCart.add(cartItemDTO);
                    product.setQuantity(cartItem.getQuantity());
                    totalAmount += (cartItem.getQuantity() * product.getPrice());
                }
            }
        }
        cartResponse.setCart(userCart);
        cartResponse.setTotalAmount(totalAmount);

        return cartResponse;
    }

    public AddToCartResponse deleteItemFromCart(UUID userId, UUID productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart not found for User."));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in Cart."));

        cartItemRepository.delete(cartItem);

        return new AddToCartResponse("Item removed from Cart", cart.getId());
    }

    public AddToCartResponse updateCartItemQuantity(UUID userId, AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart not found for User."));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in Cart."));

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return new AddToCartResponse("Cart Item quantity updated successfully", cart.getId());
    }
}
