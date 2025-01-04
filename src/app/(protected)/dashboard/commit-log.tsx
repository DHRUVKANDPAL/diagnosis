"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, Loader2, SearchCodeIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data } = api.project.getCommits.useQuery({
    projectId,
    page,
    pageSize: 10,
  });

  const { commits, totalPages } = data || {};
  

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredCommits = commits?.filter((commit) => {
    if (!activeSearch) return true;

    const extractSearchableText = (text: string) => {
      const regex = /(\*\*.*?\*\*|`.*?`|".*?"|\(.*?\)|\{.*?\}|\[.*?\])/g;
      return (text.match(regex) || []).map((match) =>
        match.replace(/^\W+|\W+$/g, ""),
      );
    };

    const matchesAuthorName = commit.commitAuthorName
      .toLowerCase()
      .includes(activeSearch.toLowerCase());
    const matchesCommitMessage = commit.commitMessage
      .toLowerCase()
      .includes(activeSearch.toLowerCase());

    const searchableSummaryParts = extractSearchableText(commit.summary);
    const matchesSummary = searchableSummaryParts.some((part) =>
      part.toLowerCase().includes(activeSearch.toLowerCase()),
    );

    return matchesAuthorName || matchesCommitMessage || matchesSummary;
  });

  if (totalPages === null || totalPages === undefined)
    return (
      <pre className="shimmer mt-2 whitespace-pre-wrap text-xl leading-6 text-gray-500">
        <span className="typing-effect">Loading commits...</span>
      </pre>
    );
  if(totalPages === 0) return (
    <Card className="flex h-[40vh] flex-col items-center justify-center text-gray-500">
      <p className="shimmer">No commits found.</p>
      <p className="shimmer">Select/Add a project to get started.</p>
    </Card>
  );

  return (
    <div >
      <div className="sticky top-0 z-10 flex w-full items-center justify-center bg-transparent py-4">
        <div className="flex w-full max-w-xl items-center justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commits..."
            className="w-full rounded border border-violet-300 bg-violet-100 px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button variant="default" className="ml-4" onClick={handleSearch}>
            <SearchCodeIcon></SearchCodeIcon>Search{" "}
          </Button>
        </div>
      </div>
      <ul className="space-y-6 ">
        {filteredCommits?.map((commit, index) => {
          const processText = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
            return parts.map((part, index) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <b key={index} className="text-gray-700">
                    {part.slice(2, -2)}
                  </b>
                );
              } else if (part.startsWith("`") && part.endsWith("`")) {
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="my-0.5 text-sm break-all hover:cursor-pointer hover:bg-gray-200"
                  >
                    {part.slice(1, -1)}
                  </Badge>
                );
              } else {
                return part;
              }
            });
          };

          return (
            <li key={commit.id} className="relative flex gap-x-4 items-stretch">
              <div
                className={cn(
                  index === (commits?.length ?? 0) - 1 ? "h-6" : "-bottom-6",
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
                  <div className="text-md mt-2 whitespace-pre-wrap  leading-6 text-gray-500 font-mono">
                    {processText(commit.summary)}
                  </div>
                </div>
              </>
            </li>
          );
        })}
      </ul>
      <div className="h-10"></div>
      <div className="sticky bottom-0 bg-transparent py-4  ">
        <div className="flex items-center justify-center space-x-4 ">
          {/* Pagination Buttons */}
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
    </div>
  );
};

export default CommitLog;
