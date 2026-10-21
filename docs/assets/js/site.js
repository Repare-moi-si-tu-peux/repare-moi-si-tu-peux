// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

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
