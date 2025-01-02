import { api } from "@/trpc/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummarizeCommit = async (diff: string) => {
  const prompt = `You are an expert programmer, and you are trying to summarize a git piff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
This means that '\lib/index.js' was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \'+\' means it was added.
A line that starting with \'-\' means that line was deleted.
A line that starts with neither + nor - is code given for context and better understanding.
EXAMPLE SUMMARY COMMENTS:
* AVA Raised the amount of returned recordings from 101 to 1001 packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a tupo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numerio tolerance for test files
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`;
  const result = await model.generateContent([
    prompt,
    `Please provide detailed pointwise information of the following diff file covering each and every change in the code and how will it improve the codebase: Just use single * for bullet points \n\n${diff}`,
  ]);
  const textresult = await result.response.text();

  return textresult;
};

export async function summarizeCode(doc: Document) {
  console.log("getting summary for", doc.metadata.source);
  try {
    const code=doc.pageContent.slice(0,10000);
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
  Here is the code:
  -----------
  ${code}
  ------------
  Give a summary no more than 100 words of the code above`,
    ]);
    return response.response.text();
  } catch (error) {
    return '';
  }
}




export async function generateEmbedding(summary:string){
  const model=genAI.getGenerativeModel({
    model:'text-embedding-004'
  })
  const result=await model.embedContent(summary);
  const embedding=result.embedding;
  return embedding.values;
}
