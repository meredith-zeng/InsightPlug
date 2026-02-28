import { UserProfile } from '../types';

type ExpertMetrics = {
  interval?: number;
  monthlySurplus?: number;
  dailyAssetUtilization?: number;
};

// Read from .env.local or .env
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

// Debug: Log API key status (only first 10 chars for security)
console.log('[OpenAI] API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('[OpenAI] Model:', MODEL);

export const buildOpenAIReply = async (
  profile: UserProfile,
  metrics: ExpertMetrics,
  input: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY not configured');
  }

  const systemPrompt = `You are an expert on EV economics grounded in behavioral economics and Becker's Household Production Theory.

**THEORETICAL FRAMEWORK (from research paper):**

The Money dimension addresses the budget constraint by analyzing both the flow of liquidity and the utilization of capital. InsightPlug decomposes Total Cost of Ownership (TCO) into two psychologically actionable signals:

1. **Monthly Surplus** - Counteracts temporal discounting by reframing long-term savings as immediate disposable income. By translating abstract lifetime gains into tangible monthly liquidity (e.g., $40/month vs. $5,000/10-years), the system makes the economic benefit psychologically present.

2. **Daily Asset Utilization (DAU)** - Captures the allocative efficiency of capital by visualizing the share of battery capacity actually consumed by a user's daily mobility needs (e.g., "11% utilized"). Persistently low utilization indicates an inefficient allocation of monetary resources, where additional capital investment yields negligible marginal benefit.

**USER CONTEXT:**
- Region: ${profile.region.name}, ${profile.region.state}
- Vehicle: ${profile.ev.model} (${profile.ev.epaRange} mi EPA range)
- Daily driving: ${profile.dailyMiles} miles
- Home charging: ${Math.round(profile.homeChargingRatio * 100)}%
- Gas vehicle benchmark: ${profile.ev.iceBenchmark?.model || 'Comparable ICE'} (${profile.iceMpg} MPG)

**ECONOMIC SIGNALS (calculated for this user):**
- Monthly Surplus: $${metrics.monthlySurplus}/month (immediate disposable income gain)
- Daily Asset Utilization: ${metrics.dailyAssetUtilization?.toFixed(1)}% (capital efficiency metric)
- Charging Interval: Every ${metrics.interval} days (time cost reduction)

**YOUR ROLE:**
1. Explain trade-offs through Money and Time dimensions (Becker's framework)
2. Address behavioral biases: temporal discounting, loss aversion, range anxiety
3. Ground explanations in the user's specific context and calculated signals
4. Keep responses concise (2-3 sentences) and actionable
5. DO NOT discuss tax credits (excluded from analysis)
6. Frame as educational analysis, not financial advice`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    const errorMessage = error.error?.message || 'API request failed';

    // Provide helpful error messages
    if (response.status === 401) {
      throw new Error(
        `OpenAI API Authentication Failed (401): ${errorMessage}\n\n` +
        `Your API key may be invalid or lack permissions. Please:\n` +
        `1. Visit https://platform.openai.com/api-keys\n` +
        `2. Create a new API key with "model.request" permission\n` +
        `3. Update VITE_OPENAI_API_KEY in .env.local\n` +
        `4. Restart the dev server`
      );
    } else if (response.status === 429) {
      throw new Error(`OpenAI API Rate Limit (429): Too many requests. Please wait and try again.`);
    } else if (response.status === 500 || response.status === 503) {
      throw new Error(`OpenAI API Server Error (${response.status}): Service temporarily unavailable.`);
    }

    throw new Error(`OpenAI API Error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response';
};

export const isOpenAIConfigured = (): boolean => !!API_KEY;
