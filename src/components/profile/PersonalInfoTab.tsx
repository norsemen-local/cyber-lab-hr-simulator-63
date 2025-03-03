
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalInfoProps {
  userProfile: {
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    manager: string;
    address: string;
    bio: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveChanges: () => void;
}

const PersonalInfoTab = ({ userProfile, handleChange, handleSaveChanges }: PersonalInfoProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={userProfile.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={userProfile.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={userProfile.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" value={userProfile.position} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={userProfile.department} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Input id="manager" value={userProfile.manager} onChange={handleChange} />
          </div>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={userProfile.address} onChange={handleChange} />
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={userProfile.bio} onChange={handleChange} className="h-32" />
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTab;
