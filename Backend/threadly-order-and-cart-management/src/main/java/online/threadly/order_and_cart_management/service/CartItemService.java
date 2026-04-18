package online.threadly.order_and_cart_management.service;

import lombok.AllArgsConstructor;
import online.threadly.order_and_cart_management.model.CartItem;
import online.threadly.order_and_cart_management.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    public List<CartItem> getCartItemsByCartItemsIds(List<UUID> cartItemsIds){
        return cartItemRepository.findAllById(cartItemsIds);
    }

    public void deleteAllCartItems(List<CartItem> cartItems){
        cartItemRepository.deleteAll(cartItems);
    }
}
