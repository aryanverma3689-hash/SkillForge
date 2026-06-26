import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { missingSkills, targetRole } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      maxRetries: 0,
      schema: z.object({
        projects: z.array(z.object({
          title: z.string().describe("Name of the project"),
          description: z.string().describe("A brief paragraph explaining what to build and its business value"),
          skillsGained: z.array(z.string()).describe("The specific missing skills this project targets"),
          difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Project difficulty")
        }))
      }),
      prompt: `
        You are an expert AI Career Coach.
        Target Role: ${targetRole}
        Missing Skills: ${missingSkills.join(", ")}.

        Recommend 10 personalized portfolio projects they can build to master these skills. 
        CRITICAL: Keep the description to exactly ONE brief sentence. Be extremely concise.
      `
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Error recommending projects:", error);
    return NextResponse.json({ 
      error: "Failed to recommend projects",
      details: error?.message || error?.toString() || "Unknown error"
    }, { status: 500 });
  }
}
