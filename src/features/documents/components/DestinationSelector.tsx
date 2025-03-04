
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Globe, FileCode, Terminal } from "lucide-react";

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
  const isSSRFUrl = uploadUrl.startsWith('http') || uploadUrl.startsWith('file:///');
  const isWebServerPath = uploadUrl.startsWith('/var/www/html/') || 
                         (uploadUrl.startsWith('/') && uploadUrl.includes('www')) ||
                         uploadUrl.includes('public_html');
  const isContainerBreakout = uploadUrl.startsWith('/proc/') || 
                              uploadUrl.includes('cgroup') || 
                              uploadUrl.includes('environ');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Destination
      </label>
      <Select onValueChange={onLocationChange} defaultValue={uploadUrl}>
        <SelectTrigger className={`w-full mb-2 ${
          isSSRFUrl ? "border-amber-500" : 
          isContainerBreakout ? "border-red-700" :
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
                location.value.startsWith("/proc/") ? "text-red-700 font-medium" : 
                location.value.includes("/var/www/html") ? "text-red-600 font-medium" : 
                ""
              }
            >
              {location.value.includes("169.254.169.254") || location.value.startsWith("http://") || location.value.startsWith("file:///") ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {location.label}
                </div>
              ) : location.value.includes("/var/www/html") ? (
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-red-500" />
                  {location.label}
                </div>
              ) : location.value.startsWith("/proc/") ? (
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-red-700" />
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
              customUrl.startsWith('http') || customUrl.startsWith('file:///') ? "pl-8 border-amber-500" : 
              customUrl.startsWith('/proc/') ? "pl-8 border-red-700" :
              (customUrl.startsWith('/var/www/html') || customUrl.includes('public_html')) ? "pl-8 border-red-500" : 
              ""
            }`}
            value={customUrl}
            onChange={onCustomUrlChange}
            placeholder="Enter custom destination (e.g., s3://bucket/path/, http://..., /var/www/html/, /proc/...)"
          />
          {(customUrl.startsWith('http') || customUrl.startsWith('file:///')) && (
            <Globe className="h-4 w-4 text-amber-500 absolute top-5 left-2" />
          )}
          {customUrl.startsWith('/proc/') && (
            <Terminal className="h-4 w-4 text-red-700 absolute top-5 left-2" />
          )}
          {(customUrl.startsWith('/var/www/html') || customUrl.includes('public_html')) && (
            <FileCode className="h-4 w-4 text-red-500 absolute top-5 left-2" />
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mb-4">
        <p>This field determines where your document will be stored.</p>
        {showCustomUrl && (
          <p className="opacity-60">Format: s3://bucket/path/, http://metadata-url/, /var/www/html/, /proc/...</p>
        )}
        {isSSRFUrl && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
            <div className="flex items-center gap-1 mb-1 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>SSRF Attack Mode Enabled</span>
            </div>
            <p className="text-xs">
              Try these URLs for real SSRF attacks:<br />
              • http://169.254.169.254/latest/meta-data/<br />
              • http://localhost:8080<br />
              • http://internal-jenkins:8080<br />
              • file:///etc/passwd
            </p>
          </div>
        )}
        {isWebServerPath && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
            <div className="flex items-center gap-1 mb-1 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Web Shell Upload Mode Enabled</span>
            </div>
            <p className="text-xs">
              Warning: Uploading PHP files to the web server paths will create a web shell.<br />
              Example PHP web shell code:<br />
              <code>
                &lt;?php system($_GET['cmd']); ?&gt;
              </code>
            </p>
          </div>
        )}
        {isContainerBreakout && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-900">
            <div className="flex items-center gap-1 mb-1 font-medium">
              <Terminal className="h-3 w-3" />
              <span>Container Breakout Mode Enabled</span>
            </div>
            <p className="text-xs">
              Attempting to access container sensitive files for breakout:<br />
              • /proc/self/environ - Environment variables<br />
              • /proc/1/cgroup - Container information<br />
              These can reveal AWS credentials and container details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSelector;
