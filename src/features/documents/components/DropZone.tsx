
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "lucide-react";

interface DropZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
}

const DropZone = ({ onFileChange, selectedFile }: DropZoneProps) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
      <Input
        type="file"
        className="hidden"
        id="file-upload"
        onChange={onFileChange}
      />
      <Button
        className="bg-purple-600 hover:bg-purple-700"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        Select File
      </Button>
      {selectedFile && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-purple-600" />
          <span>Selected: {selectedFile.name}</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;
