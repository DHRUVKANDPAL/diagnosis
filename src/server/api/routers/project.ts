import { z } from "zod";
import {
  createTRPCRouter,
  protectedProdcedure,
  publicProcedure,
} from "../trpc";
import { pollCommits, searchCommitsAndSummarize } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { pusherServer } from "@/lib/pusher";
import { get } from "http";
import { issue } from "@uiw/react-md-editor";
import { v2 as cloudinary } from "cloudinary";
import { currentUser } from "@clerk/nextjs/server";


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

      const user=await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true
        }
      })
      const fileCount=await checkCredits(input.githubUrl, input.githubToken);
      const currentCredits=user?.credits || 0;
      if(fileCount>currentCredits){
        throw new Error("Not enough credits");
      }


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
      await ctx.db.user.update({
        where: {
          id: ctx.user.userId!,
        },
        data: {
          credits: {
            decrement: fileCount,
          },
        },
      })
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
        name: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const answers = await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          answer: input.answer,
          fileReferences: input.fileReferences,
          userId: ctx.user.userId!,
        },
      });
      const userData=await currentUser();
      await pusherServer.trigger("qa", "new-question", {
        message: `New question added to project "${input.name}" : By ${userData?.firstName} ${userData?.lastName}`,
      });
      return answers;
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
  getQuestions: protectedProdcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  uploadMeetings: protectedProdcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meetings = await ctx.db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
          status: "PROCESSING",
        },
      });
      return meetings;
    }),
  getMeetings: protectedProdcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          issue: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
    deleteMeetings: protectedProdcedure
    .input(z.object({ meetingId: z.string(),meetingUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const parts = input.meetingUrl.split("/");
      const filenameWithExtension = parts.pop(); 
      const filename = filenameWithExtension?.split(".")[0];
      const publicId=`meetings/${filename}`;
      await cloudinary.api
        .delete_resources([publicId], {
          type: "upload",
          resource_type: "video",
        })
        .then((result) => {
          console.log("Cloudinary Deletion Result:", result);
        })
        .catch((error) => {
          console.error("Error deleting resource from Cloudinary:", error);
        });
      return await ctx.db.meeting.delete({
        where: {
          id: input.meetingId,
        },
      });
    }),
    getMeetingById: protectedProdcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: {
          id: input.meetingId,
        }
        ,include: {
          issue: true
        }
      });
    }),
    deleteProject: protectedProdcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
      return await ctx.db.project.delete({
        where: {
          id: input.projectId,
        },
      });
    }),
    getUserCredits: protectedProdcedure.query(async ({ ctx }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
      });
    }),
    getTeamMembers: protectedProdcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx,input }) => {
      return await ctx.db.usertoProject.findMany({
        where: {
          projectId: input.projectId
        },
        include: {
          user: true
        }
      })
    }),
    checkCredits: protectedProdcedure.input(z.object({ githubUrl: z.string(),githubToken: z.string().optional() })).mutation(async ({ ctx,input }) => {
      const fileCount=await checkCredits(input.githubUrl,input.githubToken);
      const userCredits=await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        }
      })
      return {
        fileCount,
        userCredits: userCredits?.credits || 0
      }
    })
});
