
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

// This would be the actual RDS endpoint in a real application
const DB_ENDPOINT = "hr-portal-db.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com";

const DatabaseInfo = () => {
  const [showDbInfo, setShowDbInfo] = useState(false);

  return (
    <div className="pt-2">
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="w-full text-xs" 
        onClick={() => setShowDbInfo(!showDbInfo)}
      >
        <Database className="mr-1 h-3 w-3" />
        {showDbInfo ? "Hide" : "Show"} Database Information
      </Button>
      
      {showDbInfo && (
        <div className="mt-2 p-3 bg-slate-50 rounded text-xs">
          <p className="font-semibold">Real Database Configuration:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-700">
            <li>Engine: MySQL 8.0</li>
            <li>Host: {DB_ENDPOINT}</li>
            <li>Schema: hr_portal</li>
            <li>Table: users</li>
            <li>Connection: Unencrypted (security vulnerability)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DatabaseInfo;
