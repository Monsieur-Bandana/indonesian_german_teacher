package com.vocabtrainer.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    private final Path audioDir;

    public AudioController() {
        this.audioDir = Paths.get(System.getProperty("user.dir"), "AudioFiles");
        try {
            Files.createDirectories(audioDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create AudioFiles directory", e);
        }
    }

    @GetMapping("/check/{vocabId}/{lang}")
    public ResponseEntity<?> checkAudio(@PathVariable int vocabId, @PathVariable String lang) {
        if (!"d".equals(lang) && !"i".equals(lang)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'"));
        }

        String fileName = vocabId + lang + ".webm";
        Path filePath = audioDir.resolve(fileName);
        return ResponseEntity.ok(Map.of("exists", Files.exists(filePath)));
    }

    @GetMapping("/{vocabId}/{lang}")
    public ResponseEntity<?> getAudio(@PathVariable int vocabId, @PathVariable String lang) {
        if (!"d".equals(lang) && !"i".equals(lang)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'"));
        }

        String fileName = vocabId + lang + ".webm";
        Path filePath = audioDir.resolve(fileName);

        if (!Files.exists(filePath)) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Audiodatei nicht gefunden / File audio tidak ditemukan"));
        }

        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/webm"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @PostMapping("/{vocabId}/{lang}")
    public ResponseEntity<?> uploadAudio(
            @PathVariable int vocabId,
            @PathVariable String lang,
            @RequestParam("audio") MultipartFile audio) {

        if (!"d".equals(lang) && !"i".equals(lang)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'"));
        }

        if (audio.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Keine Audiodatei gesendet / Tidak ada file audio yang dikirim"));
        }

        if (audio.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Datei zu groß (max 5MB) / File terlalu besar (maks 5MB)"));
        }

        String fileName = vocabId + lang + ".webm";
        Path filePath = audioDir.resolve(fileName);

        try {
            Files.write(filePath, audio.getBytes());
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Fehler beim Speichern / Gagal menyimpan"));
        }

        return ResponseEntity.ok(Map.of("message", "Audio gespeichert / Audio disimpan", "fileName", fileName));
    }
}
