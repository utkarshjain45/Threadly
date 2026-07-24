import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, updateUserPassword, type UserProfileUpdate } from "@/api/apis";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Loader2, Key, Lock } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState<Required<UserProfileUpdate>>({
    name: "",
    phone: "",
    address: ""
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center max-w-sm w-full shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-slate-500 mt-2 text-sm">Please log in to access your profile settings.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateUserProfile(formData);
      toast.success("Profile updated successfully!");
      // Reload page to force AuthContext refetch and sync across navbar/header
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error("New password cannot be the same as your current password");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      setIsChangingPassword(true);
      await updateUserPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password updated successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      console.error("Failed to update password:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to change password. Make sure your current password is correct.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getUserInitials = (nameString: string) => {
    if (!nameString) return "U";
    return nameString
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Profile Card Display */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-white mb-4">
              {getUserInitials(user?.name || "")}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || "User Account"}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            
            <div className="w-full border-t border-slate-100 my-5" />

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Shield className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                <span>Role: <strong className="text-slate-950 uppercase">{user?.role || "USER"}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Calendar className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                <span>Member Since: <strong className="text-slate-950">{formatDate(user?.createdAt)}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:col-span-8 space-y-8">
            {/* Edit Profile Settings Form Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Information
              </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Grid: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Email address cannot be changed.
                  </span>
                </div>
              </div>

              {/* Grid: Phone Number */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Textarea: Delivery Address */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Default Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter default shipping address"
                    rows={4}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="oldPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      id="oldPassword"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        </div>
      </main>
    </div>
  );
}
