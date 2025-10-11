package com.stationery_management.sm.service;

import com.stationery_management.sm.config.JwtService;
import com.stationery_management.sm.dto.LoginRequest;
import com.stationery_management.sm.dto.RegisterRequest;
import com.stationery_management.sm.dto.VerificationToken;
import com.stationery_management.sm.entity.Role;
import com.stationery_management.sm.entity.User;
import com.stationery_management.sm.repository.TokenRepository;
import com.stationery_management.sm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String registerUser(RegisterRequest req){
        if(userRepository.findByEmail(req.getEmail()).isPresent()){
            return "Email already registered";
        }

        User user = User.builder()
                .fullname(req.getFullname())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.USER)
                .enabled(false)
                .build();

        userRepository.save(user);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(verificationToken);

        String verifyLink = "http://localhost:8080/api/auth/verify?token=" + token;
        String emailBody = "Hi " + user.getFullname() + ",\n\nPlease verify your account by clicking the link below:\n"
                + verifyLink + "\n\nThis link will expire in 24 hours.";

        emailService.sendEmail(user.getEmail(), "Verify your account", emailBody);

        return "Registration successful! Check your email for verification link.";
    }

    public String login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return "User not found";
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return "Email not verified. Please check your inbox.";
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return "Invalid credentials";
        }

        return jwtService.generateToken(user.getEmail());
    }

    public String verifyToken(String token) {
        Optional<VerificationToken> optionalToken = tokenRepository.findByToken(token);

        if (optionalToken.isEmpty()) return "Invalid verification token.";

        VerificationToken verificationToken = optionalToken.get();

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "Token expired. Please register again.";
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        tokenRepository.delete(verificationToken);

        return "Email verified successfully! You can now login.";
    }
}