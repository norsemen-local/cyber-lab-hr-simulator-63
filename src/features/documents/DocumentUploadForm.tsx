import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PreviewWindow from "@/components/PreviewWindow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentUploadFormProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string }>;
}

const DocumentUploadForm = ({ onUpload }: DocumentUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState("s3://employee-bucket/documents/");
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{ content: string; contentType: string; title: string; isSSRF: boolean } | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const { toast } = useToast();

  const predefinedLocations = [
    { value: "s3://employee-bucket/documents/", label: "Employee Documents" },
    { value: "s3://employee-bucket/reports/", label: "Employee Reports" },
    { value: "s3://hr-data/policies/", label: "HR Policies" },
    { value: "custom", label: "Custom Location" },
    { value: "http://169.254.169.254/latest/meta-data/", label: "Debug - EC2 Metadata (SSRF)" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLocationChange = (value: string) => {
    if (value === "custom") {
      setShowCustomUrl(true);
      // Don't change the actual uploadUrl yet, wait for custom input
    } else {
      setShowCustomUrl(false);
      setUploadUrl(value);
    }
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    setUploadUrl(e.target.value); // Update actual uploadUrl as user types
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    // Use either the selected dropdown value or custom URL
    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    
    setIsUploading(true);
    setPreviewData(null);

    try {
      const response = await onUpload(selectedFile, destinationUrl);
      
      // Set preview data based on whether it's an SSRF request or regular upload
      setPreviewData({
        content: response.content,
        contentType: response.contentType,
        title: destinationUrl.startsWith('http') ? 'SSRF Response' : `Preview: ${selectedFile.name}`,
        isSSRF: destinationUrl.startsWith('http')
      });

      // Show appropriate toast
      if (destinationUrl.includes("169.254.169.254")) {
        toast({
          title: "SSRF Successful",
          description: "Successfully accessed EC2 metadata",
        });
      } else if (destinationUrl.startsWith('http')) {
        toast({
          title: "SSRF Request Complete",
          description: "Successfully fetched external content",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `File ${selectedFile.name} uploaded`,
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

  return (
    <div className="space-y-4">
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
                Upload Destination
              </label>
              <Select onValueChange={handleLocationChange} defaultValue={uploadUrl}>
                <SelectTrigger className="w-full mb-2">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedLocations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {showCustomUrl && (
                <Input
                  className="mt-2 mb-4"
                  value={customUrl}
                  onChange={handleCustomUrlChange}
                  placeholder="Enter custom destination (e.g., s3://bucket-name/path/ or http://...)"
                />
              )}
              
              <div className="text-xs text-gray-500 mb-4">
                <p>This field determines where your document will be stored.</p>
                {showCustomUrl && (
                  <p className="opacity-60">Format: s3://bucket-name/path/ or http://metadata-url/</p>
                )}
                {(showCustomUrl || uploadUrl.includes("169.254.169.254")) && (
                  <p className="text-amber-600 mt-1">
                    Try: http://169.254.169.254/latest/meta-data/ for EC2 metadata
                  </p>
                )}
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <PreviewWindow
          content={previewData.content}
          contentType={previewData.contentType}
          title={previewData.title}
          isSSRF={previewData.isSSRF}
        />
      )}
    </div>
  );
};

export default DocumentUploadForm;
