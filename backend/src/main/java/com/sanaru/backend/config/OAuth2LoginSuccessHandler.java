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

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oauth2User.getAttributes();

        String email = getEmail(attrs);
        String name = getName(attrs);

        if (email == null || email.isBlank()) {
            String redirectUrl = frontendUrl + "/oauth/callback?error=email_required";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        User user = userService.findOrCreateFromOAuth(email, name);
        String token = jwtUtil.generateToken(user.getEmail());

        String redirectUrl = frontendUrl + "/oauth/callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String getEmail(Map<String, Object> attrs) {
        Object email = attrs.get("email");
        if (email != null)
            return email.toString();
        // Some providers use sub or other keys
        Object sub = attrs.get("sub");
        if (sub != null && attrs.get("email") == null) {
            // Google sometimes has email in "email" - if not, we need email scope
            return null;
        }
        return null;
    }

    private String getName(Map<String, Object> attrs) {
        Object name = attrs.get("name");
        if (name != null)
            return name.toString();
        Object givenName = attrs.get("given_name");
        Object familyName = attrs.get("family_name");
        if (givenName != null || familyName != null) {
            return (givenName != null ? givenName.toString() : "") + " "
                    + (familyName != null ? familyName.toString() : "").trim();
        }
        return "User";
    }
}
