import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const cleanMessages = messages
    .filter((m: any) => m.role === "user" || m.role === "assistant")
    .map((m: any) => ({
      role: m.role,
      content: m.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") || "",
    }))
    .filter((m: any) => m.content.length > 0);

  const result = streamText({
    model: google("gemini-2.5-flash"),

    system: `
You are a finance assistant.
Only answer about:
- expenses
- income
- budgets
- analytics
- calendar
`,

    messages: cleanMessages,
  });

  return result.toTextStreamResponse();
}