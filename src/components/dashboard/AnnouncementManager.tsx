
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AnnouncementData {
  id: string;
  message: string;
  variant: "default" | "info" | "success" | "warning" | "error";
  dismissible: boolean;
}

interface AnnouncementManagerProps {
  onAddAnnouncement: (announcement: AnnouncementData) => void;
}

const AnnouncementManager = ({ onAddAnnouncement }: AnnouncementManagerProps) => {
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<"default" | "info" | "success" | "warning" | "error">("info");
  const [dismissible, setDismissible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const announcement: AnnouncementData = {
      id: `announcement-${Date.now()}`,
      message,
      variant,
      dismissible,
    };
    
    onAddAnnouncement(announcement);
    
    // Reset form
    setMessage("");
    setVariant("info");
    setDismissible(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Announcement</CardTitle>
        <CardDescription>
          Add a new announcement to display on the dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Announcement Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="variant">Style</Label>
            <Select value={variant} onValueChange={(value: any) => setVariant(value)}>
              <SelectTrigger id="variant">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="dismissible"
              checked={dismissible}
              onCheckedChange={setDismissible}
            />
            <Label htmlFor="dismissible">Allow users to dismiss</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Create Announcement</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AnnouncementManager;
