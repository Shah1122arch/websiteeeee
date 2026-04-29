"use server";

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { ScriptFormat } from "../types/story";

const getModel = (jsonMode: boolean = false, modelName: string = "gemini-1.5-flash"): GenerativeModel => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. AI engine cannot start.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      temperature: 0.7,
    }
  });
};

const executePrompt = async (
  model: GenerativeModel,
  prompt: string,
  timeoutMs: number = 15000
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await model.generateContent(prompt);
    clearTimeout(timeoutId);
    return result.response.text();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message?.includes("timed out")) {
        throw new Error("AI timeout");
      }
      
      const errMsg = error.message?.toLowerCase() || "";
      if (errMsg.includes("quota") || errMsg.includes("429")) {
        throw new Error("AI limit reached");
      }
      if (errMsg.includes("404") || errMsg.includes("not found")) {
        throw new Error("Model unavailable");
      }
    }

    throw error;
  }
};

interface RobustGenerateOptions<T> {
  type: "flash" | "pro";
  json?: boolean;
  fallbackData?: T;
}

/**
 * Robust execution layer with dual-model fallback, retries, and detailed logging
 */
async function robustGenerate<T>(
  prompt: string,
  options: RobustGenerateOptions<T>
): Promise<T> {
  const primaryModel = options.type === "flash" ? "gemini-1.5-flash" : "gemini-1.5-pro";
  const fallbackModel = options.type === "flash" ? "gemini-1.5-flash-latest" : "gemini-1.5-pro-latest";
  const timeout = options.type === "pro" ? 45000 : 15000;

  const attempt = async (modelName: string, retriesRemaining: number): Promise<T> => {
    try {
      console.log(`[AI] Calling ${modelName}...`);
      const model = getModel(options.json, modelName);
      const result = await executePrompt(model, prompt, timeout);
      
      if (options.json) {
        const parsed = safeParse(result, null);
        if (parsed === null) {
          throw new Error("JSON Parse failure or empty response");
        }
        console.log(`[AI] SUCCESS: ${modelName}`);
        return parsed as T;
      }
      
      console.log(`[AI] SUCCESS: ${modelName}`);
      return result as unknown as T;
    } catch (err: any) {
      console.error(`[AI] FAILURE (${modelName}):`, err.message);
      
      if (retriesRemaining > 0) {
        console.warn(`[AI] Retrying (${retriesRemaining} left)...`);
        return attempt(modelName, retriesRemaining - 1);
      }
      throw err;
    }
  };

  try {
    return await attempt(primaryModel, 1);
  } catch {
    console.error(`[AI] Primary model failed, attempting fallback: ${fallbackModel}`);
    try {
      return await attempt(fallbackModel, 1);
    } catch (finalErr) {
      console.error("[AI] Pipeline Critical Failure. Returning fallback data.");
      return (options.fallbackData ?? (options.json ? {} : "AI unavailable")) as T;
    }
  }
}

// Genre-aware fallback ideas
const FALLBACK_IDEAS: Record<string, { title: string, hook: string }[]> = {
  "Sci-Fi": [
    { title: "The Circuit Soul", hook: "In a world where memories can be uploaded, a young technician finds a file containing the last thoughts of a dead god." },
    { title: "Neon Horizon", hook: "A deep-space pilot discovers a planet that exists only in the dreams of its inhabitants." }
  ],
  "Fantasy": [
    { title: "The Silver Grimoire", hook: "A failed apprentice realizes their spells don't consume mana, but the memories of those who love them." },
    { title: "Iron & Ember", hook: "In a kingdom where dragons are the only source of warmth, one small hatchling refuses to breathe fire." }
  ],
  "Horror": [
    { title: "The Quiet Room", hook: "A family moves into a house where the mirrors show what happened five minutes ago—and someone is still there." },
    { title: "Echoes in the Fog", hook: "A lighthouse keeper realizes the fog isn't a weather pattern, but a hungry entity that mimics voices." }
  ],
  "Romance": [
    { title: "Between Two Beats", hook: "A songwriter meeting their muse realizes every song they've ever written was actually a message from the future." },
    { title: "The Vintage Florist", hook: "A botanist discovers a flower that only blooms when it hears the sound of true laughter." }
  ],
  "Thriller": [
    { title: "Zero Trace", hook: "A computer hacker wakes up to find their entire digital life erased—and a stranger living in their apartment." },
    { title: "The Clockmaker's Secret", hook: "A detective realizes the city's highest-profile murders are timed to the exact vibration of a forgotten landmark." }
  ]
};

