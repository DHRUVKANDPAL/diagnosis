import React, { useEffect, useState } from "react";
import { pusherClient } from "../../../lib/pusher";
import { ChevronRightCircleIcon, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CreateLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    pusherClient.subscribe("rooms");

    pusherClient.bind("logs", (data: { message: string }) => {
      setLogs((prevLogs) => [...prevLogs, data.message]);
    });

    return () => pusherClient.unsubscribe("rooms");
  }, []);
  return (
    <div>
      {logs.length > 0 && (
        <Card className="mt-4 rounded-lg border px-4 py-4">
          <CardTitle className="text-lg">Create Project Logs</CardTitle>
          <CardDescription className="text-md flex justify-between gap-2 pb-4">
            Project creation in progress. Please bear with us as this process
            may take a few minutes. Thank you for your patience!
          </CardDescription>
          <div className="flex items-center">
            {logs[logs.length - 1] ===
            "Completed. Project indexed successfully" ? (
              <Badge variant="default">Completed</Badge>
            ) : (
              <Badge variant="destructive">In Progress</Badge>
            )}
          </div>
          <CardContent className="flex max-h-96 flex-col-reverse space-y-2 space-y-reverse overflow-y-auto rounded-md bg-secondary p-4 font-mono text-sm">
            {logs.map((msg, index) => (
              <div
                key={index}
                className="flex w-full items-center rounded-md px-2 text-lg hover:bg-gray-200"
              >
                {index === logs.length - 1 &&
                logs[logs.length - 1] !==
                  "Completed. Project indexed successfully" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                ) : (
                  <ChevronRightCircleIcon className="text-success mr-2 h-4 w-4" />
                )}
                <span
                  className={cn(
                    "text-card-foreground",
                    index === logs.length - 1 &&
                      logs[logs.length - 1] !==
                        "Completed. Project indexed successfully"
                      ? "shimmer text-muted-foreground"
                      : "",
                  )}
                >
                  {msg}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {logs.length === 0 && (
        <Card className="mt-4 flex h-96 flex-col items-center justify-center rounded-lg border px-4 pt-4">
          <img src="/undraw_blank-canvas.svg" className="h-56"></img>
          <p className="pt-5 text-center text-sm text-muted-foreground">
            No logs yet.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CreateLogs;
