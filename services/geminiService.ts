
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AISummary } from "../types";

// Always use named parameter for GoogleGenAI initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Renamed and exported to satisfy both SimulationLab and ChatAssistant
export const startChatSession = (profile: UserProfile) => {
  const annualMiles = profile.annualMileage || (profile.region.dailyMiles * 365);
  const systemInstruction = `
    You are the InsightPlug EV Economic Expert.
    User Research Context:
    - Region: ${profile.region.name}, ${profile.region.state}
    - Local Electricity Rate: $${profile.electricRate || '0.15'}/kWh
    - Daily Miles per Capita (from local census): ${profile.region.dailyMiles} miles/day
    - Vehicle Selected: ${profile.ev.make} ${profile.ev.model} (${profile.ev.batteryCapacity}kWh Battery)
    - Charging Habits: ${Math.round(profile.homeChargingRatio * 100)}% at home, ${Math.round((1 - profile.homeChargingRatio) * 100)}% public.
    
    Guidelines:
    1. Debunk myths about "Expensive EV Charging" using their local data.
    2. Explain Total Cost of Ownership (TCO) clearly.
    3. If they mention environmental factors, link them back to economic energy literacy.
    4. Keep answers concise, evidence-based, and academic yet accessible.
    5. Always reference the ${annualMiles.toLocaleString()} miles they drive annually.
  `;
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
};

// Alias for SimulationLab
export const startResearchChat = startChatSession;

// Added missing getGeminiSummary for AnalysisDashboard
export const getGeminiSummary = async (profile: UserProfile): Promise<AISummary> => {
  const annualMiles = profile.annualMileage || (profile.region.dailyMiles * 365);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following EV transition:
      Vehicle: ${profile.ev.make} ${profile.ev.model}
      ICE Vehicle Price: $${profile.icePrice}
      EV Vehicle Price: $${profile.evPrice} (Incentive: $${profile.taxIncentive})
      Annual Miles: ${annualMiles}
      Gas Price: $${profile.gasPrice}/gal, MPG: ${profile.iceMpg}
      Electricity Rate: $${profile.electricRate}/kWh
      Ownership Period: ${profile.ownershipYears} years`,
    config: {
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

  // Access .text property directly
  const text = response.text || '{}';
  return JSON.parse(text);
};
