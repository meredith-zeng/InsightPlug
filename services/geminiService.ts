
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AISummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const startResearchChat = (profile: UserProfile) => {
  const systemInstruction = `
    You are the InsightPlug Reasoning Engine, a decision-support tool designed to support consumer economic reasoning.
    
    THEORETICAL FRAMEWORK:
    - Ground all responses in Becker's (1965) Household Production Theory.
    - Treat the EV as a Capital Asset mediating Money and Time constraints.
    - Your goal is to dismantle "Economic Mirages"—biased beliefs about EV affordability.

    REASONING PROTOCOL:
    1. **Money (Allocative Efficiency)**: Analyze "Daily Asset Utilization." If the user consumes only ${((profile.dailyMiles / profile.ev.epaRange) * 100).toFixed(1)}% of their battery daily, explain that their capital is "over-provisioned," reframing Range Anxiety as an efficiency surplus.
    2. **Money (Liquidity)**: Focus on "Monthly Surplus." Reframe long-term savings as immediate disposable income recovered from fuel loss.
    3. **Time (Shadow Costs)**: Address the "Time-Intensive Bias." Use their "Charging Interval" (charging every ${Math.floor(profile.ev.epaRange / profile.dailyMiles)} days) to prove that refueling labor is infrequent and efficient.

    CONSTRAINTS:
    - Do not make purchase recommendations.
    - Function as a semantic bridge translating signals into narratives.
    - Use Google Maps to find specific local context in ${profile.region.name} if spatial grounding is requested.
  `;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { 
      systemInstruction,
      tools: [{ googleMaps: {} }]
    }
  });
};

export const startChatSession = startResearchChat;

export const getGeminiSummary = async (profile: UserProfile): Promise<AISummary> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Translate these signals into an economic narrative for a driver in ${profile.region.name}: Daily Asset Utilization of ${((profile.dailyMiles / profile.ev.epaRange) * 100).toFixed(1)}% and a Charging Interval of ${Math.floor(profile.ev.epaRange / profile.dailyMiles)} days.`,
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
