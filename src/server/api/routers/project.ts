import { z } from "zod";
import {
  createTRPCRouter,
  protectedProdcedure,
  publicProcedure,
} from "../trpc";

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
      const project=await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          UsertoProject: {
            create: {
              userId: ctx.user.userId!,
            },
          }
        },
      })
      return project;
    }),
    getProject:protectedProdcedure.query(async ({ ctx }) => {
      return await ctx.db.project.findMany({
        where: {
          UsertoProject: {
            some: {
              userId: ctx.user.userId!,
            },
          },
        },
      })
    })
});
