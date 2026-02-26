import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      if (error === "email_required") {
        toast.error("Could not get email from provider. Please use email/password or ensure your Google/Facebook account has an email.");
      } else {
        toast.error("Login was cancelled or failed. Please try again.");
      }
      navigate("/login", { replace: true });
      return;
    }
    if (token) {
      localStorage.setItem("token", token);
      
      // Get user role from backend
      fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          localStorage.setItem('role', data.role);
        }
        if (data.gender) {
          localStorage.setItem('gender', data.gender);
        }
        toast.success("Signed in successfully!");
        // Redirect based on role
        const redirectPath = data.role === 'ADMIN' ? '/admin_dashboard' : '/customer_dashboard';
        navigate(redirectPath, { replace: true });
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        // Default to customer dashboard if profile fetch fails
        toast.success("Signed in successfully!");
        navigate("/customer_dashboard", { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, [token, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
