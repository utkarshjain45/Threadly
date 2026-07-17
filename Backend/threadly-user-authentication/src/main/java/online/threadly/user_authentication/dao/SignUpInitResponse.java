package online.threadly.user_authentication.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignUpInitResponse {
    private String status;
    private String message;
    private String email;
    private String name;
}
