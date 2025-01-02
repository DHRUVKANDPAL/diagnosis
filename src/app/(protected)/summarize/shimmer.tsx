import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const Shimmer = () => {
  return (
    <div className='relative flex gap-x-4'>
      <div
        className={cn("h-12", "absolute left-0 top-0 flex w-6 justify-center")}
      >
        <div className="w-px translate-x-1 bg-gray-200"></div>
      </div>

      <>
        <div className="shimmer">
          <img
            src={`https://avatar.iran.liara.run/username?username=Dhruv`}
            alt="commit avatar"
            className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
          />
        </div>

        <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
          <div className="flex justify-between gap-x-4">
            <Link
              target="_blank"
              href={`Commit Url`}
              className="py-0.5 text-sm leading-5 text-gray-500"
            >
              <span className="font-medium text-gray-900">
                {"Commit Repo Title"}
              </span>{" "}
              <span className="inline-flex items-center">
                Commited
                <ExternalLink className="ml-1 size-4" />
              </span>
            </Link>
          </div>
          <pre className="shimmer text-md mt-2 whitespace-pre-wrap leading-6 text-gray-500">
            <span className="typing-effect">
              Generating summary...
            </span>
          </pre>
        </div>
      </>
    </div>
  );
}

export default Shimmer