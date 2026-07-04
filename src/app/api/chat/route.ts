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
    // Expecting full messages history array from the client side now
    const { messages } = await req.json();
    
    // Fallback if formatting was sent incorrectly
    const activeMessages = Array.isArray(messages) ? messages : [];
    const latestPrompt = activeMessages[activeMessages.length - 1]?.text || "";

    const googleProvider = createGoogle({
      apiKey: process.env.LLM_API_KEY,
    });

    const result = await generateObject({
      model: googleProvider("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      // Pass previous turns along with the prompt so the model retains conversation context
      prompt: `Conversation history:\n${activeMessages.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nLatest User Input: ${latestPrompt}`,
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
              // Locked to the explicit options visible in image_bc2361.png
              category: z.enum([
                "Food", 
                "Rent/Housing", 
                "Transport", 
                "Utilities", 
                "Entertainment", 
                "Shopping", 
                "Other"
              ]).optional().describe("The specific broader category group mapped to the available dropdown selections"),
              itemType: z.enum(["expense", "income", "budget"]).optional().describe("The classification targeted for removal or display listing"),
              itemId: z.string().optional().describe("The database record identifier string if specified for removal"),
              descriptionText: z.string().optional().describe("Brief textual description summary"),
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
    return Response.json({ error: error.message }, { status: 500 });
  }
}