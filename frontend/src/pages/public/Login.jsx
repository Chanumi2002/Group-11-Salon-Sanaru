import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/api";
import { oauth2Service } from "@/services/oauth2Service";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/customer_dashboard";

  // Initialize OAuth providers on component mount
  useEffect(() => {
    // Initialize Google
    oauth2Service.initializeGoogle();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        let userRole = null;
        if (response.data.role) {
          userRole = response.data.role;
          localStorage.setItem('role', response.data.role);
        }
        if (response.data.gender) {
          localStorage.setItem('gender', response.data.gender);
        }
        toast.success(response.data.message || 'Login successful!');
        
        // Redirect based on user role
        const redirectPath = userRole === 'ADMIN' ? '/admin_dashboard' : from;
        navigate(redirectPath, { replace: true });
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setOAuthLoading(true);
    setError("");
    try {
      const result = await oauth2Service.handleGoogleLogin(credentialResponse);
      if (result.success) {
        const role = localStorage.getItem('role');
        toast.success('Google login successful!');
        const redirectPath = role === 'ADMIN' ? '/admin_dashboard' : from;
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed');
      toast.error('Google login failed');
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Failed to login with Google');
    toast.error('Failed to login with Google');
  };



  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card rounded-xl shadow-salon p-8"
        >
          <div className="text-center mb-6">
            <img src="/logo.jpeg" alt="Salon Sanaru Logo" className="h-16 w-16 object-contain mx-auto mb-3 rounded-full" />
            <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t border-border" />
              <span className="text-xs uppercase text-muted-foreground whitespace-nowrap">or continue with</span>
              <span className="flex-1 border-t border-border" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                width="280"
              />
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
