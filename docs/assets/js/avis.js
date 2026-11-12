// Page "Avis" : envoie les avis vers le Google Sheet du site et affiche les avis validés.
// Adresse du script Google (voir apps-script/avis.gs) :
const AVIS_URL = 'https://script.google.com/macros/s/AKfycbwKR41B49JWGMjLXd4-8qUVyTszJ-JahV-q43D12wVHggWNmdbv2Mh7xtfwWiBcKMy1/exec';

const form = document.getElementById('avis-form');
const noteMsg = document.getElementById('avis-note');
const liste = document.getElementById('avis-liste');
const resume = document.getElementById('avis-resume');

const etoiles = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent : jamais de HTML injecté
  return node;
}

function afficherAvis(avis) {
  liste.replaceChildren();
  if (!avis.length) {
    liste.append(el('p', 'form-note', "Aucun avis pour le moment. Soyez le premier à donner le vôtre !"));
    resume.textContent = '';
    return;
  }
  const moyenne = avis.reduce((s, a) => s + a.note, 0) / avis.length;
  resume.textContent =
    `${moyenne.toFixed(1).replace('.', ',')}/5 · ${avis.length} avis`;

  for (const a of avis) {
    const carte = el('article', 'avis-carte');
    const tete = el('p', 'avis-tete');
    const stars = el('span', 'avis-etoiles', etoiles(a.note));
    stars.setAttribute('aria-label', `${a.note} sur 5`);
    tete.append(stars, el('strong', 'avis-nom', ' ' + a.nom));
    carte.append(tete);

    const infos = [];
    if (a.travaux) infos.push(a.travaux);
    const date = new Date(a.date);
    if (!isNaN(date)) infos.push(date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
    if (infos.length) carte.append(el('p', 'avis-infos', infos.join(' · ')));

    carte.append(el('p', 'avis-texte', a.commentaire));
    liste.append(carte);
  }
}

async function chargerAvis() {
  if (!liste) return;
  try {
    const res = await fetch(AVIS_URL);
    const data = await res.json();
    afficherAvis(Array.isArray(data.avis) ? data.avis : []);
  } catch (err) {
    liste.replaceChildren(el('p', 'form-note', 'Les avis ne peuvent pas être affichés pour le moment.'));
  }
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const bouton = form.querySelector('button[type="submit"]');
  const data = new FormData(form);
  const payload = {
    note: data.get('note'),
    nom: data.get('nom'),
    travaux: data.get('travaux'),
    commentaire: String(data.get('commentaire')).trim(),
    site: data.get('site') // champ piège anti-robots
  };

  bouton.disabled = true;
  noteMsg.textContent = 'Envoi en cours…';
  try {
    // text/plain évite la requête préalable CORS, que Google Apps Script ne gère pas
    const res = await fetch(AVIS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const reponse = await res.json();
    if (!reponse.ok) throw new Error(reponse.error || 'erreur');
    form.reset();
    noteMsg.textContent =
      'Merci ! Votre avis a bien été envoyé. Il sera affiché sur cette page après validation.';
  } catch (err) {
    noteMsg.textContent =
      "Votre avis n'a pas pu être envoyé. Merci de réessayer, ou de me contacter par téléphone ou par e-mail.";
  } finally {
    bouton.disabled = false;
  }
});

chargerAvis();
