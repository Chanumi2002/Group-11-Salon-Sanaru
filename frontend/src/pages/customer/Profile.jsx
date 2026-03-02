import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Pencil, X, Trash2, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/api";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'CUSTOMER') {
      navigate('/not-found');
      return;
    }
    fetchUserProfile();
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

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      setDeleting(true);
      await authService.deleteProfile();
      authService.logout();
      toast.success("Your account has been deleted. A confirmation email has been sent.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="font-display text-2xl font-bold">My Profile</h1>

        <div className="bg-card rounded-xl shadow-salon p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user?.phone || "—"}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDraft({ ...user });
                setEditing(true);
              }}
              className="flex-1"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-xl shadow-salon p-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change Password
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4 max-w-md">
            <Input
              type="email"
              value={user?.email || ""}
              readOnly
              className="hidden"
              autoComplete="username"
              aria-hidden="true"
            />
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-salon-hover p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setEditing(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={draft.firstName || ""}
                    onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={draft.lastName || ""}
                    onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email (cannot be changed)</Label>
                  <Input value={draft.email || ""} disabled className="opacity-70" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={draft.phone || ""}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={draft.gender || ""}
                    onValueChange={(v) => setDraft({ ...draft, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={saveProfile} className="flex-1" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

