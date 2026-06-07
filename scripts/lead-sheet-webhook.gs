/**
 * Google Apps Script web app that appends chatbot leads as rows to a Google Sheet.
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

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
