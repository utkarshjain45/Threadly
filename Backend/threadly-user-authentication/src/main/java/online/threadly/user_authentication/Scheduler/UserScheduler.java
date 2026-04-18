package online.threadly.user_authentication.Scheduler;

import lombok.AllArgsConstructor;
import online.threadly.user_authentication.model.PendingUser;
import online.threadly.user_authentication.repository.EmailRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class UserScheduler {

    private final EmailRepository emailRepository;

    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void deleteVerifiedMails(){
        List<PendingUser> pendingUsers = emailRepository.findAll();
        List<PendingUser> usersWithExpiredOTP = pendingUsers
                .stream()
                .filter(user ->
                        user.getCreatedAt()
                                .isBefore(LocalDateTime.now().minusHours(1)))
                .collect(Collectors.toList());
        emailRepository.deleteAllInBatch(usersWithExpiredOTP);
    }
}
