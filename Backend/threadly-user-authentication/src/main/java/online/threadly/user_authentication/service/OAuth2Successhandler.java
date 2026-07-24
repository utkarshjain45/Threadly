package online.threadly.user_authentication.service;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import online.threadly.user_authentication.model.User;
import online.threadly.user_authentication.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

@Component
public class OAuth2Successhandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String frontendOauthSuccessUrl;

    public OAuth2Successhandler(
            UserRepository userRepository,
            JwtService jwtService,
            @Value("${FRONTEND_OAUTH_SUCCESS_URL:https://threadly.works/oauth-success}") String frontendOauthSuccessUrl
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.frontendOauthSuccessUrl = frontendOauthSuccessUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String name = oAuth2User.getAttributes().get("name").toString();
        String email = oAuth2User.getAttributes().get("email").toString();

        User user;
        if(!userRepository.existsByEmail(email)){
            user = User.builder()
                    .name(name)
                    .email(email)
                    .build();
            userRepository.save(user);
        } else{
            user = userRepository.findByEmail(email).get();
        }
        String token = jwtService.generateToken(user);

        response.sendRedirect(frontendOauthSuccessUrl + "?token=" + token);
    }
}
