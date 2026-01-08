
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AISummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const startChatSession = (profile: UserProfile) => {
  const priceGap = profile.evPrice - profile.icePrice - profile.taxIncentive;
  
  const systemInstruction = `
    You are an EV Life Consultant specializing in Geographic Grounding and Economic Behavioral Science.
    
    Current Capabilities: You have access to Google Maps grounding tools to find real charging infrastructure and facilities in ${profile.region.name} (${profile.region.state}).
    
    Communication Strategy:
    1. **Geographic Grounding**: If the user is concerned about charging, use your tools to identify and describe real public charging clusters in their specific area.
    2. **Behavioral De-biasing**: Address the "Economic Mirage" by shifting the focus from the initial sticker price to the "Prepaid Discounted Energy" logic of EVs.
    3. **Contextual Relevance**: Use the fact that the user drives ${profile.dailyMiles} miles daily in ${profile.region.name} to ground your financial advice.
    4. **Charging Access**: They have ${profile.homeChargingRatio * 100}% home charging access. Emphasize how this makes charging an "invisible utility" rather than a chore.
    
    Tone: Authoritative, localized, reassuring, and data-driven.
  `;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { 
      systemInstruction,
      tools: [{ googleMaps: {} }]
    }
  });
};

export const startResearchChat = startChatSession;

export const getGeminiSummary = async (profile: UserProfile): Promise<AISummary> => {
  const priceGap = profile.evPrice - profile.icePrice - profile.taxIncentive;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User is in ${profile.region.name}. They perceive an upfront cost premium of $${priceGap} and are concerned about charging infrastructure. Using map data, explain why this investment is empirically sound for their specific location and driving habits (${profile.dailyMiles} miles/day).`,
    config: {
      tools: [{ googleMaps: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalSavings: { type: Type.NUMBER },
          breakEvenYear: { type: Type.NUMBER },
          keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ["totalSavings", "breakEvenYear", "keyInsights", "recommendation"]
      }
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text);
};
