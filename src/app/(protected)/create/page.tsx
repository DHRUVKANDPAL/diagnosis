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
import { Loader2 } from "lucide-react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch=useRefetch();
  const [isPending, startTransition]=useTransition();
  function onSubmit(data: FormInput) {
    // window.alert(JSON.stringify(data));
    startTransition(()=>{
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
    });
  }
  return (
    <div>
      <Card className="w-full md:h-96 lg:h-72 items-center justify-center gap-12 md:flex ">
        <img src="/undraw_github.svg" className="md:h-48 lg:h-56 w-auto pl-2"></img>
        <div className="pr-4">
          <div>
            <h1 className="text-2xl font-semibold">Link a Github repository</h1>
            <p className="text-sm text-muted-foreground">
              Enter the URL of your repository to link it to Diagnosis.
            </p>
          </div>
          <div className="h-4"></div>
          <div>
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
              <div className="h-2"></div>
              <Button type="submit" disabled={createProject.isPending}>
                Create Project {isPending || createProject.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin " />}
              </Button>
            </form>
          </div>
        </div>
      </Card>
      <CreateLogs/>
    </div>
  );
};

export default CreatePage;
