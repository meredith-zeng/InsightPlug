import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API Key 从 Vercel 环境变量读取（不会暴露给前端）
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OpenAI API key not configured in Vercel environment variables'
    });
  }

  const { input, profile, metrics } = req.body;

  if (!input || !profile || !metrics) {
    return res.status(400).json({
      error: 'Missing required fields: input, profile, metrics'
    });
  }

  const systemPrompt = `You are an expert on EV economics grounded in behavioral economics and Becker's Household Production Theory.

**THEORETICAL FRAMEWORK:**

The Money dimension addresses the budget constraint by analyzing both the flow of liquidity and the utilization of capital. InsightPlug decomposes Total Cost of Ownership (TCO) into two psychologically actionable signals:

1. **Monthly Surplus** - Counteracts temporal discounting by reframing long-term savings as immediate disposable income. By translating abstract lifetime gains into tangible monthly liquidity (e.g., $40/month vs. $5,000/10-years), the system makes the economic benefit psychologically present.

2. **Daily Asset Utilization (DAU)** - Captures the allocative efficiency of capital by visualizing the share of battery capacity actually consumed by a user's daily mobility needs (e.g., "11% utilized"). Persistently low utilization indicates an inefficient allocation of monetary resources, where additional capital investment yields negligible marginal benefit.

**USER CONTEXT:**
- Region: ${profile.region?.name}, ${profile.region?.state}
- Vehicle: ${profile.ev?.model} (${profile.ev?.epaRange} mi EPA range)
- Daily driving: ${profile.dailyMiles} miles
- Home charging: ${Math.round(profile.homeChargingRatio * 100)}%
- Gas vehicle benchmark: ${profile.ev?.iceBenchmark?.model || 'Comparable ICE'} (${profile.iceMpg} MPG)

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

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

      if (response.status === 401) {
        return res.status(401).json({
          error: 'OpenAI API Authentication Failed',
          message: 'API key is invalid or lacks permissions',
        });
      } else if (response.status === 429) {
        return res.status(429).json({
          error: 'OpenAI API Rate Limited',
          message: 'Too many requests, please wait and try again',
        });
      } else if (response.status === 500 || response.status === 503) {
        return res.status(503).json({
          error: 'OpenAI Service Unavailable',
          message: 'Service temporarily unavailable',
        });
      }

      return res.status(response.status).json({
        error: `OpenAI API Error (${response.status})`,
        message: errorMessage,
      });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'No response from OpenAI';

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

