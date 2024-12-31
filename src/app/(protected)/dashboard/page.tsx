"use client";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";

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
                  className="inline-flex items-center text-white/80 hover:underline"
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
        <div className="flex items-center gap-4">
          <Button>Team Members</Button>
          <Button>Invite Button</Button>
          <Button>Archive Button</Button>
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          Ask Question Card
          Meeting Card 
        </div>
      </div>
      <div className="mt-8"></div>
      Commit Log
    </div>
  );
};

export default DashboardPage;
