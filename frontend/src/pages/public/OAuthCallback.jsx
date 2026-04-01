import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { oauth2Service } from "@/services/oauth2Service";

/**
 * OAuth Callback page - Handles redirects from backend OAuth2 login
 * This is used when Spring Security handles the OAuth2 flow directly
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const result = oauth2Service.handleOAuthCallback(searchParams);
    
    if (result.success) {
      toast.success('OAuth login successful!');
      const role = localStorage.getItem('role');
      const redirectPath = role === 'ADMIN' ? '/admin_dashboard' : '/customer_dashboard';
      
      // Redirect after a short delay to allow user to see the success message
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } else {
      toast.error(result.error || 'Login was cancelled or failed. Please try again.');
      
      // Redirect to login after showing error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing OAuth Login...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate your account.</p>
        
        <div className="mt-8 flex justify-center">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
