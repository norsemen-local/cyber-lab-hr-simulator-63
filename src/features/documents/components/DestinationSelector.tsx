
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Destination
      </label>
      <Select onValueChange={onLocationChange} defaultValue={uploadUrl}>
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
          onChange={onCustomUrlChange}
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
    </div>
  );
};

export default DestinationSelector;
