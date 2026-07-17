package online.threadly.user_authentication.service;

import lombok.AllArgsConstructor;
import online.threadly.user_authentication.model.PendingUser;
import online.threadly.user_authentication.repository.EmailRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PendingUserService {

    private static final long PENDING_TTL_HOURS = 1;

    private final EmailRepository emailRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean isExpired(PendingUser pendingUser) {
        return pendingUser.getCreatedAt()
                .isBefore(LocalDateTime.now().minusHours(PENDING_TTL_HOURS));
    }

    public Optional<PendingUser> findActivePendingUser(String email) {
        return emailRepository.findByEmail(email)
                .filter(pendingUser -> !isExpired(pendingUser));
    }

    public Optional<PendingUser> findActivePendingUser(String email, String rawPassword) {
        return findActivePendingUser(email)
                .filter(pendingUser -> passwordEncoder.matches(rawPassword, pendingUser.getPassword()));
    }

    public void deleteIfExpired(String email) {
        emailRepository.findByEmail(email)
                .filter(this::isExpired)
                .ifPresent(emailRepository::delete);
    }
}
