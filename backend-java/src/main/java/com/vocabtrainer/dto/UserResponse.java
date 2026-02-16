package com.vocabtrainer.dto;

public class UserResponse {

    private Integer id;
    private String username;
    private String learningLanguage;

    public UserResponse() {}

    public UserResponse(Integer id, String username, String learningLanguage) {
        this.id = id;
        this.username = username;
        this.learningLanguage = learningLanguage;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLearningLanguage() {
        return learningLanguage;
    }

    public void setLearningLanguage(String learningLanguage) {
        this.learningLanguage = learningLanguage;
    }
}
