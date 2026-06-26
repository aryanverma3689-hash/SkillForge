import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { jobDescription, userProfile } = await req.json();

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
        matchScore: z.number().describe("An integer percentage (0-100) representing how well the user's skills match the job description."),
        missingKeywords: z.array(z.string()).describe("A list of important skills or keywords from the JD that the user is missing."),
        recommendedLearningTime: z.string().describe("Estimated time to learn the missing skills (e.g., '6 Weeks', '2 Months')"),
        industryBenchmark: z.object({
          role: z.string(),
          topPercentileSkills: z.array(z.string()),
          userRanking: z.string()
        }).describe("Industry benchmark data for the target role showing top 10% skills and the user's current percentile ranking."),
        skillsTree: z.array(z.object({
          category: z.string(),
          skills: z.array(z.object({
            name: z.string(),
            acquired: z.boolean()
          }))
        })).describe("A hierarchical grouping of all required skills by category, marking which ones the user has acquired vs missing."),
        salaryProjection: z.object({
          current: z.string(),
          potential: z.string()
        }).describe("Estimated salary value in LPA (Lakhs Per Annum). E.g. current: '₹4-6 LPA', potential: '₹8-12 LPA' after learning missing skills."),
        coverLetter: z.string().describe("A highly tailored, professional 3-paragraph cover letter combining the user's skills with the specific needs mentioned in the JD.")
      }),
      prompt: `
        You are an expert ATS (Applicant Tracking System) Analyzer and Technical Recruiter.
        
        Job Description:
        ${jobDescription}

        Candidate Profile:
        Target Role: ${userProfile?.targetRole || "Unknown"}
        Skills: ${userProfile?.skills?.join(", ") || "Unknown"}
        Experience: ${userProfile?.experience || "Unknown"}

        Analyze how well this candidate matches the job description. 
        Identify exactly which keywords from the JD they are missing.
        Estimate a realistic 'recommendedLearningTime' to acquire the missing skills.
        Provide an 'industryBenchmark' comparing them to the top 10% of candidates for this role, and estimate their percentile 'userRanking' (e.g. 'Top 45%').
        Create a 'skillsTree' grouping the required skills logically into categories, marking each as acquired (true) or missing (false).
        Provide a 'salaryProjection' in Indian Rupees (LPA) showing their 'current' estimated value and 'potential' value after acquiring the missing skills.
        Then, write a persuasive, highly detailed, and tailored cover letter (3-4 paragraphs) for this specific job that highlights the skills they DO have. It should sound professional, confident, and specific to the JD.
      `
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Error analyzing JD:", error);
    return NextResponse.json({ 
      error: "Failed to analyze Job Description",
      details: error?.message || error?.toString() || "Unknown error"
    }, { status: 500 });
  }
}
