"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import {
  CircularProgressbar,
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { uploadFile } from "@/lib/uploadFiles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Presentation } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

const MeetingCard: React.FC = () => {
  const { project } = useProject();
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const uploadMeeting = api.project.uploadMeetings.useMutation();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      projectId: string;
      meetingId: string;
    }) => {
      const { meetingUrl, projectId, meetingId } = data;
      const response =await axios.post("/api/process-meetings", { meetingUrl, projectId, meetingId });
      return response.data
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "audio/*": [".mp3", ".wav", ".m4a"] },
    multiple: false,
    maxSize: 20_000_000,
    onDrop: async (acceptedFiles) => {
      if (!project) return;
      if(!project.id) return;
      setIsUploading(true);
      try {
        const file = acceptedFiles[0];
        if (!file) return;
        const downloadURL = await uploadFile(file as File, setProgress);
        uploadMeeting.mutate(
          {
            projectId: project.id!,
            meetingUrl: downloadURL,
            name: file.name!,
          },
          {
            onSuccess: (meeting) => {
              toast.success("Meeting uploaded successfully.");
              router.push(`/meetings`);
              processMeeting.mutateAsync({
                meetingUrl: downloadURL,
                projectId: project.id!,
                meetingId: meeting.id,
              })
            },
            onError: (error) => {
              toast.error("Failed to upload meeting. Please try again.");
            },
          },
        );
        console.log("Cloudinary URL:", downloadURL);
      } catch (error) {
        window.alert("Failed to upload file. Please try again.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card
      className={cn(
        "col-span-5 flex min-h-[300px] cursor-pointer flex-col items-center justify-center p-10 lg:col-span-2 lg:min-h-[100px]",
        !project && "pointer-events-none ",
      )}
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with Diagnosis.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button disabled={isUploading || !project}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" />
              Upload Meeting
              <input {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex flex-col items-center justify-center">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              textColor: "#000",
              pathColor: "#6d28d9",
            })}
          />
          <p className="pt-2 text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
