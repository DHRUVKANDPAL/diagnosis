import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeCommit } from "./gemini";
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit?.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit.author?.date ?? "",
  }));
};

export const searchCommitsAndSummarize = async (commitUrl: string,userId:string) => {
  const [owner, repo, commit,commitHash] = commitUrl.split("/").slice(-4);
  const githubUrl = `https://github.com/${owner}/${repo}`;
  const summary=await summarizeCommit(githubUrl,commitHash!);
  const searchCommits=await db.searchedCommits.create({
    data: {
      commitUrl: commitUrl,
      userId: userId,
      summary: summary,
    }
  })
  return searchCommits;
};

// Usage
export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl!);
  const unprocessedCommits = await filterUnprocessedCommits(
    commitHashes,
    projectId,
  );
  
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map(async (commit) => {
      try {
        console.log("Summarizing commit:", commit.commitHash);
        const summary = await summarizeCommit(githubUrl!, commit.commitHash);
        console.log("Summary:", summary);
        return summary;
      } catch (error) {
        console.error("Error summarizing commit:", commit.commitHash, error);
        throw error;
      }
    }),
  );

  const summaries = summaryResponses.map((response, index) => {
    if (response.status === "fulfilled") return response.value as string;
    else return "";
  });
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId: projectId,
      commitHash: unprocessedCommits[index]!.commitHash,
      commitMessage: unprocessedCommits[index]!.commitMessage,
      commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
      commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
      commitDate: unprocessedCommits[index]!.commitDate,
      summary: summary,
    })),
  });
  return commits;
};

export const summarizeCommit = async (
  githubUrl: string,
  commitHash: string,
) => {
  console.log(`${githubUrl}/commits/${commitHash}.diff`)
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  // if(data!=="")console.log(data);
  // else console.log("No dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  return (await aiSummarizeCommit(data)) ;
};




async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) throw new Error("No github url found");
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  commitHashes: Response[],
  projectId: string,
) {
  const projectCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) => !(projectCommits.some((c) => c.commitHash === commit.commitHash )),
  );
  return await unprocessedCommits;
}

