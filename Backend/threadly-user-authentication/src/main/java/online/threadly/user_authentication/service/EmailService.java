package online.threadly.user_authentication.service;

import lombok.AllArgsConstructor;
import online.threadly.user_authentication.dao.AuthResponse;
import online.threadly.user_authentication.dao.SignUpInitResponse;
import online.threadly.user_authentication.dao.SignUpRequest;
import online.threadly.user_authentication.dao.VerifyOTPRequest;
import online.threadly.user_authentication.model.PendingUser;
import online.threadly.user_authentication.model.User;
import online.threadly.user_authentication.repository.EmailRepository;
import online.threadly.user_authentication.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@AllArgsConstructor
@Service
public class EmailService {

    private final UserRepository userRepository;
    private final EmailRepository emailRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender javaMailSender;
    private final AuthService authService;
    private final PendingUserService pendingUserService;

    public SignUpInitResponse generateEmail(SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists. Please sign in.");
        }

        pendingUserService.deleteIfExpired(signUpRequest.getEmail());

        var activePendingUser = pendingUserService.findActivePendingUser(signUpRequest.getEmail());
        if (activePendingUser.isPresent()) {
            PendingUser pendingUser = activePendingUser.get();
            if (!passwordEncoder.matches(signUpRequest.getPassword(), pendingUser.getPassword())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Signup is already in progress for this email. Use the same password or wait for it to expire."
                );
            }

            return SignUpInitResponse.builder()
                    .status("PENDING_VERIFICATION")
                    .message("Complete your signup by entering the OTP sent to your email.")
                    .email(pendingUser.getEmail())
                    .name(pendingUser.getName())
                    .build();
        }

        String otp = generateOTPAndSendEmail(signUpRequest.getEmail());
        PendingUser pendingUser = PendingUser.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .otp(passwordEncoder.encode(otp))
                .build();
        emailRepository.save(pendingUser);

        return SignUpInitResponse.builder()
                .status("OTP_SENT")
                .message("OTP sent to your email. Please check your inbox.")
                .email(signUpRequest.getEmail())
                .name(signUpRequest.getName())
                .build();
    }

    public String generateOTPAndSendEmail(String email) {
        Integer otp = (int) (Math.random() * 269438) + 100000;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("OTP Verification");
        message.setText("Verification OTP for SignUp on Threadly.online : " + otp + "\n OTP valid till 1 hour only");
        javaMailSender.send(message);

        return String.valueOf(otp);
    }

    public AuthResponse verifyUser(VerifyOTPRequest request) {
        PendingUser pendingUser = emailRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Signup session expired. Please sign up again."
                ));

        if (pendingUserService.isExpired(pendingUser)) {
            emailRepository.delete(pendingUser);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OTP expired. Please sign up again."
            );
        }

        if (!passwordEncoder.matches(request.getOtp(), pendingUser.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP. Please try again.");
        }

        User user = User.builder()
                .name(pendingUser.getName())
                .email(pendingUser.getEmail())
                .password(pendingUser.getPassword())
                .build();
        userRepository.save(user);
        emailRepository.delete(pendingUser);

        return new AuthResponse(authService.generateTokenForUser(user));
    }
}
