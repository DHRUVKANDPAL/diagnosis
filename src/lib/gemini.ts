import { api } from "@/trpc/react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
  const result = await model.generateContent([prompt,`Please provide detailed pointwise information of the following diff file covering each and every change in the code and how will it improve the codebase: Just use single * for bullet points \n\n${diff}`]);
  const textresult = await result.response.text();

  return textresult;
};

