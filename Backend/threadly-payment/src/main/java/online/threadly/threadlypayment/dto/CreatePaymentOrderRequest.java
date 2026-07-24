package online.threadly.threadlypayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderRequest {
    private UUID orderId;
    private Double amount;
}
