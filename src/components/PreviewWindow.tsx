
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink } from "lucide-react";

interface PreviewWindowProps {
  content: string;
  contentType: string;
  title: string;
  isSSRF?: boolean;
}

const PreviewWindow: React.FC<PreviewWindowProps> = ({ content, contentType, title, isSSRF }) => {
  return (
    <Card className="mt-4 border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {isSSRF ? <ExternalLink className="h-5 w-5 text-amber-500" /> : <FileText className="h-5 w-5 text-purple-600" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <div className={`p-4 ${isSSRF ? 'bg-black text-green-400 font-mono text-sm' : ''}`}>
            <pre className="whitespace-pre-wrap break-words">
              {content}
            </pre>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PreviewWindow;
