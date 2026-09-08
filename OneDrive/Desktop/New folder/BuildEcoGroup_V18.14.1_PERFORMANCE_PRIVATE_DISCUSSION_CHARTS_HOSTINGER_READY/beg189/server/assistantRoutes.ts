import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { env } from './env';
import { assistantRateLimiter } from './middleware/rateLimiter';
import { requireAuth } from './middleware/auth';
import { buildCopilotGuide } from './copilotGuide';

export const assistantRouter = Router();

const MessageSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  page: z.string().trim().max(200).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string().max(1200),
  })).max(8).default([]),
});

const websiteKnowledge = `
BuildEcoGroup is an Indian Project Services & Technology Orchestration Platform, not a construction contractor.
Core journey: requirement -> Case ID (server-generated on wizard submit) -> qualification -> verified expert assignment -> BOQ/quotation comparison -> approval -> project tracking -> handover.
Services: construction, land/property, solar, interior/renovation, BOQ/material, consultants, water, project monitoring.
Navigation: /initiate-project (requirement wizard — only way to create a Case), /track, /consultants, /contact, /login, /register.
BuildEco Copilot quick actions: Build a Project, Find Land, Solar, Interior/Renovation, Material/BOQ, Find Expert, Track My Case.
Privacy: personal consultant/customer phone and email are not public. Sensitive records require login.
`;

function fallbackReply(message: string) {
  const hindi = /[\u0900-\u097F]/.test(message);
  const text = message.toLowerCase();
  if (/copilot|assist|help|मदद|सहाय/.test(text)) return hindi
    ? 'BuildEco Copilot panel में quick actions उपयोग करें: Build, Land, Solar, Interior, BOQ, Expert, Track। Case केवल requirement wizard submit के बाद server से बनता है।'
    : 'Use BuildEco Copilot quick actions: Build, Land, Solar, Interior, BOQ, Expert, Track. Cases are created only when you submit the requirement wizard on the server.';
  if (/login|sign in|लॉगिन|पासवर्ड/.test(text)) return hindi
    ? 'Login पेज खोलें। Password या OTP यहाँ साझा न करें।'
    : 'Open the Login page. Never share your password or OTP here.';
  if (/register|signup|रजिस्टर|पंजीकरण/.test(text)) return hindi
    ? 'Register पेज पर details भरें। सफल registration के बाद dashboard खुलेगा।'
    : 'Complete Register with your details. Successful registration opens your dashboard.';
  if (/track|status|case|query|स्थिति|ट्रैक|केस/.test(text)) return hindi
    ? 'Track quick action या Case ID भेजें। मैं केवल server record दिखा सकता हूँ — Case ID नहीं बनाता।'
    : 'Use the Track quick action or send your Case ID. I only show real server records — I never invent Case IDs.';
  return hindi
    ? 'BuildEco Copilot quick actions से शुरू करें या अपना लक्ष्य स्पष्ट लिखें। मैं कीमत, consultant या database results नहीं बनाता।'
    : 'Start with a Copilot quick action or describe your goal clearly. I never invent prices, consultants, or database results.';
}

assistantRouter.post('/message', assistantRateLimiter, async (req: Request, res: Response) => {
  const parsed = MessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Please enter a valid message.' });

  const { message, page, history } = parsed.data;
  if (!env.GEMINI_API_KEY) {
    return res.json({ success: true, reply: fallbackReply(message), mode: 'guided-help' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const conversation = history.map(item => `${item.role.toUpperCase()}: ${item.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${websiteKnowledge}\nCurrent page: ${page || '/'}\nRecent conversation:\n${conversation}\nUSER: ${message}`,
      config: {
        systemInstruction: 'You are BuildEco Copilot — a guided assistant over real workflows. Detect user language (Hindi/English) and reply in the same language. Be concise. NEVER invent Case IDs, project status, properties, consultants, prices, BOQ data, or database results. Cases are created only via /initiate-project wizard submit. For tracking, ask for Case ID and direct to Track. For services, suggest the matching Copilot quick action. Hand off to /contact or phone for human help. Do not request passwords or OTPs.',
        maxOutputTokens: 500,
        temperature: 0.25,
      },
    });
    const reply = response.text?.trim() || fallbackReply(message);
    return res.json({ success: true, reply, mode: 'ai' });
  } catch (error) {
    console.error('[BuildEco Assist] AI provider error');
    return res.json({ success: true, reply: fallbackReply(message), mode: 'guided-help' });
  }
});

const GuideSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  activeCaseRef: z.string().trim().max(64).optional(),
});

/** Context-aware project guide — authenticated users only; answers from authoritative store data. */
assistantRouter.post('/guide', assistantRateLimiter, requireAuth, (req: Request, res: Response) => {
  const parsed = GuideSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Please enter a valid message.' });
  }

  const result = buildCopilotGuide(req.user!, parsed.data.message, {
    activeCaseRef: parsed.data.activeCaseRef,
  });

  return res.json(result);
});
