// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY!,
});



function msToTime(ms:number){
   const seconds=Math.round(ms/1000);
   const minutes=Math.floor(seconds/60);
   const remainingSeconds=seconds%60;
   return `${minutes.toString().padStart(2,"0")}:${remainingSeconds.toString().padStart(2,"0")}`;
}

export const processMeeting = async (meetingUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio_url: meetingUrl,
    auto_chapters:true,
  });

  const summaries=transcript.chapters?.map((chapter)=>({
   start:msToTime(chapter.start),
   end:msToTime(chapter.end),
   gist:chapter.gist,
   headline:chapter.headline,
   summary:chapter.summary
  })) || [];
  if(!transcript.text) throw new Error("No transcript found");
  return {summaries};
};

