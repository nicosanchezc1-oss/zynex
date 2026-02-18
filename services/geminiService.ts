import { GoogleGenAI, Type } from "@google/genai";
import { GeminiContentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecommendations = async (query: string): Promise<GeminiContentResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 6 fictional or real movie/show recommendations based on this theme: "${query}". Return the title, a short description, and a genre.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  genre: { type: Type.STRING }
                },
                required: ["title", "description", "genre"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeminiContentResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};