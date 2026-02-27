import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/api";
import { oauth2Service } from "@/services/oauth2Service";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", gender: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize OAuth providers on component mount
  useEffect(() => {
    // Initialize Google
    oauth2Service.initializeGoogle();
  }, []);

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
            <h1 className="font-display text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join Salon Sanaru today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+94 77 123 4567"
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
            </div>

            {errors.general && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                {errors.general}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t border-border" />
              <span className="text-xs uppercase text-muted-foreground whitespace-nowrap">or sign up with</span>
              <span className="flex-1 border-t border-border" />
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

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
