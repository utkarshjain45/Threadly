package online.threadly.user_authentication.service;
import online.threadly.user_authentication.dao.AuthResponse;
import online.threadly.user_authentication.dao.LoginResponse;
import online.threadly.user_authentication.dao.SignInRequest;
import online.threadly.user_authentication.dao.SignUpRequest;
import online.threadly.user_authentication.model.PendingUser;
import online.threadly.user_authentication.model.User;
import online.threadly.user_authentication.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final PendingUserService pendingUserService;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            PendingUserService pendingUserService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.pendingUserService = pendingUserService;
    }

    public AuthResponse registerUser(SignUpRequest signUpRequest) {
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken);
    }



    public LoginResponse authenticate(SignInRequest signInRequest) {

        Optional<User> existingUser = userRepository.findByEmail(signInRequest.getEmail());

        if (existingUser.isPresent()) {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            signInRequest.getEmail(), signInRequest.getPassword()));
            return LoginResponse.builder()
                    .status("SUCCESS")
                    .token(jwtService.generateToken(existingUser.get()))
                    .email(existingUser.get().getEmail())
                    .name(existingUser.get().getName())
                    .build();
        }

        pendingUserService.deleteIfExpired(signInRequest.getEmail());

        Optional<PendingUser> activePendingUser = pendingUserService.findActivePendingUser(
                signInRequest.getEmail(),
                signInRequest.getPassword()
        );

        if (activePendingUser.isPresent()) {
            PendingUser pendingUser = activePendingUser.get();

            return LoginResponse.builder()
                    .status("PENDING_VERIFICATION")
                    .email(pendingUser.getEmail())
                    .name(pendingUser.getName())
                    .message("Complete your signup by entering the OTP sent to your email.")
                    .build();
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signInRequest.getEmail(), signInRequest.getPassword()));
        throw new IllegalStateException("Authentication failed");
    }

    public String generateTokenForUser(User user) {
        return jwtService.generateToken(user);
    }
}