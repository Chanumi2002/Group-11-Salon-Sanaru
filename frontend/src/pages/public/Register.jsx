import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, User, Mail, Phone, Lock, CircleUserRound } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/api";
import { oauth2Service } from "@/services/oauth2Service";
import { toast } from "sonner";
import logoImage from "@/assets/logo.jpeg";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", gender: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const navigate = useNavigate();



  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.phone.length < 8) e.phone = "Enter a valid phone number";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.gender) e.gender = "Gender is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);

      try {
        // Split name into first and last name
        const nameParts = form.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const userData = {
          firstName,
          lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender
        };

        const response = await authService.register(userData);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          if (response.data.role) {
            localStorage.setItem('role', response.data.role);
          }
          if (response.data.gender) {
            localStorage.setItem('gender', response.data.gender);
          }
        }
        toast.success(response.data.message || 'Registration successful!');
        setTimeout(() => {
          navigate(response.data.token ? '/customer_dashboard' : '/login');
        }, 2000);
      } catch (err) {
        console.error('Registration error:', err);
        const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setOAuthLoading(true);
    setErrors({});
    try {
      const result = await oauth2Service.handleGoogleLogin(credentialResponse);
      if (result.success) {
        toast.success('Google registration successful!');
        setTimeout(() => {
          navigate('/customer_dashboard', { replace: true });
        }, 2000);
      } else {
        setErrors({ general: result.error });
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Google registration error:', err);
      setErrors({ general: 'Google registration failed' });
      toast.error('Google registration failed');
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: 'Failed to register with Google' });
    toast.error('Failed to register with Google');
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
          className="relative w-full max-w-xl rounded-[28px] border border-[#e2d0b1]/85 bg-white/68 backdrop-blur-xl shadow-[0_24px_70px_-36px_rgba(63,37,30,0.45)] p-7 sm:p-9"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.48),rgba(255,255,255,0.16))]" />
          <div className="text-center mb-6">
            <img src={logoImage} alt="Salon Sanaru Logo" className="h-16 w-16 object-contain mx-auto mb-4 rounded-full ring-1 ring-[#d5b78b]/70 bg-white/85" />
            <p className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-black font-medium">Salon Sanaru</p>
            <h1 className="font-display text-3xl sm:text-[2.05rem] font-semibold tracking-tight text-black mt-2">Create Account</h1>
            <p className="text-sm text-black mt-1">Begin your luxury beauty journey</p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#574638] font-medium">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466]" />
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pl-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-[#574638] font-medium">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466]" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pl-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="text-[#574638] font-medium">Phone Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466]" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pl-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-[#574638] font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5 h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pl-10 pr-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
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
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-[#574638] font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466]" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5 h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] placeholder:text-[#9f8f80] pl-10 pr-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]"
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
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
            <div>
              <Label htmlFor="gender" className="text-[#574638] font-medium">Gender</Label>
              <div className="relative mt-1.5">
                <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e8466] z-10 pointer-events-none" />
                <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
                  <SelectTrigger className="h-12 rounded-xl border border-[#d9be95] bg-white/86 text-[#2b211b] pl-10 transition-all duration-200 hover:border-[#c8a979] focus-visible:ring-2 focus-visible:ring-[#b99767]/35 focus-visible:border-[#b99767]">
                  <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
            </div>

            {errors.general && (
              <div className="bg-[#fff0f2] border border-[#e8b3bb] text-[#8f1d2c] text-sm p-3 rounded-xl mb-4">
                {errors.general}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl border-0 text-white font-semibold bg-gradient-to-r from-[#6f0d1e] via-[#8b1127] to-[#a31531] shadow-[0_14px_26px_-18px_rgba(111,13,30,0.9)] hover:from-[#5c0a19] hover:via-[#770f21] hover:to-[#93112a] transition-all duration-300 hover:shadow-[0_18px_30px_-18px_rgba(111,13,30,0.95)]"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t border-[#d7c6af]" />
              <span className="text-xs uppercase text-[#8a7661] whitespace-nowrap tracking-[0.08em]">or sign up with</span>
              <span className="flex-1 border-t border-[#d7c6af]" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                width="280"
              />
            </div>
          </form>

          <p className="relative z-10 text-center text-sm text-[#6e5d4d] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#8b1127] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
