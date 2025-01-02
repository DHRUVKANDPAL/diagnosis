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
    }),
  SearchCommits: protectedProdcedure
    .input(z.object({ commitUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await searchCommitsAndSummarize(input.commitUrl, ctx.user.userId!);
    }),
  getSearchCommits: protectedProdcedure
    .input(
      z.object({
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
        },
      });

      return {
        searchedCommits,
        totalCommits,
        totalPages: Math.ceil(totalCommits / pageSize),
      };
    }),
});
