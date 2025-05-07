package com.paf.skillShareApi.security;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb";

    public String generateToken(UserDetails userDetails) {
        JwtBuilder builder = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                //token will be expired in 50 years
                .setExpiration(Date.from(ZonedDateTime.now().plusYears(50).toInstant()));

        // Safely add roles only if there are authorities
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            Optional<String> firstAuthority = userDetails.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .findFirst();

            if (firstAuthority.isPresent()) {
                builder.claim("roles", firstAuthority.get());
            }
        }

        builder.claim("name", "chathuranga");

        return builder.signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername());
    }
}
