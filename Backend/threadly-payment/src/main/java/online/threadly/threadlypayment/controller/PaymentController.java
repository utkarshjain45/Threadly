package online.threadly.threadlypayment.controller;

import lombok.RequiredArgsConstructor;
import online.threadly.threadlypayment.dto.*;
import online.threadly.threadlypayment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<CreatePaymentOrderResponse> createPaymentOrder(
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestBody CreatePaymentOrderRequest request) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(userId, request));
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyPaymentResponse> verifyPayment(
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(userId, request));
    }
}
