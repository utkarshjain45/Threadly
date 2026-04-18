package online.threadly.user_authentication.service;

import lombok.AllArgsConstructor;
import online.threadly.user_authentication.dao.AuthResponse;
import online.threadly.user_authentication.dao.SignUpRequest;
import online.threadly.user_authentication.dao.VerifyOTPRequest;
import online.threadly.user_authentication.model.PendingUser;
import online.threadly.user_authentication.repository.EmailRepository;
import online.threadly.user_authentication.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class EmailService {

    private final UserRepository userRepository;

    private final EmailRepository emailRepository;

    private final PasswordEncoder passwordEncoder;

    private final JavaMailSender javaMailSender;

    private final AuthService authService;

    public String generateEmail(SignUpRequest signUpRequest){
        if (userRepository.existsByEmail(signUpRequest.getEmail())){
            return "User Already Exist";
        }
        String otp = generateOTPAndSendEmail(signUpRequest.getEmail());
        PendingUser pendingUser = PendingUser.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .otp(passwordEncoder.encode(otp))
                .build();
        emailRepository.save(pendingUser);
        return "User Created";
    }

    public String generateOTPAndSendEmail(String email){
        Integer otp = (int) (Math.random() * 269438) + 100000;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("OTP Verification");
        message.setText("Verification OTP for SignUp on Threadly.online : " + otp + "\n OTP valid till 1 hour only");
        javaMailSender.send(message);

        return String.valueOf(otp);
    }

    public AuthResponse verifyUser(VerifyOTPRequest request) {
        PendingUser user = emailRepository.findByEmail(request.getEmail()).orElseThrow(() -> {
            return new RuntimeException("SignIn Again");
        });

        if (passwordEncoder.matches(request.getOtp(), user.getOtp())){
            SignUpRequest signUpRequest = new SignUpRequest();
            signUpRequest.setEmail(user.getEmail());
            signUpRequest.setName(user.getName());
            signUpRequest.setPassword(user.getPassword());
            AuthResponse authResponse = authService.registerUser(signUpRequest);
            emailRepository.delete(user);
            return authResponse;
        }
        return null;
    }
}
