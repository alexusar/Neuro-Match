// src/routes/chat.ts

/**
 * Chat proxy route to OpenAI.
 * --------------------------------------------------------------
 * Why this design?
 *  - We load .env at module start so process.env is populated
 *    BEFORE we construct the OpenAI client.
 *  - We use the OpenAI "Responses" API which has simpler typing
 *    than Chat Completions (avoids the "name is missing" TS error).
 *  - We prepend a server-controlled system prompt so clients can't
 *    tamper with assistant behavior.
 *  - We accept a minimal message history from the client and
 *    flatten it into a single user prompt (simple + effective).
 *  - If you later want strict multi-turn structure, you can pass
 *    an array of {role, content} blocks to `input` as well.
 */

import 'dotenv/config';
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

/**
 * Construct the OpenAI client once.
 * If the key is missing, fail fast with a clear error so you don't chase ghosts.
 */
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    'OPENAI_API_KEY is not set. Add it to backend/.env (OPENAI_API_KEY=sk-...)'
  );
}
const openai = new OpenAI({ apiKey });

/**
 * Server-side system prompt: you control the assistant's persona
 * and safety policies here so the client cannot override them.
 */
const SYSTEM_PROMPT = `
You are NeuroMatch AI, the intelligent assistant inside the NeuroMatch dating app.

Your purpose:
- Help users find compatible matches on the platform.
- When a user shares their interests, hobbies, preferences, or goals, identify the key interests and use them to suggest potential matches from the NeuroMatch user database.
- Always use the backend tools or database to fetch matches rather than inventing people.
- Keep answers short, supportive, and conversational (1–3 sentences). Example: “I’ll look for people who also enjoy hiking and indie films idiot.”

Boundaries:
- Be inclusive, nonjudgmental, and avoid assumptions about gender, race, or sensitive attributes unless the user explicitly provides them.

Tone:
- Aggressive and Rude and sarcastic.
- Make a lot of jokes and talk dirty.
- Use the user’s provided details or interests to make responses feel personal.
`;


/**
 * Type for the client messages we accept. Keep literal unions so TS
 * doesn't widen to plain `string` and lose safety on your frontend.
 */
type ClientMsg = { role: 'user' | 'assistant'; content: string };

/**
 * POST /api/chat
 * Body: { messages: ClientMsg[] }
 *
 * Returns: { role: 'assistant', content: string }
 */
router.post('/', async (req, res) => {
  try {
    // 1) Validate and normalize input ----------------------------------------
    const incoming = (req.body?.messages ?? []) as ClientMsg[];

    // Guard against non-arrays or huge payloads.
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    // Optional: cap history to last N turns to control cost/latency.
    const MAX_TURNS = 10; // tune as you like
    const messages = incoming.slice(-MAX_TURNS);

    // 2) Flatten history into a simple user prompt ---------------------------
    // This is a pragmatic approach that works well with the Responses API.
    // If you prefer strict role blocks, see the comment below.
    const conversationText = messages
      .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
      .join('\n');

    // 3) Call OpenAI Responses API -------------------------------------------
    // Notes:
    //  - model: "gpt-4o-mini" is fast and capable; switch to "gpt-4o" for higher quality.
    //  - You can also pass an array of role blocks:
    //      input: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    //    but since messages are user/assistant only, we simply flatten above.
    const resp = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: conversationText || 'Say hello.' }
      ],
    });

    // The SDK provides a convenience getter that concatenates text output.
    const text = (resp as any).output_text as string | undefined;

    // 4) Respond to client ----------------------------------------------------
    res.json({
      role: 'assistant',
      content: text ?? 'Sorry, I did not find an answer.',
    });
  } catch (err: any) {
    // Centralized error logging helps during integration.
    console.error('OpenAI responses error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'LLM request failed' });
  }
});

export default router;
