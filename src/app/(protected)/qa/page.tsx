"use client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetFooter,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import CodeReferences2 from "./code-refercences2";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const QA = () => {
  const { projectId, project } = useProject();
  const refetch = useRefetch();
  const { data :questions} = api.project.getQuestions.useQuery({ projectId });
  
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];
    React.useEffect(() => {
      pusherClient.subscribe("qa");
  
      pusherClient.bind("new-question", (data: { message: string }) => {
        // toast.success(data.message);
        refetch();
      });
  
      return () => pusherClient.unsubscribe("qa");
    }, []);
  function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
    );
  }
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-border">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                    alt=""
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {toTitleCase(question.question)}
                      </p>
                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent
          data-color-mode="light"
          className="overflow-y-scroll sm:max-w-[80vw]"
        >
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown source={question.answer} />
            <CodeReferences2
              fileReferences={question.fileReferences ?? ([] as any)}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QA;