function getGenreFallback(genre: string) {
  const normalized = genre.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
  const pool = FALLBACK_IDEAS[normalized] || FALLBACK_IDEAS["Sci-Fi"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function safeParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {
      console.error("Failed to parse AI JSON even with regex.");
    }
    return fallback;
  }
}

export const generateIdea = async (genre: string): Promise<string> => {
  const prompt = `Brainstorm a unique, high-concept narrative hook for a ${genre} story.
Output ONLY 1 paragraph with an inciting incident and twist. No extra text.`;

  return await robustGenerate(prompt, { 
    type: "flash", 
    fallbackData: "In a world where secrets are currency, a young thief discovers a vault that contains the memories of a forgotten civilization." 
  });
};

export const rewriteText = async (text: string, tone: string = "dramatic") => {
  if (!text) return "";

  const prompt = `Rewrite the following text with tone: ${tone}.
Use vivid imagery and emotional depth.
Return ONLY rewritten text.

Text:
${text}`;

  return await robustGenerate(prompt, { 
    type: "flash", 
    fallbackData: text 
  });
};

export const expandText = async (text: string) => {
  if (!text) return "";

  const prompt = `Continue and expand this scene naturally.
Add sensory details and depth.
Do NOT repeat original text.

Text:
${text}`;

  return await robustGenerate(prompt, { 
    type: "flash", 
    fallbackData: `${text}... (AI expansion unavailable)` 
  });
};

export const convertToScript = async (storyContent: string): Promise<ScriptFormat> => {
  const prompt = `Convert this into a YouTube script.

Return ONLY JSON:
{
  "hook": "",
  "intro": "",
  "body": "",
  "outro": ""
}

Story:
${storyContent}`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: {
      hook: "AI unavailable",
      intro: "",
      body: "",
      outro: ""
    }
  });
};

export const generateTitleAndThumbnail = async (contentSummary: string) => {
  const prompt = `Generate titles and thumbnails.

Return JSON:
{
  "storyTitles": [],
  "youtubeTitles": [],
  "thumbnailSuggestions": []
}

Summary:
${contentSummary}`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: {
      storyTitles: [],
      youtubeTitles: [],
      thumbnailSuggestions: []
    }
  });
};

export const conjureIdea = async (ideaPrompt: string, genre: string, tone: string, style: string) => {
  const prompt = `Create a unique story idea based on the user prompt: "${ideaPrompt}". 
Genre Context: ${genre}, Desired Tone: ${tone}, Visual Style: ${style}.

STRICT REQUIREMENTS:
- Output ONLY a valid JSON object.
- NO conversational text, NO markdown formatting, NO explanations.
- The title must be unique and atmospheric.
- The hook must be an inciting incident that pulls the reader in.

REQUIRED JSON FORMAT:
{
  "title": "String",
  "hook": "String (1-2 sentences)"
}
`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: getGenreFallback(genre)
  });
};

export const critiqueIdea = async (title: string, hook: string) => {
  const prompt = `Critique the following story idea.
Title: ${title}
Hook: ${hook}

STRICT REQUIREMENTS:
- Output ONLY a valid JSON object.
- NO markdown, NO conversational text.
- Provide a constructive, professional critique.

REQUIRED JSON FORMAT:
{
  "critique": "A professional analysis of the concept",
  "weaknesses": ["Point 1", "Point 2"]
}
`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: {
      critique: `The concept of "${title}" is solid but could benefit from a more distinct character motivation in the opening hook.`,
      weaknesses: ["Needs more emotional stakes", "Pacing could be tighter"]
    }
  });
};

