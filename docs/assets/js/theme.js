// Thème : ?theme=… dans l'URL, sinon le dernier choisi, sinon celui par défaut.
// Chargé sans defer dans le <head>, pour appliquer le thème avant l'affichage de la page.
// Le style de chaque thème est dans assets/css/themes.css, le sélecteur est créé par assets/js/site.js.
const THEME_GROUPS = [
  ['Couleurs du site', { atelier: 'Atelier', 'boite-a-outils': 'Boîte à outils', nuit: 'Nuit (menu latéral)', ardoise: 'Ardoise (magazine)', bauhaus: 'Bauhaus' }],
  ['Autres couleurs', { jardin: 'Jardin', garage: 'Garage', 'bleu-de-travail': 'Bleu de travail' }],
  ['Différents', { 'bande-dessinee': 'Bande dessinée', neon: 'Néon' }],
];
const THEMES = Object.assign({}, ...THEME_GROUPS.map(([, themes]) => themes));

// Un thème inconnu, ou ?theme=defaut, donne le thème par défaut
const setTheme = (theme) => {
  theme = Object.hasOwn(THEMES, theme) ? theme : '';
  if (theme) {
    document.documentElement.dataset.theme = theme;
  } else {
    delete document.documentElement.dataset.theme;
  }
  // Le stockage peut être bloqué (navigation privée, cookies refusés) : le thème vaut alors pour cette page
  try {
    if (theme) localStorage.setItem('theme', theme); else localStorage.removeItem('theme');
  } catch {}
  return theme;
};

{
  const fromUrl = new URLSearchParams(location.search).get('theme');
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch {}
  setTheme(fromUrl ?? stored);
}
