package online.threadly.threadlypayment.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import online.threadly.threadlypayment.client.OrderClient;
import online.threadly.threadlypayment.dto.*;
import online.threadly.threadlypayment.entity.Payment;
import online.threadly.threadlypayment.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final OrderClient orderClient;

    @Value("${razorpay.key:rzp_test_dummy}")
    private String razorpayKey;

    @Value("${razorpay.secret:dummy_secret}")
    private String razorpaySecret;

    public CreatePaymentOrderResponse createRazorpayOrder(UUID userId, CreatePaymentOrderRequest request) {
        if (request.getOrderId() == null || request.getAmount() == null || request.getAmount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid orderId or amount");
        }

        try {
            int amountInPaise = (int) Math.round(request.getAmount() * 100);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + request.getOrderId().toString().substring(0, 8));

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = rzpOrder.get("id");

            Payment payment = Payment.builder()
                    .userId(userId)
                    .orderId(request.getOrderId())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(request.getAmount())
                    .currency("INR")
                    .status("CREATED")
                    .build();

            paymentRepository.save(payment);

            return CreatePaymentOrderResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(request.getAmount())
                    .currency("INR")
                    .keyId(razorpayKey)
                    .orderId(request.getOrderId())
                    .build();
        } catch (RazorpayException e) {
            log.error("Error while creating Razorpay order", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create Razorpay payment order: " + e.getMessage());
        }
    }

    public VerifyPaymentResponse verifyRazorpayPayment(UUID userId, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseGet(() -> paymentRepository.findByOrderId(request.getOrderId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment order not found")));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpaySecret);

            if (isSignatureValid) {
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setStatus("SUCCESS");
                paymentRepository.save(payment);

                try {
                    orderClient.confirmOrder(request.getOrderId(), new OrderConfirmRequest("PLACED", request.getCartItemIds()));
                } catch (Exception e) {
                    log.error("Failed to update order status post-payment", e);
                }

                return VerifyPaymentResponse.builder()
                        .status("SUCCESS")
                        .message("Payment verified successfully")
                        .orderId(request.getOrderId())
                        .build();
            } else {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);

                try {
                    orderClient.confirmOrder(request.getOrderId(), new OrderConfirmRequest("FAILED", null));
                } catch (Exception e) {
                    log.error("Failed to mark order as FAILED", e);
                }

                return VerifyPaymentResponse.builder()
                        .status("FAILED")
                        .message("Invalid payment signature")
                        .orderId(request.getOrderId())
                        .build();
            }
        } catch (Exception e) {
            log.error("Error during payment verification", e);
            payment.setStatus("FAILED");
            paymentRepository.save(payment);

            return VerifyPaymentResponse.builder()
                    .status("FAILED")
                    .message("Payment verification failed: " + e.getMessage())
                    .orderId(request.getOrderId())
                    .build();
        }
    }
}
