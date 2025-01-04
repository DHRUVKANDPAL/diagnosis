"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences2 = ({ fileReferences }: Props) => {
  const [tab, setTab] = React.useState(fileReferences[0]?.fileName);
  if (fileReferences.length === 0) return null;
  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-x-scroll rounded-md bg-gray-200 p-1">
          {fileReferences.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                `whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors`,
                {
                  "bg-primary text-primary-foreground": tab === file.fileName,
                },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {fileReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[50vh] overflow-scroll rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences2;
