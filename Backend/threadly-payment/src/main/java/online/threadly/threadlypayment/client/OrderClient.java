package online.threadly.threadlypayment.client;

import online.threadly.threadlypayment.dto.OrderConfirmRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "threadly-order-and-cart-management", url = "${ORDER_SERVICE_URL:http://localhost:8084/api/v1}")
public interface OrderClient {

    @PutMapping("/orders/{orderId}/confirm")
    Object confirmOrder(@PathVariable("orderId") UUID orderId, @RequestBody OrderConfirmRequest request);
}
