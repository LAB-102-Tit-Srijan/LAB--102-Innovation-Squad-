import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async generateItinerary(destination: string, budget: { min: number, max: number }, category: string, days: number) {
    const prompt = `Create a detailed day-by-day travel itinerary for a ${days}-day trip to ${destination}. 
    The traveler category is "${category}" and the total trip budget starts from ₹${budget.min} to ₹${budget.max}. 
    Include activities, food recommendations, and budget tips.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    food: { type: Type.ARRAY, items: { type: Type.STRING } },
                    budgetTip: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
};