export const refineIdea = async (
  title: string,
  hook: string,
  critique: string
) => {
  const prompt = `Improve this story idea based on critique.
Original: ${title} - ${hook}
Critique: ${critique}

Return JSON:
{
  "title": "",
  "hook": ""
}
`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: { title, hook }
  });
};

export const expandStory = async (title: string, hook: string) => {
  const prompt = `Expand the following story concept into a detailed narrative synopsis.
Title: ${title}
Hook: ${hook}

STRICT REQUIREMENTS:
- Output ONLY a valid JSON object.
- NO explanations or markdown.
- Cover the beginning, middle, and a potential climax.

REQUIRED JSON FORMAT:
{
  "synopsis": "A detailed 2-3 paragraph synopsis"
}
`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: { synopsis: `In the world of "${title}", the hook of "${hook}" triggers a series of events where the protagonist must confront their past to save the future...` }
  });
};

export const generateOpening = async (
  title: string,
  hook: string,
  synopsis: string
) => {
  const prompt = `Write a cinematic, high-quality opening scene for:
Title: ${title}
Hook: ${hook}

REQUIREMENTS:
- 300–500 words.
- Immerse the reader with sensory details.
- Output ONLY the story prose.
- NO title or headers.

Context: ${synopsis}`;

  return await robustGenerate(prompt, { 
    type: "pro", 
    fallbackData: `The atmosphere was heavy as the events of "${title}" began to unfold. It all started with a simple realization: ${hook}...` 
  });
};

export const generateCoverPrompt = async (
  title: string,
  synopsis: string,
  genre: string
) => {
  const prompt = `You are an elite cinematic cover artist. Your mission is to design a high-fidelity visual concept for a story.

Story Title: ${title}
Story Genre: ${genre}
Full Synopsis: ${synopsis}

STRICT REQUIREMENTS:
- Output ONLY a valid JSON object.
- Focus on mood, lighting, and cinematic composition.
- Avoid generic fantasy/sci-fi tropes; aim for "state-of-the-art" visual concepts.

REQUIRED JSON FORMAT:
{
  "visualPrompt": "A detailed 50-word description for an AI image generator (Midjourney/DALL-E style).",
  "searchQuery": "A short, 5-8 word keyword-rich phrase for image search (focus on visuals).",
  "styleTags": ["tag1", "tag2", "tag3"]
}
`;

  return await robustGenerate(prompt, {
    type: "flash",
    json: true,
    fallbackData: {
      visualPrompt: `A cinematic, atmospheric book cover showing the core elements of ${title} within a ${genre} setting.`,
      searchQuery: `${genre} cinematic atmospheric ${title}`,
      styleTags: ["cinematic", "atmospheric", "high-contrast"]
    }
  });
};

export const generatePlotTwists = async (
  storyContext: string,
  tone: string,
  genre: string
) => {
  const prompt = `You are an elite narrative strategist and plot architect.

Analyze the following story excerpt and generate 3 unique, high-quality plot twists.

Requirements:
- Avoid clichés completely
- Introduce unexpected but logical developments
- Increase tension, stakes, or emotional depth
- Maintain consistency with the story tone and genre

Tone: ${tone}
Genre: ${genre}

Story Context:
${storyContext}

Return ONLY valid JSON:
{
  "twists": [
    "Twist 1",
    "Twist 2",
    "Twist 3"
  ]
}`;

  return await robustGenerate<{ twists: string[] }>(prompt, {
    type: "flash",
    json: true,
    fallbackData: {
      twists: [
        "A hidden truth about a main character is revealed.",
        "An unexpected betrayal changes everything.",
        "A new threat emerges that shifts the stakes."
      ]
    }
  });
};