package online.threadly.threadlypayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderConfirmRequest {
    private String status;
    private List<UUID> cartItemIds;
}
