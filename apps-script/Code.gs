/**
 * Armadillo — form endpoint
 * ---------------------------------------------------------------------------
 * Receives submissions from armadillosafety.ai, writes every one to a Google
 * Sheet, and emails you when someone wants a follow-up.
 *
 * Setup instructions are in README.md, Part 1.
 */

// ── The only two things you need to edit ────────────────────────────────────
var SHEET_ID     = 'PASTE_YOUR_SHEET_ID_HERE';
var NOTIFY_EMAIL = 'armadilloaisafety@gmail.com';
// ───────────────────────────────────────────────────────────────────────────

var TAB_NAME  = 'Signups';
var HEADERS   = ['Timestamp', 'Name', 'Email', 'Organization', 'Request', 'Source'];
var DEDUPE_MS = 5 * 60 * 1000; // ignore an identical repeat inside 5 minutes


/** Run this once from the editor to create the tab and header row. */
function setup() {
  var sheet = getSheet();
  Logger.log('Ready: ' + sheet.getParent().getUrl());
}


function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);

    var data = readBody(e);

    // Honeypot. Real people never see this field, so anything in it is a bot.
    if (String(data.company || '').trim() !== '') {
      return json({ ok: true });
    }

    var name        = clean(data.name, 200);
    var email       = clean(data.email, 200);
    var org         = clean(data.organization, 200);
    var source      = clean(data.source, 60) || 'site';
    var updatesOnly = data.updatesOnly === true || data.updatesOnly === 'true';

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
      return json({ ok: false, error: 'That email address does not look valid.' });
    }

    var sheet = getSheet();

    if (isDuplicate(sheet, email, source)) {
      return json({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      org,
      updatesOnly ? 'Updates only' : 'Wants a follow-up',
      source
    ]);

    if (!updatesOnly) {
      notify(name, email, org, source, sheet);
    }

    return json({ ok: true });

  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}


/** Lets you confirm the deployment is live by opening the URL in a browser. */
function doGet() {
  return json({ ok: true, service: 'armadillo form endpoint' });
}


// ── helpers ────────────────────────────────────────────────────────────────

function readBody(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) { /* fall through */ }
  }
  return (e && e.parameter) || {};
}

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(3, 240);
  }
  return sheet;
}

/**
 * The site retries a submission when the browser cannot read the response, so
 * the same person can legitimately arrive twice within a few seconds.
 */
function isDuplicate(sheet, email, source) {
  var last = sheet.getLastRow();
  if (last < 2) return false;

  var start = Math.max(2, last - 9);
  var rows  = sheet.getRange(start, 1, last - start + 1, HEADERS.length).getValues();
  var now   = Date.now();

  for (var i = 0; i < rows.length; i++) {
    var when = rows[i][0];
    var age  = now - (when instanceof Date ? when.getTime() : 0);
    if (age >= 0 && age < DEDUPE_MS &&
        String(rows[i][2]).toLowerCase() === email.toLowerCase() &&
        String(rows[i][5]) === source) {
      return true;
    }
  }
  return false;
}

function notify(name, email, org, source, sheet) {
  var who  = name || email;
  var body =
    'Someone asked you to follow up.\n\n' +
    'Name:         ' + (name || '(not given)') + '\n' +
    'Email:        ' + email + '\n' +
    'Organization: ' + (org || '(not given)') + '\n' +
    'Came from:    ' + source + '\n\n' +
    'Reply to them at ' + email + '.\n\n' +
    'Full list: ' + sheet.getParent().getUrl();

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Armadillo: follow up with ' + who,
    body: body,
    replyTo: email,
    name: 'Armadillo site'
  });
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
