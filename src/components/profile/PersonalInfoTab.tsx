
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bio: string;
}

interface PersonalInfoProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const PersonalInfoTab = ({ userProfile, onSave }: PersonalInfoProps) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    if (id === "street" || id === "city" || id === "state" || id === "zipCode" || id === "country") {
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [id]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSave(profile);
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully",
      });
    }, 1000);
  };

  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={profile.firstName} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={profile.lastName} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" value={profile.position} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={profile.department} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Input id="manager" value={profile.manager} onChange={handleChange} />
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" value={profile.address.street} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={profile.address.city} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={profile.address.state} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" value={profile.address.zipCode} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={profile.address.country} onChange={handleChange} />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={profile.bio} onChange={handleChange} className="h-32" />
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTab;
