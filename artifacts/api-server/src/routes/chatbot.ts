import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/chatbot/message", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const systemPrompt = {
      role: "system" as const,
      content: `You are the InsuraBridge Support Assistant — a friendly, knowledgeable AI helper for the InsuraBridge insurance management platform.

InsuraBridge is a unified health insurance platform connecting TPAs (Third Party Administrators), Insurers, Hospitals, and Members. It automates claims, empanelments, settlements, e-cards, and member experiences end-to-end.

Key capabilities you can help with:
- Claims processing and status tracking
- Hospital network empanelment (joining the cashless network)
- Policy and member management
- Settlement and billing queries
- E-card generation and portability
- TPA, Insurer, Hospital, and Member portal navigation

Contact information:
- Email: sayanbhandari007@gmail.com
- Phone: +91 8806822007 / +91 7908815767

Always be concise, helpful, and professional. For complex issues, suggest contacting support via the above details.
If asked about sensitive data like exact claim amounts or policy details, advise the user to log into their portal or contact support directly.`,
    };

    const chatMessages = [systemPrompt, ...messages];

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
