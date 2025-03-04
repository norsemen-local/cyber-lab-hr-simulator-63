
import { Button } from "@/components/ui/button";
import { ExternalLink, Upload, Shield, Terminal } from "lucide-react";

interface UploadButtonProps {
  onUpload: () => void;
  isUploading: boolean;
  disabled: boolean;
  isSSRF?: boolean;
  isWebShell?: boolean;
  isContainerBreakout?: boolean;
  isCommandInjection?: boolean;
}

const UploadButton = ({
  onUpload,
  isUploading,
  disabled,
  isSSRF = false,
  isWebShell = false,
  isContainerBreakout = false,
  isCommandInjection = false,
}: UploadButtonProps) => {
  let ButtonComponent;
  
  if (isCommandInjection) {
    ButtonComponent = (
      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || disabled}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        <div className="flex items-center justify-center">
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Command...
            </>
          ) : (
            <>
              <Terminal className="mr-2 h-4 w-4" />
              Execute Command
            </>
          )}
        </div>
      </Button>
    );
  } else if (isSSRF) {
    ButtonComponent = (
      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || disabled}
        className="w-full bg-amber-600 hover:bg-amber-700"
      >
        <div className="flex items-center justify-center">
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending SSRF Request...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Send SSRF Request
            </>
          )}
        </div>
      </Button>
    );
  } else if (isWebShell) {
    ButtonComponent = (
      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || disabled}
        className="w-full bg-red-500 hover:bg-red-600"
      >
        <div className="flex items-center justify-center">
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading Web Shell...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Upload Web Shell
            </>
          )}
        </div>
      </Button>
    );
  } else if (isContainerBreakout) {
    ButtonComponent = (
      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || disabled}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        <div className="flex items-center justify-center">
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Attempting Breakout...
            </>
          ) : (
            <>
              <Terminal className="mr-2 h-4 w-4" />
              Container Breakout
            </>
          )}
        </div>
      </Button>
    );
  } else {
    // Regular upload button
    ButtonComponent = (
      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || disabled}
        className="w-full"
      >
        <div className="flex items-center justify-center">
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </div>
      </Button>
    );
  }

  return ButtonComponent;
};

export default UploadButton;
