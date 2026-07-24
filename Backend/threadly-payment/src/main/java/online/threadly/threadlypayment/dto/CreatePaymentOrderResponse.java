package online.threadly.threadlypayment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderResponse {
    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String keyId;
    private UUID orderId;
}
