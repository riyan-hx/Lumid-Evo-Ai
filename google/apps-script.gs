/**
 * Evo early access → Google Sheet (+ optional confirmation email).
 *
 * Setup: Sheet → Extensions → Apps Script → paste this → set SECRET below →
 * Deploy → New deployment → type "Web app" → Execute as: Me, Who has access: Anyone → copy the /exec URL.
 * Put that URL in GOOGLE_SHEET_WEBHOOK_URL and the same secret in GOOGLE_SHEET_SECRET.
 */
var SECRET = "change-me";
var SEND_CONFIRM_EMAIL = false; // true: this script also emails the confirm link (uses your Google account quota)
var SHEET_NAME = "Registrations";
var HEADERS = ["Registered at", "Email", "Spot", "Code", "Status", "Confirmed at", "Line picked", "Referred by", "Source", "Campaign"];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

function doPost(e) {
  var out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
  var lock = LockService.getScriptLock();
  try {
    var b = JSON.parse(e.postData.contents);
    if (b.secret !== SECRET) return out({ ok: false, error: "forbidden" });
    lock.waitLock(10000);
    var sh = sheet_();
    var emails = sh.getRange(2, 2, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(function (r) { return String(r[0]).toLowerCase(); });
    var idx = emails.indexOf(String(b.email).toLowerCase());
    if (b.action === "signup") {
      if (idx === -1) {
        sh.appendRow([new Date(), b.email, b.spot, b.code, "pending", "", b.excuse_id || "", b.ref || "", b.utm_source || "", b.utm_campaign || ""]);
      }
      if (SEND_CONFIRM_EMAIL && b.confirm_url) {
        MailApp.sendEmail({
          to: b.email,
          subject: "Confirm your spot on the Evo early-access list",
          htmlBody: "<p>You’re almost in.</p><p><a href=\"" + b.confirm_url + "\">Confirm your email</a> to lock in spot #" + b.spot + ".</p><p style=\"color:#6b7571\">Evo is a support tool, not therapy or a diagnosis.</p>"
        });
      }
    } else if (b.action === "confirm" && idx !== -1) {
      sh.getRange(idx + 2, 5, 1, 2).setValues([["confirmed", new Date()]]);
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
