/**
 * Google Apps Script web app for customer FEEDBACK / REVIEWS.
 * Separate from the lead webhook (scripts/lead-sheet-webhook.gs) so the two
 * never interfere — deploy this as its own web app with its own URL.
 *
 *  - doPost: a customer's review comes in from the website form -> appended as a row
 *            (and the team is emailed). Fire-and-forget from the browser (no-cors).
 *  - doGet:  the website fetches all reviews on page load via JSONP (?callback=fn),
 *            so every visitor sees everyone's reviews.
 *
 * Setup:
 * 1. Create a new Google Sheet (e.g. "Movester Reviews"). Add a header row:
 *      submittedAt | name | rating | message | source
 * 2. Extensions > Apps Script, delete the boilerplate, paste this file.
 * 3. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy the deployment URL into FEEDBACK_SHEET_WEBHOOK_URL at the top of
 *      src/components/ui/Reviews.jsx
 *
 * NOTE (no moderation): every submitted review is appended and shown publicly.
 * To remove a bad one, delete its row in the Sheet — it disappears on next load.
 * To add moderation later: add an "approved" column and filter for it in doGet().
 */

const NOTIFY_EMAIL = 'movester.ca@outlook.com'

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const review = JSON.parse(e.postData.contents)

  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5))

  sheet.appendRow([
    review.submittedAt || new Date().toISOString(),
    review.name || 'Anonymous',
    rating,
    review.message || '',
    review.source || 'website-reviews',
  ])

  notifyNewReview(review, rating)

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const values = sheet.getDataRange().getValues()
  // values[0] is the header row; skip it.
  const reviews = values.slice(1)
    .filter(row => row[3]) // must have a message
    .map(row => ({
      submittedAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      name: row[1],
      rating: Number(row[2]) || 5,
      message: row[3],
    }))

  const callback = e && e.parameter && e.parameter.callback
  const json = JSON.stringify(reviews)

  if (callback) {
    // JSONP — lets the browser read this cross-origin without CORS headers.
    return ContentService
      .createTextOutput(`${callback}(${json})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON)
}

function notifyNewReview(review, rating) {
  const body = [
    `New review submitted on the Movester website:`,
    ``,
    `Name: ${review.name || 'Anonymous'}`,
    `Rating: ${rating} / 5`,
    ``,
    `${review.message || '(no message)'}`,
    ``,
    `This is now live on the website's Reviews section.`,
    `To remove it, delete its row in the Reviews sheet.`,
  ].join('\n')

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New Movester review: ${rating}★ from ${review.name || 'Anonymous'}`,
    body: body,
  })
}
