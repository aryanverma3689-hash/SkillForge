import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { targetRole, currentSkills, experience } = await req.json();

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
        matchScore: z.number().describe("An integer percentage (0-100) representing how well the current skills match the target role"),
        readinessScore: z.number().describe("An out of 100 industry readiness score factoring in experience and skills"),
        missingSkills: z.array(z.string()).describe("A list of critical skills the user is missing for the target role"),
        matchedSkills: z.array(z.string()).describe("A list of the user's current skills that are highly relevant to the target role")
      }),
      prompt: `
        You are an expert AI Career Coach.
        Analyze the following user profile against their target role.
        
        Target Role: ${targetRole}
        Current Skills: ${currentSkills.join(", ")}
        Experience: ${experience}
        
        Compare their skills against what the industry currently demands for this role.
        Identify their matched skills and the missing skills they need to learn.
        Provide a Match Score (how closely their skills align) and an Industry Readiness Score (overall readiness out of 100).
      `
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Error analyzing skills:", error);
    return NextResponse.json({ 
      error: "Failed to analyze skills", 
      details: error?.message || error?.toString() || "Unknown error" 
    }, { status: 500 });
  }
}
