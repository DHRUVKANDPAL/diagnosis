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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Zap, List, BookOpen, GitCommit, Brain } from "lucide-react";

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
      <div className="grid grid-cols-3 gap-6 p-6">
        <Card className="col-span-3 xl:col-span-2 ">
          <div className="items-center justify-start gap-12 py-4 md:flex">
            <img
              src="/undraw_artificial-intelligence.svg"
              className="h-40 w-auto md:block pl-4 lg:h-56"
            ></img>
            <div className="w-full max-w-md pr-2">
              <div>
                <h1 className="text-2xl font-semibold">
                  Link a Github Commit{" "}
                </h1>
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
        </Card>
        <div className="hidden xl:block">
          <Card className="h-68">
            <CardHeader>
              <CardTitle>Commit Summarizer</CardTitle>
              <CardDescription>
                Analyze and learn from Git commits with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <div className="space-y-6">
                  {/* Search Feature */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search commits..." className="pl-8" />
                  </div>

                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Fast Performance
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Quick commit analysis
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <List className="h-5 w-5 text-blue-500" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Paginated Results
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Easy navigation
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Commit Learning Section */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Learn About Commits
                    </h3>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-center space-x-2">
                          <GitCommit className="h-5 w-5 text-green-500" />
                          <p className="text-sm font-medium">
                            Detailed Commit Insights
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Explore commit changes, understand code modifications,
                          and learn from each update.
                        </p>
                        <Button variant="outline" className="w-full">
                          View Sample Commit
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Better Understanding Section */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Enhance Your Understanding
                    </h3>
                    <Card>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-5 w-5 text-purple-500" />
                          <p className="text-sm font-medium">
                            AI-Powered Explanations
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Get clear explanations of complex changes and learn
                          best practices from each commit.
                        </p>
                        <Badge
                          variant="secondary"
                          className="w-full justify-center"
                        >
                          AI Insights Available
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Documentation Link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Learn more about using the Commit Summarizer
                      </p>
                    </div>
                    <Button variant="link" className="text-sm">
                      View Docs
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      {(isPending || summarizeCommit.isPending) && <Shimmer />}
      <SummarizeLog />
    </div>
  );
};

export default SummarizePage;
