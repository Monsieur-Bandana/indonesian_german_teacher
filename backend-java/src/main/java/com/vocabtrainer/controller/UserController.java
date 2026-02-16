package com.vocabtrainer.controller;

import com.vocabtrainer.dto.LoginRequest;
import com.vocabtrainer.dto.RegisterRequest;
import com.vocabtrainer.dto.UserResponse;
import com.vocabtrainer.model.User;
import com.vocabtrainer.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Benutzername und Passwort sind erforderlich / Username dan kata sandi diperlukan"));
        }

        if (!"german".equals(request.getLearningLanguage()) && !"indonesian".equals(request.getLearningLanguage())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Ungültige Sprache / Bahasa tidak valid"));
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Benutzername bereits vergeben / Nama pengguna sudah digunakan"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setLearningLanguage(request.getLearningLanguage());

        user = userRepository.save(user);

        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername(), user.getLearningLanguage()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var user = userRepository.findByUsername(request.getUsername());

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Ungültige Anmeldedaten / Kredensial tidak valid"));
        }

        User found = user.get();
        return ResponseEntity.ok(new UserResponse(found.getId(), found.getUsername(), found.getLearningLanguage()));
    }
}
