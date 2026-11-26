import '../geschichtenbuch-test-4/story-book.js';

const book = document.querySelector('storybook-reader');
const stage = document.querySelector('main');
const frame = document.querySelector('#game');
const chapters = document.querySelector('#chapter');
const compare = document.querySelector('#compare');
const sections = /^[123]$/;
const positionKey = 'eiche-buchprobe-last-section';

book.shadowRoot.append(Object.assign(document.createElement('style'), {
  textContent: `
    :host { height: 100%; grid-template-rows: minmax(0, 1fr); }
    .settings, .hint { display: none; }
    .desk { width: 100%; min-height: 100%; padding: 0; }
    .viewport { overflow: hidden; }
    .book, .book.wide {
      min-width: 0;
      width: min(100vw - 12px, (100svh - 64px) * var(--aspect, .667), 1460px);
    }
  `
}));
book.open({ id: 'eiche-buchprobe-huelle', pages: [{ layout: 'spread' }] });

function fit() {
  const shell = stage.getBoundingClientRect();
  const paper = book.book.getBoundingClientRect();
  const roomy = compare.getAttribute('aria-pressed') === 'true';
  const left = book.wide ? .066 : .045;
  const right = book.wide ? .934 : .93;
  const top = book.wide ? .055 : .042;
  const bottom = book.wide ? .896 : .91;
  const bounds = roomy
    ? [0, 0, shell.width, shell.height]
    : [
        paper.left - shell.left + paper.width * left,
        paper.top - shell.top + paper.height * top,
        paper.width * (right - left),
        paper.height * (bottom - top)
      ];
  frame.contentDocument?.documentElement?.toggleAttribute('data-room', roomy);
  for (const [index, prop] of ['left', 'top', 'width', 'height'].entries()) {
    frame.style[prop] = `${Math.max(0, bounds[index])}px`;
  }
}

function remember(section) {
  chapters.value = section;
  const url = new URL(location.href);
  url.searchParams.set('abschnitt', section);
  history.replaceState(null, '', url);
  try { localStorage.setItem(positionKey, section); } catch {}
}

function load(section) {
  remember(section);
  frame.src = `abschnitt-${section}/`;
}

let entry = new URL(location.href).searchParams.get('abschnitt');
try { entry ||= localStorage.getItem(positionKey); } catch {}
load(sections.test(entry) ? entry : '1');
chapters.addEventListener('change', () => load(chapters.value));
frame.addEventListener('load', () => {
  const match = frame.contentWindow.location.pathname.match(/\/abschnitt-([123])\//);
  if (match) {
    remember(match[1]);
    fit();
  }
});
compare.addEventListener('click', () => {
  const roomy = compare.getAttribute('aria-pressed') !== 'true';
  compare.setAttribute('aria-pressed', String(roomy));
  compare.textContent = roomy ? 'Buch zeigen' : 'Mehr Platz';
  document.body.toggleAttribute('data-room', roomy);
  fit();
});
const observer = new ResizeObserver(fit);
observer.observe(stage);
observer.observe(book.book);
book.materials.ready.then(() => {
  fit();
  document.body.setAttribute('data-ready', '');
}, () => {
  compare.click();
  document.body.setAttribute('data-ready', '');
});
