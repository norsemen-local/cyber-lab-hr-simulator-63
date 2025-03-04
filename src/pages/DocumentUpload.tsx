
import { useState, useEffect } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { useToast } from "@/components/ui/use-toast";
import DocumentUploadForm from "@/features/documents/DocumentUploadForm";
import RecentDocumentsList from "@/features/documents/RecentDocumentsList";
import { uploadDocument, getRecentDocuments } from "@/services/documentService";

const DocumentUpload = () => {
  const { toast } = useToast();
  const recentDocuments = getRecentDocuments();

  // Add a script to disable CORS for demonstration purposes
  useEffect(() => {
    // Create a script element to attempt disabling same-origin policy
    // Note: This is for educational purposes only, browser security will prevent this from working directly
    const script = document.createElement('script');
    script.textContent = `
      // This is a demonstration of what would happen if CORS could be bypassed
      // In a real attack scenario, this would be done through server-side proxies or vulnerable CORS configurations
      console.log("[SECURITY DEMO] Attempting to demonstrate how CORS bypass would work in a real environment");
    `;
    document.head.appendChild(script);
    
    // Add explanation to console
    console.log("%c⚠️ SECURITY DEMONSTRATION", "color: red; font-size: 20px; font-weight: bold;");
    console.log("%cThis app contains intentional security vulnerabilities for educational purposes.", "color: orange; font-size: 14px;");
    console.log("%cIn a real-world scenario, attackers would bypass CORS using:", "color: black; font-size: 14px;");
    console.log("1. Server-side proxies");
    console.log("2. Misconfigured CORS headers (Access-Control-Allow-Origin: *)");
    console.log("3. JSONP endpoints");
    console.log("4. DNS rebinding attacks");
    console.log("5. Server-side request forgery (SSRF)");
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleUpload = async (file: File, uploadUrl: string) => {
    const response = await uploadDocument(file, uploadUrl);
    
    // Show appropriate toast based on the response
    if (uploadUrl.startsWith('cmd:')) {
      toast({
        title: "Command Execution",
        description: "OS command executed via injection vulnerability",
        variant: "destructive",
      });
    } else if (uploadUrl.startsWith('/proc/')) {
      toast({
        title: "Container Breakout",
        description: "Attempted to access container sensitive information",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Upload Successful",
        description: `File ${file.name} uploaded to ${uploadUrl}`,
      });
    }
    
    return response;
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
        <p className="text-gray-600">Upload and manage your documents securely through API Gateway</p>
      </div>

      {/* Security warning banner for demonstration purposes */}
      <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded-md">
        <h2 className="text-red-800 font-bold flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span> 
          Security Vulnerability Demonstration
        </h2>
        <p className="text-sm text-red-700 mt-1">
          This page contains real security vulnerabilities for educational purposes:
        </p>
        <ul className="list-disc pl-5 text-xs text-red-700 mt-1">
          <li>OS Command Injection (via upload destination with "cmd:" prefix)</li>
          <li>Container Breakout (via paths like "/proc/self/environ")</li>
          <li>Web Shell Upload (via uploading PHP files to web directories)</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DocumentUploadForm onUpload={handleUpload} />
        </div>

        <div>
          <RecentDocumentsList documents={recentDocuments} />
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default DocumentUpload;
