import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
import { pusherServer } from "./pusher";
import { auth } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  try {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken || process.env.GITHUB_TOKEN,
      branch: "main",
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5, // Defaults to 2
      ignoreFiles: [
        "package.json",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "bun.lockb",
        "tailwind.config.ts",
        "tailwind.config,js",
        "*.svg",
        "*.png",
        "*.jpg",
        "*.jpeg",
        ".eslintrc.js",
        ".gitignore",
        ".prettierrc.js",
        ".prettierignore",
        "README.md",
        "vercel.json",
      ],
    });
    await pusherServer.trigger("rooms", "logs", {
      message: `Fetching files from ${githubUrl}`,
    });
    const docs = [];
    for await (const doc of loader.loadAsStream()) {
      const fileName = doc.metadata.source;
      const excludedPaths = ["components/ui", "public", ".json",".config"];

      if (!excludedPaths.some((path) => fileName.includes(path))) {
        docs.push(doc);
      }
    }
    // console.log({ docs });
    return docs;
  } catch (error) {
    try {
      const loader = new GithubRepoLoader(githubUrl, {
        accessToken: process.env.GITHUB_TOKEN,
        branch: "master",
        recursive: true,
        unknown: "warn",
        maxConcurrency: 5, // Defaults to 2
        ignoreFiles: [
          "package.json",
          "package-lock.json",
          "yarn.lock",
          "pnpm-lock.yaml",
          "bun.lockb",
          "tailwind.config.ts",
          "tailwind.config,js",
          "*.svg",
          "constants.js",
          "constants.ts",
          ".gitignore",
          ".gitkeep",
        ],
      });
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const docs = [];
      for await (const doc of loader.loadAsStream()) {
        const fileName = doc.metadata.source;
        if (!fileName.includes("components/ui")) docs.push(doc);
        await delay(1000);
      }
      // console.log({ docs });
      return docs;
    } catch (error) {}
  }
  return [];
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken!);
  const allEmbeddings = await generateEmbeddings(docs);
  await pusherServer.trigger("rooms", "logs", {
    message: `Indexing embeddings for ${githubUrl}`,
  });
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId: projectId,
        },
      });

      await db.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding"=${embedding.embedding}::vector
    WHERE "id"=${sourceCodeEmbedding.id} 
    `;
    }),
  );
  await pusherServer.trigger("rooms", "logs", {
    message: `Completed. Project indexed successfully`,
  });
};

const generateEmbeddings = async (docs: Document[]) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const results = [];
  for (const doc of docs) {
    console.log("generating embeddings for ",doc.metadata.source);
    await pusherServer.trigger("rooms", "logs", {
      message: `Generating Embeddings for ${doc.metadata.source}`,
    });
    const summary = await summarizeCode(doc);
    const embedding = await generateEmbedding(summary);
    results.push({
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    });
    await delay(4100); 
  }
  await delay(40000);
  return results;
};




const getFiles=async(path:string,octokit:Octokit,githubOwner:string,githubRepo:string,acc:number=0)=>{
  const {data}=await octokit.rest.repos.getContent({
    owner:githubOwner,
    repo:githubRepo,
    path
  })
  if(!Array.isArray(data) && data.type==="file"){
    return acc+1;
  }
  if(Array.isArray(data)){
    let fileCount=0;
    const directories:string[]=[];
    for(const item of data){
      if(item.type==="dir"){
        directories.push(item.path);
      }
      else{
        fileCount++;
      }
    }
    if(directories.length>0){
      const directoryCount=await Promise.all(directories.map((dir)=>getFiles(dir,octokit,githubOwner,githubRepo,0)));
      fileCount+=directoryCount.reduce((acc,count)=>acc+count,0);
    }
    return acc+fileCount;
  }
  return acc;
}

export const checkCredits=async(githubUrl:string,githubToken?:string)=>{
  const octokit = new Octokit({
    auth: githubToken || process.env.GITHUB_TOKEN,
  })
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];
  if(!githubOwner || !githubRepo){
    return 0;
  }
  const fileCount=await getFiles("",octokit,githubOwner,githubRepo);
  return fileCount;
}