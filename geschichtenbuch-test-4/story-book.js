import { BookMaterials } from './materials.js';
import { animateLeaf } from './turn.js';

const landscape = '(orientation: landscape)';
const reducedMotion = '(prefers-reduced-motion: reduce)';
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${new URL('story-book.css', import.meta.url)}">
  <div class="settings" role="group" aria-label="Leseeinstellungen">
    <label>Buchgröße <input name="book" type="range" min="75" max="145" value="100" step="5"></label>
    <label>Schriftgröße <input name="font" type="range" min="85" max="185" value="100" step="5"></label>
  </div>
  <div class="viewport">
    <div class="desk">
      <div class="book" aria-busy="true">
        <canvas class="materials" aria-hidden="true"></canvas>
        <div class="pages"></div>
        <button class="corner previous" type="button" aria-label="Zurückblättern" title="Zurückblättern"></button>
        <button class="corner next" type="button" aria-label="Weiterblättern" title="Weiterblättern"></button>
        <canvas class="turn" aria-hidden="true" hidden></canvas>
      </div>
    </div>
  </div>
  <p class="hint" role="status"></p>
`;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export class StoryBook extends HTMLElement {
  #media = matchMedia(landscape);
  #motion = matchMedia(reducedMotion);
  #story;
  #leaves = [];
  #position = 0;
  #unlocked = new Set();
  #turn;
  #resize;
  #sound = new Audio(new URL('../assets/die-eiche/abschnitt-1/blaettern.mp3', import.meta.url));

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.book = this.shadowRoot.querySelector('.book');
    this.pages = this.shadowRoot.querySelector('.pages');
    this.hint = this.shadowRoot.querySelector('.hint');
    this.previous = this.shadowRoot.querySelector('.previous');
    this.next = this.shadowRoot.querySelector('.next');
    this.turnCanvas = this.shadowRoot.querySelector('.turn');
    this.materials = new BookMaterials(this.shadowRoot.querySelector('.materials'));
    this.previous.addEventListener('click', () => this.turn(-1));
    this.next.addEventListener('click', () => this.turn(1));
    this.shadowRoot.querySelector('.settings').addEventListener('input', () => {
      const book = Number(this.shadowRoot.querySelector('[name=book]').value);
      const font = Number(this.shadowRoot.querySelector('[name=font]').value);
      this.setZoom(book, font);
    });
    this.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
          event.composedPath().some(node => node.matches?.('input, textarea, select, video, audio, [contenteditable]'))) return;
      const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
      if (direction && this.#destination(direction) != null) {
        event.preventDefault();
        this.turn(direction);
      }
    });
    this.#resize = new ResizeObserver(() => {
      this.#turn?.abort();
      this.#paint();
    });
  }

  connectedCallback() {
    this.#media.addEventListener('change', this.#changeFormat);
    this.#resize.observe(this.book);
    this.materials.ready.then(() => this.#paint(), () => {
      this.hint.textContent = 'Die Buchbilder konnten nicht geladen werden.';
    });
    this.#changeFormat();
  }

  disconnectedCallback() {
    this.#media.removeEventListener('change', this.#changeFormat);
    this.#resize.disconnect();
    this.#turn?.abort();
  }

  get position() { return this.#position; }
  get wide() { return this.#media.matches; }

  open(story) {
    if (!story.id || !story.pages?.length) throw new TypeError('Eine Geschichte braucht eine ID und mindestens eine Seite.');
    this.#turn?.abort();
    this.#story = story;
    this.#leaves = [];
    this.#unlocked = new Set();
    for (const page of story.pages) {
      if (page.layout === 'spread' && this.#leaves.length % 2) this.#leaves.push(null);
      this.#leaves.push(page);
      if (page.layout === 'spread') this.#leaves.push(null);
    }
    const saved = this.#readProgress();
    this.#position = this.#leaves[saved?.position] ? saved.position : 0;
    this.#unlocked = new Set(Array.isArray(saved?.unlocked) ? saved.unlocked : []);
    this.#render();
  }

  setZoom(book, font) {
    const bookSetting = clamp(book, 75, 145);
    const fontSetting = clamp(font, 85, 185);
    this.shadowRoot.querySelector('[name=book]').value = bookSetting;
    this.shadowRoot.querySelector('[name=font]').value = fontSetting;
    this.style.setProperty('--book-zoom', bookSetting / 100);
    // Keep both paper corners within reach on a narrow phone at maximum zoom.
    this.style.setProperty('--phone-book-zoom', bookSetting <= 100 ? bookSetting / 100 : 1 + (bookSetting - 100) / 515);
    this.style.setProperty('--font-zoom', fontSetting / 100);
  }

  #changeFormat = () => {
    this.#turn?.abort();
    this.book.classList.toggle('wide', this.wide);
    this.#render();
  };

  #readProgress() {
    try { return JSON.parse(localStorage.getItem(`story-book:${this.#story.id}`)); }
    catch { return null; }
  }

  #save() {
    try {
      localStorage.setItem(`story-book:${this.#story.id}`, JSON.stringify({
        position: this.#position,
        unlocked: [...this.#unlocked]
      }));
    } catch { /* Reading still works without persistent browser storage. */ }
  }

  #visible(position = this.#position) {
    if (!this.wide) return [position];
    const first = position - position % 2;
    return this.#leaves[first]?.layout === 'spread' ? [first] : [first, first + 1];
  }

  #destination(direction) {
    if (!this.wide) {
      for (let target = this.#position + direction; target >= 0 && target < this.#leaves.length; target += direction) {
        if (this.#leaves[target]) return target;
      }
      return null;
    }
    const first = this.#position - this.#position % 2;
    const target = first + direction * 2;
    return this.#leaves[target] || this.#leaves[target + 1]
      ? (this.#leaves[target] ? target : target + 1)
      : null;
  }

  #locked() {
    return this.#visible().some(index => {
      const page = this.#leaves[index];
      return page?.locked && !this.#unlocked.has(page.id ?? index);
    });
  }

  #navigation() {
    const back = this.#destination(-1);
    const forward = this.#destination(1);
    const locked = forward != null && this.#locked();
    this.previous.hidden = back == null;
    this.next.hidden = forward == null;
    this.next.setAttribute('aria-disabled', String(locked));
    this.next.setAttribute('aria-label', locked ? 'Weiterblättern nach der Aufgabe' : 'Weiterblättern');
    this.hint.textContent = locked ? 'Löse zuerst die Aufgabe.' : '';
  }

  #render(indices = this.#visible()) {
    if (!this.#story) return;
    this.pages.replaceChildren(...indices.map((index, side) => this.#makePage(index, side)));
    this.#navigation();
    this.#paint();
  }

  #makePage(index, side) {
    const section = document.createElement('section');
    const page = this.#leaves[index];
    section.className = 'page';
    section.dataset.side = this.wide ? (side === 0 ? 'left' : 'right') : 'single';
    if (!page) {
      section.hidden = true;
      return section;
    }
    const key = page.id ?? index;
    if (page.layout === 'spread') section.classList.add('spread');
    section.setAttribute('aria-label', page.title || `Seite ${index + 1}`);
    const reading = document.createElement('div');
    reading.className = 'reading';
    reading.tabIndex = 0;
    if (page.title) {
      const heading = document.createElement('h2');
      heading.textContent = page.title;
      reading.append(heading);
    }
    if (page.text) {
      for (const paragraph of (Array.isArray(page.text) ? page.text : [page.text])) {
        const text = document.createElement('p');
        text.textContent = paragraph;
        reading.append(text);
      }
    }
    if (page.render) {
      const story = this.#story;
      const content = page.render({
        unlocked: this.#unlocked.has(key),
        unlock: () => {
          if (story !== this.#story) return;
          this.#unlocked.add(key);
          this.#save();
          this.#navigation();
        }
      });
      if (content) reading.append(content);
    }
    section.append(reading);
    return section;
  }

  #paint(position = this.#position) {
    if (this.materials.paint(this.wide, position / Math.max(1, this.#leaves.length - 1))) {
      this.book.setAttribute('aria-busy', 'false');
    }
  }

  async turn(direction) {
    if (this.#turn || ![-1, 1].includes(direction) || (direction === 1 && this.#locked())) return false;
    const target = this.#destination(direction);
    if (target == null) return false;
    const source = this.#position;
    const side = this.wide ? (direction === 1 ? 1 : 0) : 0;
    const oldIndices = this.#visible();
    const cornerHadFocus = [this.next, this.previous].includes(this.shadowRoot.activeElement);
    const controller = new AbortController();
    this.#turn = controller;
    this.#sound.currentTime = 0;
    this.#sound.volume = 0.34;
    this.#sound.play().catch(() => {});
    try {
      if (!this.#motion.matches && this.materials.loaded) {
        const visible = this.#visible(target);
        const exposed = this.wide && oldIndices.length === 2 && visible.length === 2
          ? (direction === 1 ? [oldIndices[0], visible[1]] : [visible[0], oldIndices[1]])
          : !this.wide && direction === -1 ? oldIndices : visible;
        const outgoing = this.pages.children[side] ?? this.pages.firstElementChild;
        const incoming = this.#makePage(visible[this.wide && visible.length === 2 ? 1 - side : 0], 1 - side);
        this.pages.append(incoming);
        await animateLeaf({
          canvas: this.turnCanvas, wide: this.wide, direction,
          front: this.materials.leaf(this.wide, side, this.wide || direction === 1 ? outgoing : null),
          back: this.materials.leaf(this.wide, 1 - side, this.wide || direction === -1 ? incoming : null),
          signal: controller.signal,
          onStart: () => {
            this.pages.inert = true;
            this.#render(exposed);
          },
          onFrame: progress => this.#paint(source + (target - source) * progress)
        });
      }
    } finally {
      this.pages.inert = false;
      this.#turn = undefined;
      if (!controller.signal.aborted) {
        this.#position = target;
        this.#save();
        this.dispatchEvent(new CustomEvent('pagechange', { detail: { position: target }, bubbles: true }));
      }
      this.#render();
      if (cornerHadFocus) {
        const sameCorner = direction > 0 ? this.next : this.previous;
        const otherCorner = direction > 0 ? this.previous : this.next;
        (sameCorner.hidden ? otherCorner : sameCorner).focus({ preventScroll: true });
      }
    }
    return !controller.signal.aborted;
  }
}

customElements.define('storybook-reader', StoryBook);
