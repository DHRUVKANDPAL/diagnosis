'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React, {  useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SummarizeLog from "./summarize-log";
import { Loader2 } from "lucide-react";
import Shimmer from "./shimmer";

type FormInput = {
  commitUrl: string;
};

const SummarizePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const summarizeCommit = api.project.SearchCommits.useMutation();
  const refetch = useRefetch();
  const [isPending, startTransition] = useTransition();

  function onSubmit(data: FormInput) {
   //  window.alert(JSON.stringify(data));

    startTransition(() => {
      summarizeCommit.mutate(
        {
          commitUrl: data.commitUrl,
        },
        {
          onSuccess: () => {
            toast.success("Commit Summarize Request Sent successfully");
            refetch();
            reset();
          },
          onError: () => {
            toast.error("Failed to summarize commit");
          },
        },
      );
    });
  }

  return (
    <div className="h-full space-y-4">
      <div className="md:flex items-center justify-start gap-12 py-4">
        <img
          src="/undraw_artificial-intelligence.svg"
          className=" h-56 w-auto md:block"
        ></img>
        <div>
          <div>
            <h1 className="text-2xl font-semibold">Link a Github Commit </h1>
            <p className="text-sm text-muted-foreground">
              Enter the URL of the required commit to summarize.
            </p>
          </div>
          <div className="h-4"></div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Input
                placeholder="Git Commit URL"
                {...register("commitUrl", { required: true })}
                type="url"
                required
                disabled={isPending || summarizeCommit.isPending}
              />
              <div className="h-2"></div>
              <Button
                type="submit"
                disabled={isPending || summarizeCommit.isPending}
              >
                Summarize{" "}
                {isPending || summarizeCommit.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : null}
              </Button>
            </form>
          </div>
        </div>
      </div>
      {(isPending || summarizeCommit.isPending) && <Shimmer />}
      <SummarizeLog />
    </div>
  );
};

export default SummarizePage;
