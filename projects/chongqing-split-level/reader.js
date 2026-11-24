const pages = [...document.querySelectorAll('.document-page')];
const toolbar = document.querySelector('.reader-toolbar');
const picker = document.querySelector('#page-select');
document.querySelectorAll('[data-enhanced]').forEach(el => el.hidden = false);

function measureToolbar() {
  document.documentElement.style.setProperty('--reader-toolbar-height', `${toolbar.offsetHeight}px`);
}
measureToolbar();
new ResizeObserver(measureToolbar).observe(toolbar);

function selectPage(index) {
  const target = pages[Math.max(0, Math.min(pages.length - 1, index))];
  picker.value = String(pages.indexOf(target));
  target.scrollIntoView({block: 'start', behavior: 'instant'});
  history.replaceState(null, '', `#${target.id}`);
}
picker.addEventListener('change', () => selectPage(Number(picker.value)));
let scheduled = false;
function updateCurrentPage() {
  scheduled = false;
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-gap')) || 0;
  const readingLine = toolbar.getBoundingClientRect().bottom + gap + 1;
  const atEnd = window.scrollY + innerHeight >= document.scrollingElement.scrollHeight - 1;
  // The next page may occupy more of a tall screen while the cover is still at the top.
  const current = atEnd ? pages.length - 1 : Math.max(0, pages.findLastIndex(page => page.getBoundingClientRect().top <= readingLine));
  picker.value = String(current);
}
addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateCurrentPage); }
}, {passive: true});

addEventListener('resize', updateCurrentPage);
const initialPage = pages.findIndex(page => `#${page.id}` === location.hash);
if (initialPage >= 0) selectPage(initialPage);
else updateCurrentPage();
