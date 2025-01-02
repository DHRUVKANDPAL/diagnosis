"use client";
import { Badge } from "@/components/ui/badge";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const SummarizeLog = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = api.project.getSearchCommits.useQuery({
    page,
    pageSize: 10,
  });

  const { searchedCommits, totalPages } = data || {};
  const colors = [
    { background: "FFF3E0", color: "FF9800" },
    { background: "E8F5E9", color: "4CAF50" },
    { background: "E3F2FD", color: "2196F3" },
    { background: "F3E5F5", color: "9C27B0" },
    { background: "FFEBEE", color: "F44336" },
    { background: "FBE9E7", color: "D84315" },
    { background: "FFF8E1", color: "FFC107" },
    { background: "EDE7F6", color: "673AB7" },
    { background: "E0F7FA", color: "00796B" },
    { background: "F1F8E9", color: "558B2F" },
  ];

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
          <Badge variant="secondary" className="text-sm my-0.5 hover:bg-gray-200 hover:cursor-pointer">
            {part.slice(1, -1)} 
          </Badge>
        );
      } else {
        return part;
      }
    });
  };


  return (
    <div className="relative">
      <ul className="space-y-6">
        {isLoading && (
          <pre className="shimmer mt-2 whitespace-pre-wrap text-xl leading-6 text-gray-500">
            <span className="typing-effect">Loading previously summarized commits...</span>
          </pre>
        )}
        {searchedCommits?.map((commit, index) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                index === searchedCommits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200"></div>
            </div>
            <>
              <img
                src={
                  `https://avatar.iran.liara.run/username?username=` +
                  commit.commitUrl.split("/").slice(-3, -2).join("/") +
                  `&background=${colors[index % 10]?.background.toLocaleLowerCase()}&color=${colors[index % 10]?.color.toLocaleLowerCase()}`
                }
                alt="commit avatar"
                className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
              />
              <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    href={`${commit?.commitUrl}`}
                    className="py-0.5 text-sm leading-5 text-gray-500"
                  >
                    <span className="font-medium text-gray-900">
                      {commit.commitUrl.split("/").slice(-3, -2).join("/")}
                    </span>{" "}
                    <span className="inline-flex items-center">
                      Commited
                      <ExternalLink className="ml-1 size-4" />
                    </span>
                  </Link>
                </div>
                <pre className="text-md mt-2 whitespace-pre-wrap leading-6 text-gray-500">
                  {processText(commit.summary)}
                </pre>
              </div>
            </>
          </li>
        ))}
      </ul>
      <div className="h-10 "></div>
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
    </div>
  );
};

export default SummarizeLog;
