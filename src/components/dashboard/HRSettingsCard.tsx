
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, updateCompanyCode, getCompanyCode } from "../../services/authService";

interface HRSettingsCardProps {
  currentUser: User;
}

const HRSettingsCard = ({ currentUser }: HRSettingsCardProps) => {
  const { toast } = useToast();
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [showCompanyCodeSettings, setShowCompanyCodeSettings] = useState(false);
  
  const handleUpdateCompanyCode = () => {
    if (newCompanyCode.trim() === "") {
      toast({
        title: "Error",
        description: "Company registration code cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const success = updateCompanyCode(newCompanyCode, currentUser);
    
    if (success) {
      toast({
        title: "Success",
        description: "Company registration code updated successfully",
      });
      setNewCompanyCode("");
    } else {
      toast({
        title: "Error",
        description: "Only HR personnel can update the company registration code",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Settings className="mr-2 h-5 w-5 text-purple-500" />
          HR Settings
        </CardTitle>
        <CardDescription>Manage company settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="mb-4 w-full" 
          variant="outline" 
          size="sm"
          onClick={() => setShowCompanyCodeSettings(!showCompanyCodeSettings)}
        >
          {showCompanyCodeSettings ? "Hide Company Code Settings" : "Manage Company Registration Code"}
        </Button>
        
        {showCompanyCodeSettings && (
          <div className="space-y-4 bg-white/70 p-3 rounded-md">
            <div>
              <p className="text-sm font-medium mb-1">Current Company Registration Code:</p>
              <p className="text-sm bg-gray-100 p-2 rounded">{getCompanyCode()}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Update Company Registration Code:</p>
              <div className="flex gap-2">
                <Input
                  value={newCompanyCode}
                  onChange={(e) => setNewCompanyCode(e.target.value)}
                  placeholder="New code"
                  className="bg-white"
                />
                <Button onClick={handleUpdateCompanyCode}>Update</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HRSettingsCard;
