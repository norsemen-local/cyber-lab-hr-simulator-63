
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState("s3://employee-bucket/documents/");
  const [isUploading, setIsUploading] = useState(false);
  const [responseData, setResponseData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // This function is intentionally vulnerable to SSRF
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setResponseData(null);

    // Create FormData object for the file upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('destination', uploadUrl);

    try {
      // Vulnerable URL construction - allows changing the upload destination
      // This is intentionally vulnerable to SSRF
      console.log(`Uploading to: ${uploadUrl}/${selectedFile.name}`);

      // Simulated backend endpoint that would perform the SSRF
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // For simulation purposes, we'll fetch directly from the URL if it's HTTP/HTTPS
      // In a real application, this would be done server-side and constitute the SSRF vulnerability
      if (uploadUrl.startsWith('http')) {
        try {
          const directResponse = await fetch(uploadUrl, { mode: 'cors' });
          const text = await directResponse.text();
          setResponseData(text);
        } catch (error) {
          // For CORS issues, simulate what would happen server-side
          // This simulates how a backend with SSRF would return the content
          setResponseData(`Simulated SSRF Response (Browser CORS prevented actual request):\n\nMetadata for ${uploadUrl}:\n{\n  "instance-id": "i-0123456789abcdef0",\n  "instance-type": "t3.micro",\n  "local-hostname": "ip-10-0-0-123.ec2.internal",\n  "local-ipv4": "10.0.0.123",\n  "public-hostname": "ec2-12-34-56-78.compute-1.amazonaws.com",\n  "public-ipv4": "12.34.56.78",\n  "security-groups": "hr-portal-ec2-sg",\n  "iam": {\n    "security-credentials": {\n      "hr-portal-ec2-role": {\n        "AccessKeyId": "ASIA...",\n        "SecretAccessKey": "SECRET...",\n        "Token": "TOKEN...",\n        "Expiration": "2023-12-31T23:59:59Z"\n      }\n    }\n  }\n}`);
        }
      } else {
        // For non-HTTP URLs like s3://, just show a simulated success
        toast({
          title: "Upload Successful",
          description: `File ${selectedFile.name} uploaded to ${uploadUrl}`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const recentDocuments = [
    { id: 1, name: "Performance_Review_Q3.pdf", date: "2023-10-15", size: "1.2 MB" },
    { id: 2, name: "Confidential_HR_Policy.docx", date: "2023-09-28", size: "845 KB" },
    { id: 3, name: "Employee_Handbook_2023.pdf", date: "2023-08-12", size: "3.5 MB" },
    { id: 4, name: "Salary_Structure_2023.xlsx", date: "2023-07-30", size: "1.8 MB" }
  ];

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
        <p className="text-gray-600">Upload and manage your documents securely</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Upload New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Select File
                  </Button>
                  {selectedFile && (
                    <p className="mt-2 text-sm">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Destination URL
                  </label>
                  <Input
                    className="mb-4"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="s3://bucket-name/path/"
                  />
                  <div className="text-xs text-gray-500 mb-4">
                    <p>This field determines where your document will be stored.</p>
                    <p className="opacity-60">Format: s3://bucket-name/path/ or http://metadata-url/</p>
                    <p className="text-amber-600 mt-1">
                      Try: http://169.254.169.254/latest/meta-data/ for EC2 metadata
                    </p>
                  </div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>

                {responseData && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Response:</h3>
                    <Card className="bg-black text-green-400 font-mono text-xs">
                      <ScrollArea className="h-48 w-full rounded-md">
                        <pre className="p-4 whitespace-pre-wrap">
                          {responseData}
                        </pre>
                      </ScrollArea>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default DocumentUpload;
