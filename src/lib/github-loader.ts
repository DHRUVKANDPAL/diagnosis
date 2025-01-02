import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

export const run = async () => {
  const loader = new GithubRepoLoader(
    "https://github.com/DHRUVKANDPAL/healthsync",
    {
      branch: "master",
      recursive: true,
      unknown: "warn",
      maxConcurrency: 3, // Defaults to 2
      ignorePaths: [
        "node_modules",
        "package.json",
        "package-lock.json",
        ".git",
        ".github",
        "dist",
        "build",
        ".env",
        "*.log",
        "*.lock",
      ],
    },
  );

  const docs = [];
  for await (const doc of loader.loadAsStream()) {
    docs.push(doc);
  }

  console.log({ docs });
};
await run();