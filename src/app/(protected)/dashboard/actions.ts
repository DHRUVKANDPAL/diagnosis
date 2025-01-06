"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;
  const result = (await db.$queryRaw`
  SELECT "fileName","sourceCode","summary" ,
  1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.35
  AND "projectId"=${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const { fileName, sourceCode, summary } of result) {
    context += `Source: ${fileName}\n`;
    context += `Code Content: ${sourceCode}\n`;
    context += `Summary of File: ${summary}\n`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an AI code assistant designed to provide detailed, accurate, and step-by-step answers about a codebase. Your target audience comprises software engineers who expect technical precision and expert-level guidance.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of Al include expert knowledge, helpfulness, cleverness, and articulateness.
You have access to a vast repository of knowledge and can provide accurate answers to almost any code-related question. If additional context is provided, you must incorporate it into your response. If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions. 
INSTRUCTIONS : 
If the context block is present:
Use it as the primary source of truth.
Base all answers explicitly on the context, refraining from inventing details not provided.
If the question involves a specific file or code:
Provide a thorough explanation and step-by-step instructions.
Include annotated code snippets in Markdown syntax.
Avoid apologies for previous responses; instead, acknowledge new information by integrating it seamlessly.
Ensure all responses are complete, technical, and actionable, leaving no room for ambiguity.
START OF CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
START OF QUESTION 
${question}
END OF QUESTION
Ensure that provide responses so detailed that even who is not familiar with the codebase can understand.
Make sure your response is detailed, actionable and provided in a markdown format. 
ADDITIONAL INSTRUCTIONS: 
If the provided context is insufficient or missing, generate a response based solely on the question only if it pertains to code-related topics, such as implementing functionality or offering an opinion on how to achieve a specific functionality.
Like the previous instruction, ensure that the response is detailed, actionable, and provided in a markdown format.
If the question is not code-related, provide a response like a AI code assistant to stick to code related topics and not distract yourself with non-code related topics.
`,
    });


    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();

  })();

  return {
   output: stream.value,
   filePreferences: result
  }
}
