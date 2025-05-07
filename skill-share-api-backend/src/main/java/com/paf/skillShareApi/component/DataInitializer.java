package com.paf.skillShareApi.component;

import com.paf.skillShareApi.model.Authority;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only create if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
//            adminUser.setEnabled(true);

            Authority adminAuthority = new Authority();
            adminAuthority.setAuthority("ROLE_ADMIN");
            adminAuthority.setUser(adminUser);

            adminUser.setAuthorities(Collections.singletonList(adminAuthority));
            userRepository.save(adminUser);
        }

        // Similar for user role
        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
//            user.setEnabled(true);

            Authority userAuthority = new Authority();
            userAuthority.setAuthority("ROLE_USER");
            userAuthority.setUser(user);

            user.setAuthorities(Collections.singletonList(userAuthority));
            userRepository.save(user);
        }
    }
}