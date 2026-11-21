/**
 * Brain Dojo → Google Sheet: saves each parent sign-up as a new row.
 *
 * Setup (about 5 minutes):
 *  1. Create a Google Sheet named "Brain Dojo sign-ups".
 *  2. Extensions → Apps Script. Delete what's there and paste this whole file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.   → Deploy, and allow access.
 *  4. Copy the Web app URL (ends in /exec) into js/config.js as leadEndpoint.
 * New sign-ups appear in the sheet. Your CRM or Zapier can watch the sheet
 * to add each parent to your newsletter or lead campaign.
 */
var FIELDS = ["date", "name", "email", "phone", "member", "newsletter", "offers", "childGrades", "consent", "source"];

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = String(p.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) || String(p.source) !== "Brain Dojo") return out("ignored");
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(FIELDS);
    // Text only, and never a formula (protects the sheet from =HYPERLINK tricks).
    sheet.appendRow(FIELDS.map(function (f) {
      var v = String(p[f] == null ? "" : p[f]).slice(0, 300);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    }));
  } finally { lock.releaseLock(); }
  return out("ok");
}
function out(s) { return ContentService.createTextOutput(s); }
