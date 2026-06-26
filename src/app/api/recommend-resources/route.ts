import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topics } = await req.json();

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
        resources: z.array(z.object({
          title: z.string().describe("Title of the resource (e.g. 'CS50 Intro to AI')"),
          description: z.string().describe("A very short one-sentence description"),
          type: z.enum(["Course", "Video", "Documentation", "Article"]),
          provider: z.string().describe("e.g. YouTube, Coursera, Harvard, Stanford, Udemy, Google"),
          cost: z.enum(["Free", "Paid"]),
          difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
          url: z.string().describe("The actual direct URL to the resource (e.g., https://www.udemy.com/...)")
        }))
      }),
      prompt: `
        You are an expert AI Career Coach.
        The user is studying these topics: ${topics.join(", ")}.

        Recommend 6 high-quality learning resources spanning across YouTube, Udemy, Harvard, Stanford, Oracle, Google, and Coursera.
        Include a good mix of Free and Paid options.
        CRITICAL: Provide the EXACT direct URL to the resource, NOT a search query.
        CRITICAL: Keep descriptions to exactly ONE very short sentence to ensure lightning-fast generation.
      `
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Error recommending resources:", error);
    return NextResponse.json({ 
      error: "Failed to recommend resources",
      details: error?.message || error?.toString() || "Unknown error"
    }, { status: 500 });
  }
}
