package com.stationery_management.sm.repository;

import com.stationery_management.sm.dto.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<VerificationToken, Long> {
   Optional<VerificationToken> findByToken(String token);
}
