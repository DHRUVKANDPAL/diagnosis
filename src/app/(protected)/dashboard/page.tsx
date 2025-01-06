"use client";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import DeleteProject from "./delete-project";
import InviteButton from "./invite-button";
import TeamMembers from "./team-member";

const DashboardPage = () => {
  const { project } = useProject();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Github Link */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This Project is Linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center break-all text-white/80 hover:underline"
                  target="_blank"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="hidden items-center gap-4 sm:flex">
          <TeamMembers />
          <InviteButton />
          <DeleteProject />
        </div>
        <div className="flex flex-col w-full items-center justify-center gap-4 sm:hidden">
          <TeamMembers />
          <div className="grid grid-cols-2 gap-4 w-full">
            <InviteButton />
            <DeleteProject />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-5 gap-4">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8"></div>
      <CommitLog />
    </div>
  );
};

export default DashboardPage;
