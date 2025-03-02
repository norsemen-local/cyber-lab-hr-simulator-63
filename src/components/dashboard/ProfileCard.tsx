
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { User as UserType } from "../../services/authService";

interface ProfileCardProps {
  user: UserType;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-500" />
          My Profile
        </CardTitle>
        <CardDescription>View and update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-medium">Name:</span> {user.name}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-sm">
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <Button className="mt-4 w-full" variant="outline" size="sm">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
