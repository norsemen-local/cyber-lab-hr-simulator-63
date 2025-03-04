
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Globe, FileCode } from "lucide-react";

interface DestinationSelectorProps {
  uploadUrl: string;
  customUrl: string;
  showCustomUrl: boolean;
  predefinedLocations: { value: string; label: string }[];
  onLocationChange: (value: string) => void;
  onCustomUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DestinationSelector = ({
  uploadUrl,
  customUrl,
  showCustomUrl,
  predefinedLocations,
  onLocationChange,
  onCustomUrlChange,
}: DestinationSelectorProps) => {
  const isSSRFUrl = uploadUrl.startsWith('http');
  const isWebServerPath = uploadUrl.startsWith('/var/www/html/') || 
                         (uploadUrl.startsWith('/') && uploadUrl.includes('www')) ||
                         uploadUrl.includes('public_html');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Destination
      </label>
      <Select onValueChange={onLocationChange} defaultValue={uploadUrl}>
        <SelectTrigger className={`w-full mb-2 ${
          isSSRFUrl ? "border-amber-500" : 
          isWebServerPath ? "border-red-500" : ""
        }`}>
          <SelectValue placeholder="Select destination" />
        </SelectTrigger>
        <SelectContent>
          {predefinedLocations.map((location) => (
            <SelectItem 
              key={location.value} 
              value={location.value}
              className={
                location.value.includes("169.254.169.254") ? "text-amber-600 font-medium" : 
                location.value.includes("/var/www/html") ? "text-red-600 font-medium" : 
                ""
              }
            >
              {location.value.includes("169.254.169.254") ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {location.label}
                </div>
              ) : location.value.includes("/var/www/html") ? (
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-red-500" />
                  {location.label}
                </div>
              ) : location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showCustomUrl && (
        <div className="relative">
          <Input
            className={`mt-2 mb-4 ${
              customUrl.startsWith('http') ? "pl-8 border-amber-500" : 
              (customUrl.startsWith('/var/www/html') || customUrl.includes('public_html')) ? "pl-8 border-red-500" : 
              ""
            }`}
            value={customUrl}
            onChange={onCustomUrlChange}
            placeholder="Enter custom destination (e.g., s3://bucket-name/path/ or http://...)"
          />
          {customUrl.startsWith('http') && (
            <Globe className="h-4 w-4 text-amber-500 absolute top-5 left-2" />
          )}
          {(customUrl.startsWith('/var/www/html') || customUrl.includes('public_html')) && (
            <FileCode className="h-4 w-4 text-red-500 absolute top-5 left-2" />
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mb-4">
        <p>This field determines where your document will be stored.</p>
        {showCustomUrl && (
          <p className="opacity-60">Format: s3://bucket-name/path/, http://metadata-url/, or /var/www/html/</p>
        )}
        {isSSRFUrl && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
            <div className="flex items-center gap-1 mb-1 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>SSRF Testing Mode Enabled</span>
            </div>
            <p className="text-xs">
              Try these URLs for EC2 metadata access:<br />
              • http://169.254.169.254/latest/meta-data/<br />
              • http://169.254.169.254/latest/meta-data/iam/security-credentials/
            </p>
          </div>
        )}
        {isWebServerPath && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
            <div className="flex items-center gap-1 mb-1 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Web Server Access Mode Enabled</span>
            </div>
            <p className="text-xs">
              Warning: Uploading PHP files to the web server may allow for remote code execution.<br />
              Try uploading a file with the .php extension to create a web shell.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSelector;
