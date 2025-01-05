import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {z } from "zod";

const bodyParser=z.object({
   projectId:z.string(),
   meetingUrl:z.string(),
   meetingId:z.string(),
})

export const maxDuration=60;

export async function POST(req: NextRequest) {
   const {userId}=await auth();
   if(!userId) return NextResponse.json({message:"Unauthorized"},{status:401});
   try {
      const body=await req.json();
      const {meetingUrl,meetingId,projectId}=body;
      const {summaries}=await processMeeting(meetingUrl);
      await db.issue.createMany({
         data: summaries.map((summary) => ({
            start: summary.start,
            end: summary.end,
            gist: summary.gist,
            headline: summary.headline,
            summary: summary.summary,
            meetingId: meetingId,
         }))
      })
      await db.meeting.update({
         where: {
            id: meetingId,
         },
         data: {
            status: "COMPLETED",
            name:summaries[0]!.headline
         },
      })
      return NextResponse.json({message:"Success"});

   } catch (error) {
      console.log(error);
      return NextResponse.json({message:"Internal Server Error"},{status:500});
   }
}   