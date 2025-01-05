"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { FolderKanban, Loader, Loader2, NotebookIcon, NotebookPenIcon, Trash2, View } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Meetings = () => {
  const { project } = useProject();
  const isMobile=useIsMobile();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    {
      projectId: project?.id ?? "",
    },
    {
      refetchInterval: 4000,
    },
  );
  const deleteMeeting=api.project.deleteMeetings.useMutation();
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1
        className={cn(
          "flex items-center text-xl font-semibold",
          isLoading && "text-muted-foreground",
        )}
      >
        Meetings{!isLoading && <NotebookPenIcon className="ml-2 h-5 w-5" />}
        {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
      </h1>
      {meetings && meetings.length === 0 && <p>No Meetings found</p>}
      {/* {isLoading && (
        <div className="flex font-mono text-gray-700">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="shimmer">Loading...</span>
        </div>
      )} */}
      <ul className="divide-y divide-gray-200 bg-white">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5 pl-4 hover:bg-primary/10"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    <span className="pr-2">{meeting.name}</span>
                    {meeting.status === "PROCESSING" && (
                      <Badge className="bg-blue-500 text-white">
                        <svg
                          className="-ml-1 mr-1.5 h-3 w-3 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing . . .
                      </Badge>
                    )}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-x-2 text-xs text-gray-500">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.issue.length} issues</p>
              </div>
            </div>
            <div className={cn("flex flex-none items-center gap-x-4")}>
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant={"outline"} className="gap-1">
                  {isMobile ? (
                    <FolderKanban></FolderKanban>
                  ) : (
                    <>
                      <FolderKanban></FolderKanban> View
                      <span className="hidden lg:inline-block">Meeting</span>
                    </>
                  )}
                </Button>
              </Link>
              <Button
                variant={"destructive"}
                className="gap-1"
                disabled={deleteMeeting.isPending}
                onClick={() =>
                  deleteMeeting.mutate({
                    meetingId: meeting.id,
                    meetingUrl: meeting.meetingUrl,
                  })
                }
              >
                {isMobile ? (
                  <Trash2></Trash2>
                ) : (
                  <>
                    <Trash2></Trash2> Delete
                    <span className="hidden lg:inline-block">Meeting</span>
                  </>
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Meetings;
