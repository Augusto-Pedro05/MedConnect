package com.medconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * Authentication response — includes tokens and user context.
 * DAST audit surface: exposes user details in login response (info disclosure).
 */
@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    // DAST target: exposing internal IDs and role in the login response
}
