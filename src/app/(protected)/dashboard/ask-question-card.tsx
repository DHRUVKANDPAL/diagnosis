"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import { set } from "date-fns";
import CodeReferences from "./code-references";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filePreferences, setFilePreferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const onSubmit = async (e: any) => {
    setAnswer("");
    setFilePreferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    const { output, filePreferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilePreferences(filePreferences);
    for await (const delta of readStreamableValue(output)) {
      if (delta) setAnswer((prev) => prev + delta);
    }
    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-color-mode="light" className="sm:max-w-[75vw]">
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo2.png" alt="logo" width={40} height={40}></Image>
            </DialogTitle>
          </DialogHeader>
          <MDEditor.Markdown
            source={answer}
            className=" !h-full max-h-[30vh] max-w-[70vw] overflow-y-scroll"
          />
          <CodeReferences fileReferences={filePreferences} />
          <Button
            type="button"
            className=" sm:max-w-[70vw]"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader> Ask a Question</CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Diagnosis
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
