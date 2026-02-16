package com.vocabtrainer.model;

import jakarta.persistence.*;

@Entity
@Table(name = "VocabProgress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"UserId", "VocabId"})
})
public class VocabProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "UserId", nullable = false)
    private Integer userId;

    @Column(name = "VocabId", nullable = false)
    private Integer vocabId;

    @Column(name = "Interval", nullable = false, length = 20)
    private String interval;

    @Column(name = "Timestamp", nullable = false)
    private Long timestamp;

    @Column(name = "GreenStreak", nullable = false)
    private Integer greenStreak = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    public VocabProgress() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
