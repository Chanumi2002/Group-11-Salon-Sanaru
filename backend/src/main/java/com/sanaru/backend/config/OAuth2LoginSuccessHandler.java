package com.sanaru.backend.config;

import com.sanaru.backend.model.User;
import com.sanaru.backend.service.UserService;
import com.sanaru.backend.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Value("${oauth2.frontend-uri:http://localhost:5173}")
    private String frontendUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oauth2User.getAttributes();

        String email = getEmail(attrs);
        String name = getName(attrs);

        if (email == null || email.isBlank()) {
            String redirectUrl = frontendUri + "/oauth/callback?error=email_required";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        try {
            User user = userService.findOrCreateFromOAuth(email, name);
            String token = jwtUtil.generateToken(user.getEmail());
            
            String redirectUrl = frontendUri + "/oauth/callback?token=" + token + "&email=" + email;
            if (user.getGender() != null) {
                redirectUrl += "&gender=" + user.getGender();
            }
            if (user.getRole() != null) {
                redirectUrl += "&role=" + user.getRole();
            }
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            String redirectUrl = frontendUri + "/oauth/callback?error=" + e.getMessage();
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
    }

    private String getEmail(Map<String, Object> attrs) {
        // Most providers use "email" directly
        Object email = attrs.get("email");
        if (email != null && !email.toString().isBlank()) {
            return email.toString();
        }
        
        // Some providers nest email in different places
        // For Facebook, we need to ensure email scope is requested
        Object emailObject = attrs.get("email");
        if (emailObject != null) {
            return emailObject.toString();
        }
        
        return null;
    }

    private String getName(Map<String, Object> attrs) {
        // Try to get name directly (most providers)
        Object name = attrs.get("name");
        if (name != null && !name.toString().isBlank()) {
            return name.toString();
        }
        
        // Try given_name and family_name (Google format)
        Object givenName = attrs.get("given_name");
        Object familyName = attrs.get("family_name");
        if (givenName != null || familyName != null) {
            String gname = givenName != null ? givenName.toString() : "";
            String fname = familyName != null ? familyName.toString() : "";
            return (gname + " " + fname).trim();
        }
        
        // Facebook uses "name" for full name
        Object fbName = attrs.get("name");
        if (fbName != null && !fbName.toString().isBlank()) {
            return fbName.toString();
        }
        
        return "User";
    }
}
