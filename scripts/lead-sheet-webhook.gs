/**
 * Google Apps Script web app that appends chatbot leads as rows to a Google Sheet
 * and instantly emails the team so they can respond while the lead is still warm.
 *
 * Setup:
 * 1. Create a new Google Sheet (e.g. "Movester Leads"). Add a header row:
 *    submittedAt | name | phone | size | from | to | date | budget | source
 * 2. In the Sheet, go to Extensions > Apps Script, delete the boilerplate,
 *    and paste this file's contents.
 * 3. Click Deploy > New deployment > select type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL and paste it into LEAD_SHEET_WEBHOOK_URL
 *    in src/components/ui/LeadChatbot.jsx
 */

const NOTIFY_EMAIL = 'movester.ca@outlook.com'

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const lead = JSON.parse(e.postData.contents)

  sheet.appendRow([
    lead.submittedAt || new Date().toISOString(),
    lead.name || '',
    lead.phone || '',
    lead.size || '',
    lead.from || '',
    lead.to || '',
    lead.date || '',
    lead.budget || '',
    lead.source || '',
  ])

  notifyNewLead(lead)

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}

function notifyNewLead(lead) {
  const waNumber = (lead.phone || '').replace(/[^\d+]/g, '')
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/^\+/, '')}` : ''

  const body = [
    `New lead just came in from the Movester website chatbot:`,
    ``,
    `Name: ${lead.name || '—'}`,
    `Phone: ${lead.phone || '—'}`,
    `Move size: ${lead.size || '—'}`,
    `From: ${lead.from || '—'}`,
    `To: ${lead.to || '—'}`,
    `Date: ${lead.date || '—'}`,
    `Budget: ${lead.budget || '—'}`,
    `Source: ${lead.source || '—'}`,
    ``,
    waLink ? `WhatsApp them now: ${waLink}` : `(No usable phone number to message.)`,
    ``,
    `Reply fast — leads convert far better when contacted within minutes.`,
  ].join('\n')

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New Movester lead: ${lead.name || 'Unknown'} (${lead.from || '?'} → ${lead.to || '?'})`,
    body: body,
  })
}
