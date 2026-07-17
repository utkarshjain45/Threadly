package online.threadly.order_and_cart_management.controller;

import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.dto.AddToCartRequest;
import online.threadly.order_and_cart_management.dto.AddToCartResponse;
import online.threadly.order_and_cart_management.dto.CartResponse;
import online.threadly.order_and_cart_management.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@AllArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<AddToCartResponse> addItemToCart(@RequestHeader("X-USER-ID") UUID userId, @RequestBody AddToCartRequest request){
        var cart = cartService.addToCart(userId, request);
        if (cart == null){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(cart);
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("X-USER-ID") UUID userId){

        CartResponse cartResponse = cartService.getCartForUser(userId);

        if (cartResponse == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(cartResponse);
    }

    @DeleteMapping("/item/{productId}")
    public ResponseEntity<AddToCartResponse> removeItemFromCart(@RequestHeader("X-USER-ID") UUID userId, @PathVariable UUID productId){
        return ResponseEntity.ok(cartService.deleteItemFromCart(userId, productId));
    }

    @PutMapping("/item")
    public ResponseEntity<AddToCartResponse> updateCartItemQuantity(@RequestHeader("X-USER-ID") UUID userId, @RequestBody AddToCartRequest request){
        return ResponseEntity.ok(cartService.updateCartItemQuantity(userId, request));
    }
}
