
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Palette, 
  UserPlus, 
  KeyRound, 
  Languages, 
  Monitor, 
  Activity,
  CheckCircle
} from "lucide-react";

const Settings = () => {
  const [accountSettings, setAccountSettings] = useState({
    name: "John Anderson",
    email: "john.anderson@techpro.com",
    phone: "+1 (555) 123-4567",
    language: "english",
    timezone: "utc-8",
    twoFactorEnabled: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    browser: true,
    mobile: false,
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    fontSize: 14,
    density: "comfortable",
    animations: true
  });

  const updateAccountSetting = (key: string, value: any) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and application settings</p>
      </div>

      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="account" className="w-full">
            <div className="flex flex-col md:flex-row">
              <TabsList className="flex-col items-start space-y-1 rounded-none border-r p-4 h-auto md:w-60">
                <TabsTrigger value="account" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="privacy" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="language" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Language & Region
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 p-6">
                <TabsContent value="account" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={accountSettings.name} 
                            onChange={(e) => updateAccountSetting('name', e.target.value)} 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={accountSettings.email} 
                            onChange={(e) => updateAccountSetting('email', e.target.value)} 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={accountSettings.phone} 
                            onChange={(e) => updateAccountSetting('phone', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                      <div className="grid gap-4">
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Update Profile Photo
                        </Button>
                        <Button variant="outline">
                          Download My Data
                        </Button>
                        <Button variant="destructive">
                          Deactivate Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="mt-2">
                          <KeyRound className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Step Verification</Label>
                          <p className="text-sm text-gray-500">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch 
                          checked={accountSettings.twoFactorEnabled} 
                          onCheckedChange={(checked) => updateAccountSetting('twoFactorEnabled', checked)} 
                        />
                      </div>
                      
                      {accountSettings.twoFactorEnabled && (
                        <Card className="mt-4">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">Two-Factor Authentication is Enabled</h3>
                                <p className="text-sm text-gray-500">Your account is secured with 2FA</p>
                              </div>
                            </div>
                            <Button className="mt-4" variant="outline">
                              Reconfigure 2FA
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Session Management</h2>
                      <Button variant="outline">
                        Sign Out All Other Devices
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-500">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch 
                            checked={notificationSettings.email} 
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, email: checked}))} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Browser Notifications</Label>
                            <p className="text-sm text-gray-500">
                              Show browser notifications
                            </p>
                          </div>
                          <Switch 
                            checked={notificationSettings.browser} 
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, browser: checked}))} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Mobile Notifications</Label>
                            <p className="text-sm text-gray-500">
                              Push notifications to your mobile device
                            </p>
                          </div>
                          <Switch 
                            checked={notificationSettings.mobile} 
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, mobile: checked}))} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Notification Types</h2>
                      
                      <div className="grid gap-6">
                        <div className="grid grid-cols-1 gap-2">
                          <Label>System Announcements</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Announcements</SelectItem>
                              <SelectItem value="important">Important Only</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <Label>Document Updates</Label>
                          <Select defaultValue="important">
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Updates</SelectItem>
                              <SelectItem value="important">Important Only</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <Label>Task Assignments</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Assignments</SelectItem>
                              <SelectItem value="important">Important Only</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-3 block">Theme Mode</Label>
                          <RadioGroup 
                            defaultValue={appearanceSettings.theme}
                            onValueChange={(value) => setAppearanceSettings(prev => ({...prev, theme: value}))}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="light" id="theme-light" />
                              <Label htmlFor="theme-light">Light</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="dark" id="theme-dark" />
                              <Label htmlFor="theme-dark">Dark</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="system" id="theme-system" />
                              <Label htmlFor="theme-system">System</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Font Size</Label>
                            <span className="text-sm">{appearanceSettings.fontSize}px</span>
                          </div>
                          <Slider 
                            defaultValue={[appearanceSettings.fontSize]} 
                            min={12} 
                            max={20} 
                            step={1}
                            onValueChange={([value]) => setAppearanceSettings(prev => ({...prev, fontSize: value}))}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-3 block">Interface Density</Label>
                          <RadioGroup 
                            defaultValue={appearanceSettings.density}
                            onValueChange={(value) => setAppearanceSettings(prev => ({...prev, density: value}))}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="compact" id="density-compact" />
                              <Label htmlFor="density-compact">Compact</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="comfortable" id="density-comfortable" />
                              <Label htmlFor="density-comfortable">Comfortable</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-0.5">
                            <Label>Interface Animations</Label>
                            <p className="text-sm text-gray-500">
                              Enable smooth transitions and animations
                            </p>
                          </div>
                          <Switch 
                            checked={appearanceSettings.animations} 
                            onCheckedChange={(checked) => setAppearanceSettings(prev => ({...prev, animations: checked}))} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Profile Visibility</Label>
                            <p className="text-sm text-gray-500">
                              Control who can see your profile information
                            </p>
                          </div>
                          <Select defaultValue="team">
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="team">Team Only</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Activity Status</Label>
                            <p className="text-sm text-gray-500">
                              Show when you are active on the platform
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Read Receipts</Label>
                            <p className="text-sm text-gray-500">
                              Let others know when you've read their messages
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Data Usage</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Analytics</Label>
                            <p className="text-sm text-gray-500">
                              Allow anonymous usage data collection
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Personalization</Label>
                            <p className="text-sm text-gray-500">
                              Allow personalized recommendations
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button variant="outline">
                          Privacy Policy
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="language" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Language Preferences</h2>
                      
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="language">Display Language</Label>
                          <Select 
                            defaultValue={accountSettings.language}
                            onValueChange={(value) => updateAccountSetting('language', value)}
                          >
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="spanish">Spanish</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="german">German</SelectItem>
                              <SelectItem value="japanese">Japanese</SelectItem>
                              <SelectItem value="chinese">Chinese (Simplified)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="timezone">Time Zone</Label>
                          <Select 
                            defaultValue={accountSettings.timezone}
                            onValueChange={(value) => updateAccountSetting('timezone', value)}
                          >
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC (GMT)</SelectItem>
                              <SelectItem value="utc-5">Eastern Time (GMT-5)</SelectItem>
                              <SelectItem value="utc-8">Pacific Time (GMT-8)</SelectItem>
                              <SelectItem value="utc+1">Central European Time (GMT+1)</SelectItem>
                              <SelectItem value="utc+8">China Standard Time (GMT+8)</SelectItem>
                              <SelectItem value="utc+9">Japan Standard Time (GMT+9)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="date-format">Date Format</Label>
                          <Select defaultValue="mdy">
                            <SelectTrigger id="date-format">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                              <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                              <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardWithSidebar>
  );
};

export default Settings;
