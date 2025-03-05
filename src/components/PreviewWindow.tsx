
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink, Image as ImageIcon, Code } from "lucide-react";

interface PreviewWindowProps {
  content: string;
  contentType: string;
  title: string;
  isSSRF?: boolean;
}

const PreviewWindow: React.FC<PreviewWindowProps> = ({ content, contentType, title, isSSRF }) => {
  const renderContent = () => {
    // For SSRF responses, show as plain text
    if (isSSRF) {
      return (
        <div className="bg-black text-green-400 font-mono text-sm p-4">
          <pre className="whitespace-pre-wrap break-words">{content}</pre>
        </div>
      );
    }

    // Handle HTML content (like PHP web shell outputs)
    if (contentType.includes('html')) {
      return (
        <div className="w-full h-[400px]">
          <iframe 
            srcDoc={content}
            className="w-full h-full border-0"
            title="HTML Content"
            sandbox="allow-same-origin"
          />
        </div>
      );
    }

    // Handle PDFs
    if (contentType.includes('pdf')) {
      // Create a blob URL for the PDF content
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      return (
        <div className="h-full w-full">
          <iframe 
            src={url} 
            className="w-full h-[400px]" 
            title="PDF Preview"
          />
        </div>
      );
    }

    // Handle Images (JPEG, PNG, GIF, etc.)
    if (contentType.includes('image')) {
      // For images, we need to handle base64 data
      // Determine if content is already base64 or if we need to convert it
      let imgSrc = '';
      
      if (content.startsWith('data:')) {
        // Already a data URL
        imgSrc = content;
      } else {
        // Create a blob URL for the image content
        const blob = new Blob([content], { type: contentType });
        imgSrc = URL.createObjectURL(blob);
      }
      
      return (
        <div className="flex justify-center">
          <img 
            src={imgSrc} 
            alt="Image Preview" 
            className="max-h-[400px] object-contain" 
          />
        </div>
      );
    }

    // Default: show as text
    return (
      <pre className="whitespace-pre-wrap break-words p-4">{content}</pre>
    );
  };

  const getIcon = () => {
    if (isSSRF) return <ExternalLink className="h-5 w-5 text-amber-500" />;
    if (contentType.includes('html')) return <Code className="h-5 w-5 text-red-600" />;
    if (contentType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (contentType.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-600" />;
    return <FileText className="h-5 w-5 text-purple-600" />;
  };

  return (
    <Card className="mt-4 border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          {renderContent()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PreviewWindow;
