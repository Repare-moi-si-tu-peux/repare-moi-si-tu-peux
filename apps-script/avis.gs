/**
 * Répare moi si tu peux — enregistrement et lecture des avis clients.
 *
 * Ce script s'installe dans un Google Sheet (menu Extensions > Apps Script).
 * - doPost : reçoit un avis depuis le formulaire du site et l'ajoute au tableau
 *            (non publié tant que la case « Publié » n'est pas cochée).
 * - doGet  : renvoie au site uniquement les avis dont la case « Publié » est cochée.
 */

const NOTIFY_EMAIL = 'ReparemoiSTP@gmail.com'; // reçoit un mail à chaque nouvel avis à valider
const SHEET_NAME = 'Avis';
const HEADERS = ['Date', 'Note', 'Prénom', 'Travaux', 'Commentaire', 'Publié'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Nettoie un texte : coupe la longueur et neutralise les formules de tableur (=, +, -, @).
function clean_(value, max) {
  let s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doGet() {
  const sh = getSheet_();
  const rows = sh.getDataRange().getValues().slice(1);
  const avis = rows
    .filter(function (r) { return r[5] === true || String(r[5]).trim().toLowerCase() === 'oui'; })
    .map(function (r) {
      return {
        date: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        note: Number(r[1]),
        nom: String(r[2]),
        travaux: String(r[3]),
        commentaire: String(r[4])
      };
    })
    .reverse(); // les plus récents d'abord
  return json_({ avis: avis });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);

    // Champ piège invisible : seuls les robots le remplissent.
    if (d.site) return json_({ ok: true });

    const note = Math.round(Number(d.note));
    const nom = clean_(d.nom, 60);
    const travaux = clean_(d.travaux, 80);
    const commentaire = clean_(d.commentaire, 1500);
    if (!(note >= 1 && note <= 5) || !nom || !commentaire) {
      return json_({ ok: false, error: 'invalid' });
    }

    const sh = getSheet_();
    sh.appendRow([new Date(), note, nom, travaux, commentaire, false]);
    sh.getRange(sh.getLastRow(), 6).insertCheckboxes();

    try {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'Nouvel avis client à valider (' + note + '/5)',
        nom + ' a laissé un avis :\n\n' + commentaire +
        '\n\nPour le publier, cochez la case « Publié » dans le tableau :\n' +
        SpreadsheetApp.getActiveSpreadsheet().getUrl()
      );
    } catch (mailErr) {
      // Le mail est facultatif : l'avis est déjà enregistré.
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
