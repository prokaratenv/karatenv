import Anthropic from '@anthropic-ai/sdk';
import { STRATEGIST_PROMPT } from '../analysis/brief';

/**
 * Optional: turn the analysis brief into a written strategy with Claude.
 * Runs in the browser with the user's own API key (stored only on this device).
 */
export async function generateStrategy(apiKey: string, brief: string, onText: (t: string) => void): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const stream = client.beta.messages.stream({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'high' },
    system: STRATEGIST_PROMPT,
    messages: [{ role: 'user', content: brief }],
  });
  let text = '';
  stream.on('text', (delta) => {
    text += delta;
    onText(text);
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new Error('Claude declined this request.');
  return text;
}

export function describeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'That API key was rejected. Check it in Settings.';
  if (e instanceof Anthropic.RateLimitError) return 'Rate limited. Wait a minute and try again.';
  if (e instanceof Anthropic.APIError) return `Claude API error ${e.status ?? ''}: ${e.message}`;
  return e instanceof Error ? e.message : String(e);
}
