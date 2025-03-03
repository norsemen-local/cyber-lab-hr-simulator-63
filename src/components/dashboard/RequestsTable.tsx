
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Request {
  id: string;
  type: string;
  submittedDate: string;
  status: "approved" | "pending" | "rejected";
  priority: "high" | "medium" | "low";
}

const mockRequests: Request[] = [
  {
    id: "REQ-001",
    type: "Leave Request",
    submittedDate: "2023-10-15",
    status: "approved",
    priority: "medium"
  },
  {
    id: "REQ-002",
    type: "Equipment Purchase",
    submittedDate: "2023-10-18",
    status: "pending",
    priority: "high"
  },
  {
    id: "REQ-003",
    type: "Training Request",
    submittedDate: "2023-10-20",
    status: "rejected",
    priority: "low"
  },
  {
    id: "REQ-004",
    type: "Time Off Request",
    submittedDate: "2023-10-25",
    status: "pending",
    priority: "medium"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "low":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const RequestsTable = () => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="text-left font-medium p-3">ID</th>
                <th className="text-left font-medium p-3">REQUEST TYPE</th>
                <th className="text-left font-medium p-3">SUBMITTED</th>
                <th className="text-left font-medium p-3">PRIORITY</th>
                <th className="text-left font-medium p-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">{request.id}</td>
                  <td className="p-3 text-sm">{request.type}</td>
                  <td className="p-3 text-sm">{request.submittedDate}</td>
                  <td className="p-3 text-sm">
                    <Badge variant="outline" className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestsTable;
