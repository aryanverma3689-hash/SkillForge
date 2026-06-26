import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { targetRole, missingSkills } = await req.json();

    const customKey = req.headers.get("x-api-key");
    const apiKey = customKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      maxRetries: 0,
      schema: z.object({
        weeks: z.array(z.object({
          title: z.string().describe("e.g. 'Week 1: Python for Data Science'"),
          duration: z.string().describe("Estimated hours, e.g. '10 hours'"),
          topics: z.array(z.string()).describe("List of sub-topics to cover")
        }))
      }),
      prompt: `
        You are an expert AI Career Coach.
        The user wants to become a ${targetRole}. They are currently missing these critical skills: ${missingSkills.join(", ")}.

        Generate a focused 4 to 6 week learning roadmap to help them acquire these specific missing skills.
        Make the titles engaging.
        Keep the topics VERY brief (2-4 words each) to ensure lightning-fast generation.
      `
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Error generating roadmap:", error);
    
    return NextResponse.json({ 
      error: "Failed to generate roadmap", 
      details: error?.message || error?.toString() || "Unknown error" 
    }, { status: 500 });
  }
}
