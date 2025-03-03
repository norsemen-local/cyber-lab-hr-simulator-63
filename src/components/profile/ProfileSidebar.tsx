
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Building, Calendar } from "lucide-react";

interface ProfileSidebarProps {
  userProfile: {
    name: string;
    email: string;
    position: string;
    department: string;
    phone: string;
    address: string;
    hireDate: string;
    manager: string;
  };
  setActiveTab: (tab: string) => void;
}

const ProfileSidebar = ({ userProfile, setActiveTab }: ProfileSidebarProps) => {
  return (
    <>
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{userProfile.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{userProfile.position}</p>
            <p className="text-xs text-gray-500">{userProfile.department}</p>
            
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{userProfile.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{userProfile.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span>Reports to: {userProfile.manager}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Hired: {userProfile.hireDate}</span>
              </div>
            </div>
            
            <Button 
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setActiveTab("personal")}
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileSidebar;
