import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/api";
import { oauth2Service } from "@/services/oauth2Service";
import { toast } from "sonner";
import logoImage from "@/assets/logo.jpeg";

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
    <div className="min-h-screen flex flex-col bg-[#f3efe8] text-[#2b2522] [--background:42_28%_93%] [--foreground:20_14%_16%] [--card:0_0%_100%] [--card-foreground:20_14%_16%] [--muted:42_18%_89%] [--muted-foreground:22_10%_36%] [--border:39_34%_72%] [--input:0_0%_100%]">
      <Navbar />
      <div className="relative isolate flex-1 flex items-center justify-center p-4 sm:p-8 md:p-10 lg:p-14 xl:p-16 bg-[radial-gradient(1200px_600px_at_10%_8%,rgba(181,33,54,0.10),transparent_58%),radial-gradient(900px_540px_at_88%_15%,rgba(189,146,78,0.14),transparent_60%),linear-gradient(180deg,#faf7f3_0%,#f3eee7_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(165,137,102,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,137,102,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-[26px] border border-[#e2d0b1]/85 bg-white/68 backdrop-blur-xl shadow-[0_24px_70px_-36px_rgba(63,37,30,0.45)] p-7 sm:p-9"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[linear-gradient(135deg,rgba(255,255,255,0.48),rgba(255,255,255,0.16))]" />
          <div className="text-center mb-6">
            <img src={logoImage} alt="Salon Sanaru Logo" className="h-16 w-16 object-contain mx-auto mb-4 rounded-full ring-1 ring-[#d5b78b]/70 bg-white/85" />
            <p className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-black font-medium">Salon Sanaru</p>
            <h1 className="font-display text-3xl sm:text-[2.05rem] font-semibold tracking-tight text-black mt-2">Welcome Back</h1>
            <p className="text-sm text-black mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-[#fff0f2] border border-[#e8b3bb] text-[#8f1d2c] text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#574638] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                autoComplete="email"
                className="mt-1.5 h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[#574638] font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pr-10 focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7360] hover:text-[#2c211a]"
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
                className="border-[#c5a57a] data-[state=checked]:bg-[#7f0f23] data-[state=checked]:border-[#7f0f23]"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-[#5a4a3e]">
                Remember me
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl border-0 text-white font-semibold bg-gradient-to-r from-[#6f0d1e] via-[#8b1127] to-[#a31531] shadow-[0_14px_26px_-18px_rgba(111,13,30,0.9)] hover:from-[#5c0a19] hover:via-[#770f21] hover:to-[#93112a]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t border-[#d7c6af]" />
              <span className="text-xs uppercase text-[#8a7661] whitespace-nowrap tracking-[0.08em]">or continue with</span>
              <span className="flex-1 border-t border-[#d7c6af]" />
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

          <p className="relative z-10 text-center text-sm text-[#6e5d4d] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#8b1127] font-semibold hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
