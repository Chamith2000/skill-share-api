//package com.paf.skillShareApi.security;
//
//import lombok.AllArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.ProviderManager;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//@Slf4j
//@Configuration
//@AllArgsConstructor
//@EnableWebSecurity
//@EnableMethodSecurity(
//        securedEnabled = true,   // enable @Secured
//        jsr250Enabled = true    // Enable @RolesAllowed
//)
//public class SecurityConfig {
//
//
//    private com.paf.skillShareApi.security.JwtFilter jwtFilter;
//    private PasswordEncoder passwordEncoder;
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http.csrf(AbstractHttpConfigurer::disable)
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/public", "/api/register", "/api/login").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                );
////                .httpBasic(basic -> basic
////                        .realmName("Spring Security Basic")
////                );
//        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
//        return http.build();
//    }
//
//    //getting the default authentication manager
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
//        return authenticationConfiguration.getAuthenticationManager();
//    }
//
//    //configure your own authentication manager
////    @Bean
////    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService) {
////        return new ProviderManager(
////                new DaoAuthenticationProvider() {{
////                    setUserDetailsService(userDetailsService);
////                    setPasswordEncoder(passwordEncoder);
////                }}
////        );
////    }
//}