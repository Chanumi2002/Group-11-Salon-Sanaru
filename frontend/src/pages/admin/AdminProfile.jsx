import { useState, useEffect } from "react";
import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Pencil, X, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/api";
import { toast } from "sonner";

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If no token, redirect to login
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    // If role is not ADMIN, redirect to appropriate page
    if (role && role !== 'ADMIN') {
      // Redirect customer to customer dashboard
      if (role === 'CUSTOMER') {
        window.location.href = '/customer_dashboard';
      } else {
        window.location.href = '/not-found';
      }
      return;
    }
    
    // If role is missing, fetch it from backend
    if (!role) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      fetch(`${backendUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          localStorage.setItem('role', data.role);
          if (data.role !== 'ADMIN') {
            if (data.role === 'CUSTOMER') {
              window.location.href = '/customer_dashboard';
            } else {
              window.location.href = '/not-found';
            }
            return;
          }
        }
        if (data.gender) {
          localStorage.setItem('gender', data.gender);
        }
        fetchUserProfile();
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        window.location.href = '/login';
      });
    } else {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      const data = response.data;
      const profile = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
      };
      setUser(profile);
      setDraft(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await authService.updateProfile({
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone: draft.phone,
        gender: draft.gender || null,
      });
      setUser({ ...draft });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordForm = () => {
    const e = {};
    if (!passwordForm.currentPassword) e.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) e.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 6) e.newPassword = "New password must be at least 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) e.confirmPassword = "Passwords do not match";
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    try {
      setChangingPassword(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      toast.success("Password updated successfully. A confirmation email has been sent.");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600">Manage your account and security settings</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-300 rounded-lg p-6 mb-6 bg-white"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {user?.firstName || "Admin"} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-block mt-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Admin
                </span>
              </div>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <AnimatePresence>
            {editing ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="font-semibold">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={draft.firstName}
                      onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="font-semibold">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={draft.lastName}
                      onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="font-semibold">
                    Phone Number
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender" className="font-semibold">
                    Gender (Optional)
                  </Label>
                  <Select value={draft.gender || ""} onValueChange={(value) => setDraft({ ...draft, gender: value })}>
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={saveProfile} disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setDraft(user);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Email</p>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {user?.email}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">First Name</p>
                    <p className="text-gray-900 mt-1">{user?.firstName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Last Name</p>
                    <p className="text-gray-900 mt-1">{user?.lastName || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold">Phone</p>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {user?.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-900 mt-1">{user?.gender || "—"}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Change Password Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-gray-300 rounded-lg p-6 mb-6 bg-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change Password
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
            <Input
              type="email"
              value={user?.email || ""}
              readOnly
              className="hidden"
              autoComplete="username"
              aria-hidden="true"
            />
            <div>
              <Label htmlFor="currentPassword" className="font-semibold">
                Current Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={`pr-10 ${passwordErrors.currentPassword ? "border-destructive" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-destructive text-sm mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword" className="font-semibold">
                New Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={`pr-10 ${passwordErrors.newPassword ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-destructive text-sm mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="font-semibold">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`pr-10 ${passwordErrors.confirmPassword ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" disabled={changingPassword} className="w-full">
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}

