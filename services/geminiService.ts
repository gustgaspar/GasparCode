import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface ImageAttachment {
  mimeType: string;
  data: string; // Base64 string
}

export interface HistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

export const generateWebsiteStream = async (
  prompt: string,
  currentCode: string,
  image: ImageAttachment | null,
  history: HistoryItem[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!apiKey) {
    console.error("API Key is missing");
    onChunk("<!-- Error: API Key is missing. Please check your environment configuration. -->");
    return;
  }

  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `
    You are Gustavo Gaspar, a world-class expert frontend engineer and UI/UX designer known for "Apple-style" aesthetics and clean code.
    
    Your goal is to generate or update a SINGLE, COMPLETE HTML file based on the user's prompt and the conversation history.
    
    Rules:
    1. Return ONLY the raw HTML code. Do not wrap it in markdown blocks (no \`\`\`html).
    2. Include internal CSS within <style> tags. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
    3. Include internal JavaScript within <script> tags if interactivity is needed.
    4. Design Requirements:
       - Modern, minimalist, clean layout.
       - Use plenty of whitespace, rounded corners, and subtle shadows.
       - Ensure full responsiveness (mobile-first).
       - Use generic placeholder images from https://picsum.photos if needed.
    5. If an image is provided by the user, analyze it and replicate its layout, color scheme, and vibe as closely as possible in the generated HTML.
    6. ALWAYS return the FULL HTML file, not just snippets. The user needs to see the complete result.
  `;

  try {
    const parts: any[] = [];

    // 1. Add context about current code if it exists
    if (currentCode) {
      parts.push({ 
        text: `Here is the current state of the HTML code you are working on. Use this as a base for any updates requested:\n\n${currentCode}\n\n` 
      });
    }

    // 2. Add history context (summarized to avoid massive token usage if necessary, but sending full text here)
    if (history.length > 0) {
      const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Gustavo'}: ${h.text}`).join('\n');
      parts.push({
        text: `Conversation History:\n${historyText}\n\n`
      });
    }

    // 3. Add the current prompt
    parts.push({ text: `Current Request: ${prompt}` });

    // 4. Add Image if present
    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: [
        { role: 'user', parts: parts }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    onChunk(`\n<!-- Error generating content: ${error instanceof Error ? error.message : String(error)} -->`);
  }
};