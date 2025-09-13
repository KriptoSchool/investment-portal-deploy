'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, CreditCard, Globe, Save, Settings as SettingsIcon, Lock, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    language: 'en',
    timezone: 'Asia/Kuala_Lumpur',
    currency: 'MYR'
  });
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }
    
    setLoading(false);
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Auto-save settings immediately
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    // Show notification for important changes
    const notification = document.createElement('div');
    notification.innerHTML = '✅ Setting updated successfully!';
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  };
  
  const handleProfileChange = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.innerHTML = '✅ Settings saved successfully!';
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      document.body.removeChild(successMsg);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2EE6A6] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Settings</h1>
        <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Premium Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[12px] p-1">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="flex items-center text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                <div className="p-2 bg-[rgba(46,230,166,0.1)] rounded-[8px] mr-3">
                  <User className="h-5 w-5 text-[#2EE6A6]" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue={currentUser?.full_name || ''}
                    placeholder="Enter your full name"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser?.email || ''}
                    placeholder="Enter your email"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Role</Label>
                  <Input
                    id="role"
                    defaultValue={currentUser?.role || 'AGENT'}
                    disabled
                    className="bg-[rgba(230,236,242,0.04)] border-[rgba(230,236,242,0.08)] text-[#A8B3C2] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[120px] px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] placeholder-[#A8B3C2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] resize-none"
                  placeholder="Tell us about yourself..."
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
              </div>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="flex items-center text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[8px] mr-3">
                  <Bell className="h-5 w-5 text-[#FFB020]" />
                </div>
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[rgba(230,236,242,0.04)] rounded-[12px] border border-[rgba(230,236,242,0.08)]">
                <div className="space-y-1">
                  <Label className="text-[15px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Email Notifications</Label>
                  <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  className="data-[state=checked]:bg-[#2EE6A6]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[rgba(230,236,242,0.04)] rounded-[12px] border border-[rgba(230,236,242,0.08)]">
                <div className="space-y-1">
                  <Label className="text-[15px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Push Notifications</Label>
                  <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  className="data-[state=checked]:bg-[#2EE6A6]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[rgba(230,236,242,0.04)] rounded-[12px] border border-[rgba(230,236,242,0.08)]">
                <div className="space-y-1">
                  <Label className="text-[15px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Marketing Emails</Label>
                  <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>
                    Receive emails about new features and updates
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                  className="data-[state=checked]:bg-[#2EE6A6]"
                />
              </div>
              
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="flex items-center text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                <div className="p-2 bg-[rgba(240,68,68,0.1)] rounded-[8px] mr-3">
                  <Shield className="h-5 w-5 text-[#F04444]" />
                </div>
                Security Settings
              </CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Profile Information */}
              <div className="bg-[rgba(230,236,242,0.04)] rounded-[12px] border border-[rgba(230,236,242,0.08)] p-6">
                <h4 className="text-[16px] font-semibold text-[#E6ECF2] mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={profileData.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={profileData.company}
                      onChange={(e) => handleProfileChange('company', e.target.value)}
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-[rgba(230,236,242,0.04)] rounded-[12px] border border-[rgba(230,236,242,0.08)] p-6">
                <h4 className="font-semibold text-[16px] text-[#E6ECF2] mb-4 flex items-center" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <Lock className="h-4 w-4 mr-2 text-[#F04444]" />
                  Change Password
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#F04444] to-[#FF6B6B] hover:from-[#E03E3E] hover:to-[#FF5757] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#F04444]/25 transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <Save className="h-4 w-4 mr-2" />
                Update Security
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="flex items-center text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[8px] mr-3">
                  <Globe className="h-5 w-5 text-[#3EA8FF]" />
                </div>
                Application Preferences
              </CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Language</Label>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">Greenwich Mean Time</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Default Currency</Label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] h-12"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  <option value="MYR">MYR - Malaysian Ringgit</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </select>
              </div>
              
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}