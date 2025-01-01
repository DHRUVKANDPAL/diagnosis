"use client";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const [page, setPage] = useState(1);
  const { data } = api.project.getCommits.useQuery({
    projectId,
    page,
    pageSize: 10,
  });

  const { commits, totalPages } = data || {};
  if (totalPages === null || totalPages === undefined)
    return (
      <pre className="shimmer text-xl mt-2 whitespace-pre-wrap leading-6 text-gray-500">
        <span className="typing-effect">
          Loading commits...
        </span>
      </pre>
    );
  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, index) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  index === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
                />
                <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                      className="py-0.5 text-sm leading-5 text-gray-500"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex items-center">
                        Commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="text-xl font-semibold">
                    {commit.commitMessage}
                  </span>
                  <pre className="text-md mt-2 whitespace-pre-wrap leading-6 text-gray-500">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
      <div className="h-10 w-full"></div>
      <div className="sticky bottom-0 bg-transparent py-4 shadow-md">
        <div className="flex items-center justify-center space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="rounded bg-violet-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-violet-300"
          >
            {"<<"}
          </button>

          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded bg-violet-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-violet-300"
          >
            {"<"}
          </button>

          {(() => {
            const visiblePages = [];
            let startPage = Math.max(1, page - 1);
            let endPage = Math.min(totalPages!, page + 1);

            if (page === 1) {
              startPage = 1;
              endPage = Math.min(3, totalPages!);
            }

            if (page === totalPages) {
              startPage = Math.max(totalPages! - 2, 1);
              endPage = totalPages!;
            }

            for (let i = startPage; i <= endPage; i++) {
              visiblePages.push(i);
            }

            return visiblePages.map((visiblePage) => (
              <button
                key={visiblePage}
                onClick={() => setPage(visiblePage)}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  page === visiblePage
                    ? "rounded-full bg-primary text-white"
                    : "rounded bg-violet-200 text-gray-700 hover:bg-violet-300",
                )}
              >
                {visiblePage}
              </button>
            ));
          })()}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded bg-violet-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-violet-300"
          >
            {">"}
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(totalPages!)}
            className="rounded bg-violet-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-violet-300"
          >
            {">>"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CommitLog;
