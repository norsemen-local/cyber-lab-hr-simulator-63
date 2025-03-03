
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SensitiveInfoCardProps {
  userProfile: {
    socialSecurity: string;
    bankAccount: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveChanges: () => void;
}

const SensitiveInfoCard = ({ userProfile, handleChange, handleSaveChanges }: SensitiveInfoCardProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sensitive Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="socialSecurity">Social Security Number</Label>
            <Input 
              id="socialSecurity" 
              value={userProfile.socialSecurity} 
              onChange={handleChange}
              className="bg-gray-50" 
            />
          </div>
          <div>
            <Label htmlFor="bankAccount">Bank Account</Label>
            <Input 
              id="bankAccount" 
              value={userProfile.bankAccount} 
              onChange={handleChange}
              className="bg-gray-50" 
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleSaveChanges}
          >
            Save Sensitive Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensitiveInfoCard;
