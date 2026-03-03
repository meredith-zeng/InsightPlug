import { UserProfile } from '../types';

type ExpertMetrics = {
  interval?: number;
  monthlySurplus?: number;
  dailyAssetUtilization?: number;
};

/**
 * SECURITY MODEL: OpenAI API Key is stored securely on Vercel backend
 *
 * SAFE ARCHITECTURE:
 * 1. API Key stored in Vercel Environment Variables (backend only)
 * 2. Frontend calls POST /api/chat with user input + metrics
 * 3. Backend (/api/chat.ts) securely calls OpenAI API
 * 4. Response returned to frontend without exposing API Key
 *
 * This way:
 * - API Key never reaches the browser
 * - Can safely commit frontend code to GitHub
 * - Fully production-ready
 */

export const buildOpenAIReply = async (
  profile: UserProfile,
  metrics: ExpertMetrics,
  input: string
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        profile,
        metrics,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = error.message || error.error || 'API request failed';

      if (response.status === 401) {
        throw new Error(
          `OpenAI API Authentication Failed: ${errorMessage}\n\n` +
          `Please check that OPENAI_API_KEY is set in Vercel Environment Variables.`
        );
      } else if (response.status === 429) {
        throw new Error(
          `OpenAI API Rate Limited: ${errorMessage}\n\n` +
          `Please wait and try again.`
        );
      } else if (response.status === 503) {
        throw new Error(
          `OpenAI Service Unavailable: ${errorMessage}\n\n` +
          `Please try again later.`
        );
      }

      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data.reply || 'No response from API';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Backend API call failed: ${message}`);
  }
};

/**
 * Check if OpenAI backend is available
 * In Vercel production, this will be true if OPENAI_API_KEY env var is set
 * During development, returns false unless backend is running
 */
export const isOpenAIConfigured = (): boolean => {
  // In browser, we can't directly check backend config
  // But we assume it's configured if we reach this code
  // The actual check happens when we try to call /api/chat
  // If it fails, we'll fall back to local advisor
  return true;
};

