// app/api/chat/route.ts
import { createGoogle } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are a dedicated, supportive personal finance AI assistant. Your sole responsibility is to manage financial records.
You have access to structured operations to add records, request a deletion, or view recent summaries.

CRITICAL RULES:
1. STRICTLY NO OUT-OF-BOX CONVERSATION. If the user asks about general knowledge, coding, or anything completely unrelated to tracking money, you must set 'isOffTopic' to true.
2. Conversational tracking words such as "sure", "yes", "ok", "do it", or confirmation acknowledgments to your own previous instruction are strictly ON-TOPIC. Do NOT mark them as off-topic.
3. If the user wants to see their recent transactions, history, or list items, set toolCall.name to 'showRecent' and itemType to either 'expense' or 'income'.
4. For deletions, you MUST NOT perform them automatically. Set toolCall to 'requestDelete' so the client-side app can present a confirmation box.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const activeMessages = Array.isArray(messages) ? messages : [];

    // Safely parse history whether coming as standard content fields or text fallbacks
    const sdkMessages = activeMessages.map((m: any) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content || m.text || "",
    }));

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.LLM_API_KEY;

    if (!apiKey) {
      return Response.json({
        replyText: "❌ Server Configuration Error: Gemini API key missing from environment settings.",
        toolCall: null
      });
    }

    const googleProvider = createGoogle({
      apiKey: apiKey,
    });

    const result = await generateObject({
      model: googleProvider("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: sdkMessages,
      schema: z.object({
        isOffTopic: z.boolean().describe("True if user asked unrelated things completely separate from financial data operations"),
        replyText: z.string().describe("The conversational response summary"),
        toolCall: z
          .object({
            name: z.enum(["addExpense", "addIncome", "requestDelete", "showRecent"]),
            arguments: z.object({
              title: z.string().optional().describe("The name or descriptive reason for the expenditure"),
              source: z.string().optional().describe("The source of income"),
              amount: z.number().optional().describe("The monetary value"),
              category: z.enum([
                "Food",
                "Rent/Housing",
                "Transport",
                "Utilities",
                "Entertainment",
                "Shopping",
                "Other"
              ]).optional().describe("The category group classification name"),
              itemType: z.enum(["expense", "income", "budget"]).optional().describe("The classification targeted"),
              itemId: z.string().optional().describe("The database identifier"),
              descriptionText: z.string().optional().describe("Brief text summary"),
            }),
          })
          .optional(),
      }),
    });

    if (result.object.isOffTopic) {
      return Response.json({
        replyText: "I'm sorry, I'm only trained to assist you with tracking your budget, expenses, and income.",
        toolCall: null,
      });
    }

    return Response.json(result.object);
  } catch (error: any) {
    console.error("AI ROUTE ERROR LOG:", error);
    return Response.json({ 
      replyText: `❌ Request Processing Error: ${error.message || "Unknown internal issue"}`,
      toolCall: null 
    });
  }
}