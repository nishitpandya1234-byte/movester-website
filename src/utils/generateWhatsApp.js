// ─────────────────────────────────────────────
// WHATSAPP MESSAGE BUILDER
// Builds a prefilled WhatsApp message from an estimate so the client can
// send it straight to the Movester team to confirm availability.
// ─────────────────────────────────────────────

export function generateWhatsAppMessage({ name, moveType, fromCity, toCity,
  moveDate, stairsPickup, stairsDropoff, quote }) {

  const typeLabel = {
    student: 'Student move',
    oneBR: '1 Bedroom',
    twoBR: '2 Bedroom',
    threeBR: '3 Bedroom',
    office: 'Office'
  }[moveType] || moveType;

  const stairNote = [
    stairsPickup && 'stairs at pickup',
    stairsDropoff && 'stairs at drop-off'
  ].filter(Boolean).join(' + ');

  return `Hi Movester! I got an instant estimate from your website.

Name: ${name || 'Not provided'}
Move type: ${typeLabel}
From: ${fromCity || 'Not provided'}
To: ${toCity || 'Not provided'}
Date: ${moveDate || 'Not provided'}
${stairNote ? `Stairs: ${stairNote}` : ''}

My estimate: $${quote.totalMin}–$${quote.totalMax} (incl. HST)

Can you confirm availability and final quote?`;
}

// Real Movester WhatsApp number (same one the lead chatbot routes to).
export const WHATSAPP_NUMBER = '14372692714';
