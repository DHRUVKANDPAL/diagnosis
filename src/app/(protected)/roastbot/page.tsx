"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { roastBot } from "./actions";
import { set } from "date-fns";
import { read } from "fs";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import { Bot, Globe, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";

type Message = {
  role: "user" | "bot";
  content: string;
};
type Language = "English" | "Hinglish";

const AskQuestionCard = () => {
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = React.useState<Language>("English");
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const onSubmit = async (e: any) => {
    e.preventDefault();
    messages.push({ role: "user", content: input });
    setMessages([...messages]);
    setInput("");
    setLoading(true);
    if (messages.length > 15) {
      const updatedMessages = messages.slice(6);
      setMessages(updatedMessages);
    }

    const botMessageIndex = messages.length;
    messages.push({ role: "bot", content: "" });
    setMessages([...messages]);

    try {
      const { output } = await roastBot(input, messages,language);
      for await (const delta of readStreamableValue(output)) {
        if (delta && messages[botMessageIndex]) {
          messages[botMessageIndex].content += delta;
          setMessages([...messages]);
        }
      }
    } catch (error) {
      console.error("Error generating bot response:", error);
      if (messages[botMessageIndex]) {
        messages[botMessageIndex].content =
          "Error generating bot response. Please try again.";
      }
      setMessages([...messages]);
    } finally {
      setLoading(false);
    }
  };
  const processText = (text: string) => {
    // Updated regex to handle hashtags ending with space
    const regex =
      /(\([^)]+\)|\[[^\]]+\]|{[^}]+}|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|#[^ ]+(?= |$)|"[^"]+"|[^()[\]{}#"*`]+)/g;

    const parts = text.match(regex) || [text];

    return parts.map((part, index) => {
      // Check if the part is a special expression
      if (
        (part.startsWith("(") && part.endsWith(")")) ||
        (part.startsWith("[") && part.endsWith("]")) ||
        (part.startsWith("{") && part.endsWith("}")) ||
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("*") && part.endsWith("*")) ||
        (part.startsWith("`") && part.endsWith("`")) ||
        part.startsWith("#") || // Changed this condition for hashtags
        (part.startsWith('"') && part.endsWith('"'))
      ) {
        return (
          <span
            key={index}
            className={cn(
              "font-bold",
              part.startsWith("#") ? "text-gray-800" : "text-gray-700",
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      <div className="-mx-[22px] flex h-full items-center justify-center rounded-xl bg-gray-50 sm:m-0 sm:p-4">
        <Card className="flex h-full w-full flex-col rounded-2xl">
          <CardHeader className="rounded-2xl p-0">
            <CardTitle className="rounded-t-2xl bg-red-500 p-4 text-center text-2xl text-white">
              RoastBot 🤖
            </CardTitle>
            <div className="relative p-4">
              <Select
                value={language}
                onValueChange={(value: Language) => setLanguage(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hinglish">Hinglish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "bot" && (
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 p-2">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span
                    data-color-mode="light"
                    className={`inline-block max-w-[75%] rounded-lg p-2 pr-4 md:max-w-[70%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-black"
                    }`}
                  >
                    {/* {processText(message.content)} */}
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <MDEditor.Markdown
                        source={message.content}
                        style={{ background: "transparent" }}
                      />
                    )}
                  </span>
                  {message.role === "user" && (
                    <div className="ml-2 mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 p-2">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={onSubmit} className="flex w-full space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit" disabled={loading}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AskQuestionCard;
