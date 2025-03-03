
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface AnnouncementBannerProps {
  id: string;
  message: string;
  variant?: "default" | "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  duration?: number | null; // in milliseconds, null means persistent
}

const variantStyles = {
  default: "bg-background border-border",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

const AnnouncementBanner = ({
  id,
  message,
  variant = "default",
  dismissible = true,
  duration = null,
}: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Check if this announcement was previously dismissed
  useEffect(() => {
    const dismissedAnnouncements = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );
    if (dismissedAnnouncements.includes(id)) {
      setIsVisible(false);
    }
  }, [id]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Save dismissal state to localStorage
    const dismissedAnnouncements = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );
    if (!dismissedAnnouncements.includes(id)) {
      dismissedAnnouncements.push(id);
      localStorage.setItem(
        "dismissedAnnouncements",
        JSON.stringify(dismissedAnnouncements)
      );
    }
  };

  if (!isVisible) return null;

  return (
    <Alert
      className={cn(
        "mb-4 px-4 py-3 rounded-md border animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <AlertDescription className="mr-2">{message}</AlertDescription>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default AnnouncementBanner;
