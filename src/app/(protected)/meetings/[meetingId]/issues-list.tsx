"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, RouterOutputs } from "@/trpc/react";
import { Loader2, VideoIcon } from "lucide-react";
import React from "react";

type Props = {
  meetingId: string;
};
const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    { refetchInterval: 4000 },
  );
  if (isLoading || !meeting)
    return (
      <div className="space-y-5">
        <div className="flex h-[10vh] animate-pulse items-center rounded-md bg-gray-400 pl-4">
          {/* Added width and height to make the rounded-full visible */}
          <div className="relative h-[6vh] w-[6vh] rounded-full bg-gray-300"></div>
        </div>
        <div className="grid h-[90vh] w-full animate-pulse grid-cols-1 gap-5 rounded-lg sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden sm:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4  ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden sm:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden md:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden md:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden md:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden md:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
          <div className="hidden md:flex flex-col gap-y-2 rounded-lg bg-gray-400 p-4 ">
            <div className="h-1/4 rounded-xl bg-gray-300"></div>
            <div className="h-1/2 w-full rounded-lg bg-gray-300"></div>
            <div className="h-1/4 w-24 rounded-xl bg-gray-300"></div>
          </div>
        </div>
      </div>
    );
  return (
    <>
      <div className="p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full bg-white p-3">
              <VideoIcon className="h-6 w-6" />
            </div>
            <h1>
              <div className="text-sm leading-6 text-gray-600">
                Meeting on {meeting.createdAt.toLocaleDateString()}
              </div>
              <div className="text-gary-600 mt-1 text-base font-semibold leading-6">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {meeting.issue.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
  );
};
function IssueCard({
  issue,
}: {
  issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issue"][0];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              {issue.createdAt.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-600">{issue.headline}</p>
          <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4">
            <span className="text-sm text-gray-600">
              {issue.start}-{issue.end}
            </span>
            <p className="font-medium italic leading-relaxed text-gray-900">
              {issue.summary}
            </p>
          </blockquote>
        </DialogContent>
      </Dialog>
      <Card className="realtive">
        <CardHeader className="text-xl">
          <CardTitle>{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription className="lg:line-clamp-3">
            {issue.headline}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}
export default IssuesList;
