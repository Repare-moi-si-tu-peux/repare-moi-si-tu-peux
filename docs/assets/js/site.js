// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Sélecteur de thème (voir assets/js/theme.js), qui met aussi le thème choisi dans l'URL pour pouvoir la partager
const footer = document.querySelector('.site-footer .wrap');
if (footer) {
  const picker = document.createElement('p');
  picker.className = 'theme-picker';
  picker.innerHTML = '<label for="theme">Thème</label><select id="theme"><option value="">Par défaut</option></select>';
  const select = picker.querySelector('select');
  THEME_GROUPS.forEach(([label, themes]) => {
    const group = document.createElement('optgroup');
    group.label = label;
    Object.entries(themes).forEach(([value, name]) => group.append(new Option(name, value)));
    select.append(group);
  });
  select.value = document.documentElement.dataset.theme ?? '';
  select.addEventListener('change', () => {
    const theme = setTheme(select.value);
    const url = new URL(location.href);
    if (theme) url.searchParams.set('theme', theme); else url.searchParams.delete('theme');
    history.replaceState(null, '', url);
  });
  footer.append(picker);
}

// Visionneuse des galeries
const links = [...document.querySelectorAll('.gallery a')];
if (links.length) {
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<img alt=""><button class="prev" aria-label="Précédente">‹</button>' +
    '<button class="next" aria-label="Suivante">›</button><button class="close" aria-label="Fermer">×</button>';
  document.body.append(box);
  const img = box.querySelector('img');
  let group = [], index = 0;

  const show = (i) => {
    index = (i + group.length) % group.length;
    img.src = group[index].href;
    img.alt = group[index].querySelector('img').alt;
  };

  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    group = [...a.closest('.gallery').querySelectorAll('a')];
    show(group.indexOf(a));
    box.showModal();
  }));
  box.querySelector('.prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.next').addEventListener('click', () => show(index + 1));
  box.querySelector('.close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.open) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}
