package online.threadly.user_authentication.controller;

import lombok.AllArgsConstructor;
import online.threadly.user_authentication.dao.AuthResponse;
import online.threadly.user_authentication.dao.LoginResponse;
import online.threadly.user_authentication.dao.SignInRequest;
import online.threadly.user_authentication.dao.SignUpInitResponse;
import online.threadly.user_authentication.dao.SignUpRequest;
import online.threadly.user_authentication.dao.VerifyOTPRequest;
import online.threadly.user_authentication.service.AuthService;
import online.threadly.user_authentication.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin
@AllArgsConstructor
public class AuthController {

    @Autowired
    private AuthService authService;

    private final EmailService emailService;

    @PostMapping("/signup/init")
    public ResponseEntity<SignUpInitResponse> sendEmail(@RequestBody SignUpRequest signUpRequest){
        return ResponseEntity.ok(emailService.generateEmail(signUpRequest));
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<AuthResponse> verifyUser(@RequestBody VerifyOTPRequest verifyOTPRequest){
        return ResponseEntity.ok(emailService.verifyUser(verifyOTPRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody SignUpRequest signUpRequest){
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody SignInRequest signInRequest){
        return ResponseEntity.ok(authService.authenticate(signInRequest));
    }
}
