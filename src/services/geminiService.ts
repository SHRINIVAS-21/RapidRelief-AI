import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeIncidentVideo(base64Video: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Video,
          },
        },
        {
          text: `Evaluate this emergency video. Identify the type of incident (fire, flood, accident, medical, or other). 
          Provide a severity score from 0-100 and a brief description of what is happening.
          Return the result in JSON format.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['fire', 'flood', 'accident', 'medical', 'other'] },
            confidenceScore: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ['type', 'confidenceScore', 'description'],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
