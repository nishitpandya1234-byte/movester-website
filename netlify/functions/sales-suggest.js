/**
 * Netlify serverless function powering the Sales Reply Helper (/team/sales-helper).
 *
 * Takes what a customer said (plus optional quick context like move size/route/quote)
 * and returns a suggested WhatsApp reply in Movester's voice, drawing on the
 * objection-handling playbook below.
 *
 * Requires the ANTHROPIC_API_KEY environment variable to be set in
 * Netlify: Site settings -> Environment variables. Never commit a real key
 * to this repo — for local testing with `netlify dev`, put it in a .env file
 * (already gitignored).
 */

import Anthropic from '@anthropic-ai/sdk'

const PLAYBOOK = `You are helping Yauvan, the owner of Movester — a moving company — write a reply to a customer on WhatsApp. The customer has just said something that needs a thoughtful response (an objection, a question, or hesitation about booking).

Write ONE suggested reply for Yauvan to send, written as if Yauvan himself is typing it: warm, direct, and human — never corporate or "AI-sounding." Keep it WhatsApp-length (2-4 short sentences). Use the optional context provided (move size, route, quoted price, etc.) when it's relevant. Where it fits naturally, end with a soft next step or question that moves toward booking — but don't be pushy.

Use these guidelines for common situations:

- PRICE PUSHBACK (e.g. "another company quoted me less"): Acknowledge their concern without getting defensive. Briefly explain what's included in Movester's price (insured, trained crew, no hidden fees/surprise charges) so the comparison feels fairer. Where it makes sense, offer a small concrete win (e.g. a modest discount for booking soon) rather than just dropping the price.

- TRUST / SAFETY CONCERNS (e.g. "will my stuff be damaged?", "are you legit?"): Reassure with specifics, not platitudes — mention insurance coverage, trained/vetted movers, and a clear process. Make it feel like they're in safe hands.

- COMPETITOR COMPARISONS: Don't trash-talk competitors. Reframe the conversation around value and peace of mind rather than just the number on the quote.

- URGENCY / LAST-MINUTE DATES: Be reassuring about flexibility ("we can usually make that work"), and create gentle urgency to confirm the date so they don't lose the slot.

- GENERAL HESITATION OR GOING QUIET: Keep it warm and low-pressure — a light check-in that re-opens the conversation without sounding like a sales push.

Respond with ONLY the suggested reply text — no preamble, no explanation, no quotation marks around it.`

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const customerMessage = (payload.customerMessage || '').trim()
  const context = (payload.context || '').trim()

  if (!customerMessage) {
    return { statusCode: 400, body: JSON.stringify({ error: 'customerMessage is required' }) }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is not configured (missing API key)' }) }
  }

  const userPrompt = [
    `Customer said: "${customerMessage}"`,
    context ? `Quick context: ${context}` : null,
  ].filter(Boolean).join('\n')

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: PLAYBOOK,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const reply = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    }
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to get a suggestion from the AI' }) }
  }
}
