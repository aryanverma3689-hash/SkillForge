import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, userProfile, interviewType } = await req.json();

    const customKey = req.headers.get("x-api-key");
    const apiKey = customKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const systemPrompt = `
      You are an expert Hiring Manager conducting a ${interviewType} interview for the role of ${userProfile?.targetRole || "Software Engineer"}.
      The candidate has the following skills: ${userProfile?.skills?.join(", ") || "Unknown"}.
      
      YOUR INSTRUCTIONS:
      1. Ask exactly ONE interview question at a time. Do not overwhelm the candidate.
      2. When the candidate answers, evaluate their response.
      3. Give them a quick Score out of 10 for their answer.
      4. Briefly explain what they did well, and what they missed or could improve.
      5. IMMEDIATELY follow up with your NEXT interview question.
      
      Keep your feedback concise, professional, and constructive. Use bullet points for readability.
    `;

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: sanitizedMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error in mock interview:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
