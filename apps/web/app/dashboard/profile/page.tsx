'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Bell, CreditCard, Shield, LogOut, Crown, Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    newStyles: true,
    tips: true,
    updates: true,
    offers: true,
  });

  const [stats, setStats] = useState({
    tryOns: 0,
    favorites: 0,
    shared: 0,
  });

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('Please log in to view your profile');
          router.push('/login');
          return;
        }

        setUserId(user.id);

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData({
            fullName: profile.full_name || '',
            email: user.email || '',
            username: profile.username || '',
          });
          setAvatarUrl(profile.avatar_url);
          setNotifications(profile.notification_preferences || notifications);
        }

        // Fetch statistics
        const { data: tryOns } = await supabase
          .from('try_ons')
          .select('id, is_favorite')
          .eq('user_id', user.id);

        if (tryOns) {
          setStats({
            tryOns: tryOns.length,
            favorites: tryOns.filter((t: any) => t.is_favorite).length,
            shared: 0, // TODO: track shares
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          username: profileData.username,
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();

      // Upload to Supabase Storage
      const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/pricing');
    toast.info('Redirecting to pricing...');
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      toast.error('Failed to log out. Please try again.');
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    // Second confirmation
    const doubleConfirmed = window.confirm(
      'This will permanently delete all your data, including try-ons, favorites, and settings. Are you absolutely sure?'
    );
    if (!doubleConfirmed) return;

    setDeleting(true);
    try {
      const supabase = createClient();

      // Delete user data
      await supabase.from('try_ons').delete().eq('user_id', userId);
      await supabase.from('galleries').delete().eq('user_id', userId);

      // Note: Deleting the auth user requires admin API, which should be done via Edge Function
      // For now, we'll sign out and show a message
      await supabase.auth.signOut();

      toast.success('Account deletion initiated. You have been logged out.');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please contact support.');
      setDeleting(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    if (!userId) return;

    const newValue = !notifications[key];
    const newNotifications = { ...notifications, [key]: newValue };

    // Optimistic update
    setNotifications(newNotifications);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newNotifications })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      // Revert on error
      setNotifications(notifications);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.fullName.charAt(0) || 'U'}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
              <p className="text-gray-600">@{profileData.username}</p>
              <p className="text-sm text-gray-500 mt-1">{profileData.email}</p>

              <div className="flex items-center gap-2 mt-4">
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  Free Plan
                </div>
                <Button size="sm" variant="outline" onClick={handleUpgradeToPremium}>
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-brand-purple">{stats.tryOns}</p>
                  <p className="text-sm text-gray-600 mt-1">Try-Ons</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-brand-pink">{stats.favorites}</p>
                  <p className="text-sm text-gray-600 mt-1">Favorites</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-700">{stats.shared}</p>
                  <p className="text-sm text-gray-600 mt-1">Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'newStyles' as const, label: 'New style releases', description: 'Get notified when new styles are added' },
                { key: 'tips' as const, label: 'Tips and tutorials', description: 'Receive beauty tips and how-to guides' },
                { key: 'updates' as const, label: 'Product updates', description: 'News about new features' },
                { key: 'offers' as const, label: 'Special offers', description: 'Promotions and discounts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded cursor-pointer"
                    checked={notifications[item.key]}
                    onChange={() => handleNotificationChange(item.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Free plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Free Plan</h3>
                    <p className="text-gray-600">$0/month</p>
                  </div>
                  <Button onClick={handleUpgradeToPremium}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 10 try-ons per day</li>
                  <li>✓ Basic style library</li>
                  <li>✓ Watermarked exports</li>
                  <li>✗ Premium styles</li>
                  <li>✗ HD exports</li>
                  <li>✗ AI custom generation</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-gradient-brand rounded-lg text-white">
                <h4 className="font-bold mb-2">Premium Plan - $9.99/month</h4>
                <ul className="space-y-1 text-sm text-white/90 mb-4">
                  <li>✓ Unlimited try-ons</li>
                  <li>✓ Full style library (500+ styles)</li>
                  <li>✓ HD exports, no watermark</li>
                  <li>✓ AI custom generation</li>
                  <li>✓ Priority support</li>
                </ul>
                <Button variant="secondary" className="w-full" onClick={handleUpgradeToPremium}>
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
                {updatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
