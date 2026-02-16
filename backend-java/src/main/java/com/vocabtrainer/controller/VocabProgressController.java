package com.vocabtrainer.controller;

import com.vocabtrainer.dto.VocabProgressDto;
import com.vocabtrainer.model.VocabProgress;
import com.vocabtrainer.repository.UserRepository;
import com.vocabtrainer.repository.VocabProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vocabprogress")
public class VocabProgressController {

    private final VocabProgressRepository vocabProgressRepository;
    private final UserRepository userRepository;

    public VocabProgressController(VocabProgressRepository vocabProgressRepository, UserRepository userRepository) {
        this.vocabProgressRepository = vocabProgressRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProgress(@PathVariable Integer userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Benutzer nicht gefunden / Pengguna tidak ditemukan"));
        }

        List<VocabProgressDto> progress = vocabProgressRepository.findByUserId(userId).stream()
                .map(vp -> new VocabProgressDto(vp.getVocabId(), vp.getInterval(), vp.getTimestamp(), vp.getGreenStreak()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(progress);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> saveProgress(@PathVariable Integer userId, @RequestBody List<VocabProgressDto> entries) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Benutzer nicht gefunden / Pengguna tidak ditemukan"));
        }

        for (VocabProgressDto entry : entries) {
            var existing = vocabProgressRepository.findByUserIdAndVocabId(userId, entry.getVocabId());

            if (existing.isPresent()) {
                VocabProgress vp = existing.get();
                vp.setInterval(entry.getInterval());
                vp.setTimestamp(entry.getTimestamp());
                vp.setGreenStreak(entry.getGreenStreak());
                vocabProgressRepository.save(vp);
            } else {
                VocabProgress vp = new VocabProgress();
                vp.setUserId(userId);
                vp.setVocabId(entry.getVocabId());
                vp.setInterval(entry.getInterval());
                vp.setTimestamp(entry.getTimestamp());
                vp.setGreenStreak(entry.getGreenStreak());
                vocabProgressRepository.save(vp);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Fortschritt gespeichert / Kemajuan disimpan"));
    }
}
