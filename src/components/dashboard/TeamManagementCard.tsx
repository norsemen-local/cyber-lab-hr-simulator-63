
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const TeamManagementCard = () => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-500" />
          Team Management
        </CardTitle>
        <CardDescription>View and manage your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm">Manage team members and approve requests.</p>
            <Button className="mt-4 w-full" variant="outline" size="sm">
              View Team
            </Button>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" 
              alt="Office worker" 
              className="rounded-md w-full h-40 object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamManagementCard;
