package online.threadly.user_authentication.controller;

import online.threadly.user_authentication.dao.AuthResponse;
import online.threadly.user_authentication.dao.SignUpRequest;
import online.threadly.user_authentication.model.User;
import online.threadly.user_authentication.service.AuthService;
import online.threadly.user_authentication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@EnableMethodSecurity(prePostEnabled = true)
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createUser(@RequestBody SignUpRequest signUpRequest){
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getUserByToken(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }
}
