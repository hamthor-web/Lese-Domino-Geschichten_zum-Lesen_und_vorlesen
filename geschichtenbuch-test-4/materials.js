const readImage = name => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = new URL(`assets/${name}.webp`, import.meta.url);
});

// Coordinates describe the photographed writing surfaces and the paper fore-edges.
const formats = {
  wide: {
    faces: [[.066, .051, .5, .902], [.5, .051, .933, .902]],
    content: { left: '11% 53% 18% 11%', right: '11% 11% 18% 53%', spread: '11% 11% 18% 11%' },
    corners: ['6.5%', '6.5%', '90.5%'],
    edge: [.79, .902, .96]
  },
  single: {
    faces: [[.039, .035, .937, .929]],
    content: { single: '10% 11% 15% 10%' },
    corners: ['4%', '6.5%', '93%'],
    edge: [.82, .929, .977]
  }
};

export class BookMaterials {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.ready = Promise.all(['doppelseite', 'einzelseite', 'papier'].map(readImage))
      .then(([wide, single, paper]) => {
        this.images = { wide, single, paper };
        return this.images;
      });
  }

  get loaded() { return Boolean(this.images); }

  paint(wide, progress) {
    if (!this.loaded) return false;
    const key = wide ? 'wide' : 'single';
    const image = this.images[key];
    const book = this.canvas.parentElement;
    const format = formats[key];
    book.style.setProperty('--aspect', image.width / image.height);
    for (const [side, inset] of Object.entries(format.content)) {
      book.style.setProperty(`--${side}-content`, inset);
    }
    for (const [index, prop] of ['--corner-left', '--corner-right', '--corner-y'].entries()) {
      book.style.setProperty(prop, format.corners[index]);
    }

    const width = Math.round(this.canvas.clientWidth * Math.min(devicePixelRatio, 2));
    const height = Math.round(this.canvas.clientHeight * Math.min(devicePixelRatio, 2));
    if (!width || !height) return false;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    const ctx = this.context;
    ctx.clearRect(0, 0, width, height);
    const [top, seam, foot] = format.edge;
    const columns = 72;
    const center = progress - .5;
    const draw = (sx, sw, x, w, from, to, start, end) => {
      ctx.drawImage(image, sx, from * image.height, sw, (to - from) * image.height,
        x, start * height, w, (end - start) * height);
    };
    draw(0, image.width, 0, width, 0, top, 0, top);
    draw(0, image.width, 0, width, foot, 1, foot, 1);
    for (let col = 0; col < columns; col++) {
      const u = (col + .5) / columns;
      const anchor = wide ? Math.min(1, Math.abs(u - .5) / .19) : 1;
      const offset = center * anchor * (wide ? Math.sign(u - .5) * .036 : .026);
      const x = Math.round(col * width / columns);
      const w = Math.round((col + 1) * width / columns) - x;
      const sx = col * image.width / columns;
      const sw = image.width / columns;
      if (!w) continue;
      draw(sx, sw, x, w, top, seam, top, seam + offset);
      draw(sx, sw, x, w, seam, foot, seam + offset, foot);
    }
    return true;
  }

  leaf(wide, side, section) {
    const format = formats[wide ? 'wide' : 'single'];
    const rect = wide ? format.faces[side] : format.faces[0];
    const bookBox = this.canvas.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = 680;
    canvas.height = Math.round(680 * (rect[3] - rect[1]) * bookBox.height / ((rect[2] - rect[0]) * bookBox.width));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.images.paper, 0, 0, canvas.width, canvas.height);
    if (section && !section.hidden) {
      const mappingX = canvas.width / (bookBox.width * (rect[2] - rect[0]));
      const mappingY = canvas.height / (bookBox.height * (rect[3] - rect[1]));
      const reading = section.querySelector('.reading');
      const readBox = reading.getBoundingClientRect();
      ctx.save();
      ctx.scale(mappingX, mappingY);
      ctx.translate(-bookBox.x - rect[0] * bookBox.width, -bookBox.y - rect[1] * bookBox.height);
      ctx.beginPath();
      ctx.rect(readBox.x, readBox.y, readBox.width, readBox.height);
      ctx.clip();
      for (const element of reading.querySelectorAll('h2, p')) {
        if (section.classList.contains('spread')) break;
        this.#ink(ctx, element);
      }
      ctx.restore();
    }
    return { canvas, rect };
  }

  #ink(ctx, element) {
    const computed = getComputedStyle(element);
    const color = computed.color;
    ctx.fillStyle = color;
    ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.data.matchAll(/\S+/gu)) {
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const bounds = range.getBoundingClientRect();
        ctx.fillText(match[0], bounds.left, bounds.bottom - parseFloat(computed.fontSize) * .22);
      }
    }
  }
}
