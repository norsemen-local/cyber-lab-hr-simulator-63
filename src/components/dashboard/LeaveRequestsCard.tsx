
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const LeaveRequestsCard = () => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-orange-500" />
          Leave Requests
        </CardTitle>
        <CardDescription>Manage your time off</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-sm text-center">No pending leave requests.</p>
        </div>
        <Button className="w-full" variant="outline" size="sm">
          Request Leave
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestsCard;
