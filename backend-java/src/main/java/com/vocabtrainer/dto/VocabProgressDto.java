package com.vocabtrainer.dto;

public class VocabProgressDto {

    private Integer vocabId;
    private String interval;
    private Long timestamp;
    private Integer greenStreak;

    public VocabProgressDto() {}

    public VocabProgressDto(Integer vocabId, String interval, Long timestamp, Integer greenStreak) {
        this.vocabId = vocabId;
        this.interval = interval;
        this.timestamp = timestamp;
        this.greenStreak = greenStreak;
    }

    public Integer getVocabId() {
        return vocabId;
    }

    public void setVocabId(Integer vocabId) {
        this.vocabId = vocabId;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getGreenStreak() {
        return greenStreak;
    }

    public void setGreenStreak(Integer greenStreak) {
        this.greenStreak = greenStreak;
    }
}
