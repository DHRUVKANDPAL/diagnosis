"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CreateLogs from "./create-logs";
import { Card } from "@/components/ui/card";
import { start } from "repl";
import { Info, Loader2 } from "lucide-react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  const [isPending, startTransition] = useTransition();
  function onSubmit(data: FormInput) {
    // window.alert(JSON.stringify(data));
    startTransition(() => {
      if (!!checkCredits.data) {
        createProject.mutate(
          {
            name: data.projectName,
            githubUrl: data.repoUrl,
            githubToken: data.githubToken,
          },
          {
            onSuccess: () => {
              toast.success("Project created successfully");
              refetch();
              reset();
            },
            onError: () => {
              toast.error("Failed to create project");
            },
          },
        );
      } else {
        checkCredits.mutate({
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        });
      }
    });
  }

  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits?.data?.fileCount <= checkCredits?.data?.userCredits
    : true;

  return (
    <div>
      <Card className="flex h-full w-full flex-col items-center justify-center gap-12 md:h-[480px] md:flex-row lg:h-96">
        <img
          src="/undraw_github.svg"
          className="h-60 w-auto pl-2 sm:pb-0 md:h-48 lg:h-56"
        ></img>
        <div className="pl-2 pr-4 pt-6 md:pl-0 md:pt-0">
          <div>
            <h1 className="text-2xl font-semibold">Link a Github repository</h1>
            <p className="text-sm text-muted-foreground">
              Enter the URL of your repository to link it to Diagnosis.
            </p>
          </div>
          <div className="h-4"></div>
          <div className="pb-10 md:pb-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Input
                placeholder="Project Name"
                {...register("projectName", { required: true })}
              />
              <Input
                placeholder="Github Repository URL"
                {...register("repoUrl", { required: true })}
                type="url"
                required
              />
              <Input
                placeholder="GitHub Token (Optional) "
                {...register("githubToken")}
              />
              {!!checkCredits.data && (
                <>
                  <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <p className="text-sm">
                        {" "}
                        You will be charged with{" "}
                        <strong>{checkCredits.data.fileCount}</strong> credits
                        for this repository.
                      </p>
                    </div>
                    <p className="text-sm text-blue-600">
                      You have <strong>{checkCredits.data.userCredits}</strong>{" "}
                      credits remaining.
                    </p>
                  </div>
                </>
              )}
              <div className="h-2"></div>
              <Button
                type="submit"
                disabled={createProject.isPending || !!checkCredits.isPending || !hasEnoughCredits}
              >
                {!!checkCredits.data ? "Create Project" : "Check Credits"}{" "}
                {isPending ||
                  (createProject.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ))}
              </Button>
            </form>
          </div>
        </div>
      </Card>
      <CreateLogs />
    </div>
  );
};

export default CreatePage;
