
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, AlertTriangle, Info, CheckCircle, Trash2 } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  date: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday, 10 PM - 2 AM. Some features may be unavailable.",
      type: "info",
      read: false,
      date: "2023-11-10 09:30"
    },
    {
      id: 2,
      title: "Leave Request Approved",
      message: "Your leave request for Nov 15-18 has been approved by your manager.",
      type: "success",
      read: false,
      date: "2023-11-09 14:25"
    },
    {
      id: 3,
      title: "Document Access Alert",
      message: "Multiple access attempts to restricted documents were detected from your account.",
      type: "warning",
      read: false,
      date: "2023-11-08 11:15"
    },
    {
      id: 4,
      title: "Training Deadline",
      message: "Mandatory security training must be completed by Nov 30.",
      type: "error",
      read: true,
      date: "2023-11-05 16:40"
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    browser: true,
    mobile: false,
    leaveRequests: true,
    documentUploads: true,
    systemAlerts: true
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with important alerts and messages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg transition ${notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-purple-500'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{notification.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  New
                                </Badge>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-xs text-purple-600"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Delivery Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Email Notifications</label>
                      <Switch 
                        checked={notificationSettings.email} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, email: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Browser Notifications</label>
                      <Switch 
                        checked={notificationSettings.browser} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, browser: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Mobile Notifications</label>
                      <Switch 
                        checked={notificationSettings.mobile} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, mobile: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Notification Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Leave Requests</label>
                      <Switch 
                        checked={notificationSettings.leaveRequests} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, leaveRequests: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Document Uploads</label>
                      <Switch 
                        checked={notificationSettings.documentUploads} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, documentUploads: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">System Alerts</label>
                      <Switch 
                        checked={notificationSettings.systemAlerts} 
                        onCheckedChange={checked => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default Notifications;
