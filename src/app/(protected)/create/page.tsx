"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch=useRefetch();
  function onSubmit(data: FormInput) {
    window.alert(JSON.stringify(data));
    createProject.mutate({
      name: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
    },{
      onSuccess: () => {
        toast.success("Project created successfully")
        refetch();
        reset();
      },
      onError: () => {
        toast.error("Failed to create project")
      }
    });
    return true;
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/undraw_github.svg" className="h-56 w-auto"></img>
      <div>
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
            <Button type="submit" disabled={createProject.isPending}>Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;