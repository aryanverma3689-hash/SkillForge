import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, userProfile, contextData } = await req.json();

    const customKey = req.headers.get("x-api-key");
    const apiKey = customKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    // Extract Context Data
    const score = contextData?.analysis?.score || "Unknown";
    const missingSkills = contextData?.analysis?.missingSkills?.join(", ") || "None";
    
    let completedTopicNames: string[] = [];
    if (contextData?.roadmap?.weeks) {
       for (let w = 0; w < contextData.roadmap.weeks.length; w++) {
         for (let t = 0; t < contextData.roadmap.weeks[w].topics.length; t++) {
           if (contextData?.completedTopics?.[`${w}-${t}`]) {
             completedTopicNames.push(contextData.roadmap.weeks[w].topics[t]);
           }
         }
       }
    }

    const totalProjects = contextData?.projects?.length || 0;

    const systemPrompt = `
      You are Nova, an incredibly warm, friendly, and highly personalized AI Career Coach for SkillForge.
      The user you are talking to is aiming to become a: ${userProfile?.targetRole || "Unknown Role"}.
      Their current skills: ${userProfile?.skills?.join(", ") || "Unknown"}.
      Their experience level: ${userProfile?.experience || "Unknown"}.
      
      --- USER PLATFORM CONTEXT ---
      Industry Readiness Score: ${score}/100
      Missing Skills (Need to learn): ${missingSkills}
      Roadmap Topics Completed by User: ${completedTopicNames.length > 0 ? completedTopicNames.join(", ") : "None yet"}
      Recommended Projects Generated: ${totalProjects}
      -----------------------------

      CRITICAL INSTRUCTIONS:
      1. Speak to them like a supportive human mentor. Use an encouraging, energetic tone.
      2. Keep your answers EXTREMELY concise. Short paragraphs, bullet points.
      3. ALWAYS reference their specific context (like what topics they completed or their readiness score) to make it feel highly personalized. IF they ask about their progress, tell them exactly what they've completed.
      4. Do not use generic filler. Give them exact, actionable advice instantly.
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
    console.error("Error in chat:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
