package online.threadly.user_authentication.dao;

import lombok.Data;

@Data
public class VerifyOTPRequest {
    String email;
    String otp;
}
