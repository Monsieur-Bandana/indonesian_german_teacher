package com.vocabtrainer.repository;

import com.vocabtrainer.model.VocabProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VocabProgressRepository extends JpaRepository<VocabProgress, Integer> {

    List<VocabProgress> findByUserId(Integer userId);

    Optional<VocabProgress> findByUserIdAndVocabId(Integer userId, Integer vocabId);
}
