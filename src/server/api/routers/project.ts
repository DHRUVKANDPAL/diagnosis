import { z } from "zod";
import {
  createTRPCRouter,
  protectedProdcedure,
  publicProcedure,
} from "../trpc";
import { pollCommits, searchCommitsAndSummarize } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProdcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          UsertoProject: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });

      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      return project;
    }),
  getProject: protectedProdcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        UsertoProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
      },
    });
  }),
  getCommits: protectedProdcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        await pollCommits(input.projectId);
        const { page, pageSize } = input;
        const skip = (page - 1) * pageSize;
        const commits = await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
          },
          orderBy: {
            commitDate: "desc",
          },
          skip,
          take: pageSize,
        });

        const totalCommits = await ctx.db.commit.count({
          where: {
            projectId: input.projectId,
          },
        });

        return {
          commits,
          totalCommits,
          totalPages: Math.ceil(totalCommits / pageSize),
        };
      } catch (error) {
        return {
          commits: [],
          totalCommits: 0,
          totalPages: 0,
        };
      }
    }),
  SearchCommits: protectedProdcedure
    .input(z.object({ commitUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await searchCommitsAndSummarize(input.commitUrl, ctx.user.userId!);
    }),
  getSearchCommits: protectedProdcedure
    .input(
      z.object({
        searchQuery: z.string(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const searchedCommits = await ctx.db.searchedCommits.findMany({
        where: {
          userId: ctx.user.userId!,
          OR: [
            {
              commitUrl: {
                contains: input.searchQuery,
                mode: "insensitive",
              },
            },
            {
              summary: {
                contains: input.searchQuery,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });

      const totalCommits = await ctx.db.searchedCommits.count({
        where: {
          userId: ctx.user.userId!,
          OR: [
            {
              commitUrl: {
                contains: input.searchQuery,
                mode: "insensitive",
              },
            },
            {
              summary: {
                contains: input.searchQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      });

      return {
        searchedCommits,
        totalCommits,
        totalPages: Math.ceil(totalCommits / pageSize),
      };
    }),
  saveAnswer: protectedProdcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          answer: input.answer,
          fileReferences: input.fileReferences,
          userId: ctx.user.userId!,
        },
      });
    }),
  activeSearchCommits: protectedProdcedure
    .input(
      z.object({
        searchQuery: z.string(),
        projectId: z.string(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        await pollCommits(input.projectId);
        const { page, pageSize } = input;
        const skip = (page - 1) * pageSize;
        // Define both queries as promises
        const searchedCommitsPromise = ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
            OR: [
              {
                commitAuthorName: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
              {
                commitMessage: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
              {
                summary: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
            ],
          },
          skip,
          take: pageSize,
        });

        const totalCommitsPromise = ctx.db.commit.count({
          where: {
            projectId: input.projectId,
            OR: [
              {
                commitAuthorName: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
              {
                commitMessage: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
              {
                summary: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        // Run both queries in parallel using Promise.all
        const [searchedCommits, totalCommits] = await Promise.all([
          searchedCommitsPromise,
          totalCommitsPromise,
        ]);

        return {
          searchedCommits,
          totalCommits,
          totalPages: Math.ceil(totalCommits / pageSize),
        };
      } catch (error) {
        return {
          searchedCommits: [],
          totalCommits: 0,
          totalPages: 0,
        };
      }
    }),
});
