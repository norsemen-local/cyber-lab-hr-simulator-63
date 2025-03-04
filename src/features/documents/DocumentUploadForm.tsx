
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentUploadFormProps {
  onUpload: (file: File, destination: string) => Promise<string | null>;
}

const DocumentUploadForm = ({ onUpload }: DocumentUploadFormProps) => {
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

    try {
      const response = await onUpload(selectedFile, uploadUrl);
      setResponseData(response);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload via API Gateway",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
  );
};

export default DocumentUploadForm;
