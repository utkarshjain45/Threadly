package online.threadly.user_authentication.repository;

import online.threadly.user_authentication.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailRepository extends JpaRepository<PendingUser, UUID> {
    Optional<PendingUser> findByEmail(String email);
}
