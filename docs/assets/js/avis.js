// Page "Avis" : prépare un e-mail déjà rédigé à partir du formulaire
const form = document.getElementById('avis-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const note = data.get('note');
  const lignes = [
    `Note : ${note}/5`,
    `Prénom : ${data.get('nom')}`,
    data.get('travaux') ? `Type de travaux : ${data.get('travaux')}` : null,
    '',
    String(data.get('commentaire')).trim()
  ].filter((l) => l !== null);
  const sujet = `Avis client - ${note}/5`;
  window.location.href =
    'mailto:ReparemoiSTP@gmail.com?subject=' + encodeURIComponent(sujet) +
    '&body=' + encodeURIComponent(lignes.join('\n'));
});
