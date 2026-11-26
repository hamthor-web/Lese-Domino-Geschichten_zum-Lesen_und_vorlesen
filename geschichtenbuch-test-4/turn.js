// A paper surface sampled from hinge to free edge. Each row bends at a slightly
// different time, so the lower corner lifts before the rest of the free edge.
const columns = 21;
const rows = 7;
const unit = value => Math.min(1, Math.max(0, value));
const smooth = value => unit(value) ** 2 * (3 - 2 * unit(value));
const blend = (a, b, t) => a + (b - a) * t;

function mesh(progress, rect, destination, width, height, direction) {
  const sign = direction;
  const mix = smooth(progress);
  const hinge = blend(sign === 1 ? rect[0] : rect[2], sign === 1 ? destination[2] : destination[0], mix) * width;
  const pageWidth = blend(rect[2] - rect[0], destination[2] - destination[0], mix) * width;
  const top = blend(rect[1], destination[1], mix) * height;
  const pageHeight = blend(rect[3] - rect[1], destination[3] - destination[1], mix) * height;
  const baseAngle = Math.PI * mix;

  return Array.from({ length: rows + 1 }, (_, row) => {
    const v = row / rows;
    let x = 0;
    let z = 0;
    return Array.from({ length: columns + 1 }, (_, column) => {
      const u = column / columns;
      const angle = baseAngle + (1.42 * u ** 2 + .58 * v * u) * Math.sin(Math.PI * progress) ** 1.15;
      if (column) {
        x += Math.cos(angle) * pageWidth / columns;
        z += Math.sin(angle) * pageWidth / columns;
      }
      const perspective = 1 + z / (width * 3.9);
      const edge = u ** 2 * (Math.sin(v * Math.PI * 2) * .005 + Math.sin(v * Math.PI * 7) * .0025);
      const y = top + (v + edge) * pageHeight;
      return {
        x: hinge + x * sign * perspective + pageWidth * edge,
        y: y - z * (.12 + .08 * v) + (y - height * .49) * (perspective - 1),
        z, angle, u, v
      };
    });
  });
}

function triangle(context, image, [p, q, r], flip, shade, light) {
  const uv = point => [(flip ? 1 - point.u : point.u) * image.width, point.v * image.height];
  const [u0, v0] = uv(p);
  const [u1, v1] = uv(q);
  const [u2, v2] = uv(r);
  const determinant = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
  const a = ((q.x - p.x) * (v2 - v0) - (r.x - p.x) * (v1 - v0)) / determinant;
  const b = ((q.y - p.y) * (v2 - v0) - (r.y - p.y) * (v1 - v0)) / determinant;
  const c = ((r.x - p.x) * (u1 - u0) - (q.x - p.x) * (u2 - u0)) / determinant;
  const d = ((r.y - p.y) * (u1 - u0) - (q.y - p.y) * (u2 - u0)) / determinant;

  const points = [p, q, r];
  const orientation = Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  if (!orientation) return;
  const outset = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const n = Math.hypot(dx, dy) || 1;
    return { x: orientation * dy / n, y: -orientation * dx / n };
  };
  // Extend adjoining facets by a fraction of a pixel to remove sampling gaps.
  const overlap = points.map((point, index) => {
    const before = outset(points[(index + 2) % 3], point);
    const after = outset(point, points[(index + 1) % 3]);
    const margin = .68 / Math.max(.38, 1 + before.x * after.x + before.y * after.y);
    return { x: point.x + (before.x + after.x) * margin, y: point.y + (before.y + after.y) * margin };
  });
  context.save();
  shape(context, overlap);
  context.clip();
  context.transform(a, b, c, d, p.x - a * u0 - c * v0, p.y - b * u0 - d * v0);
  context.drawImage(image, -5, -5, image.width + 10, image.height + 10);
  if (shade) {
    context.fillStyle = `rgba(73, 42, 24, ${shade})`;
    context.fillRect(-5, -5, image.width + 10, image.height + 10);
  }
  if (light) {
    context.fillStyle = `rgba(255, 236, 198, ${light})`;
    context.fillRect(-5, -5, image.width + 10, image.height + 10);
  }
  context.restore();
}

function shape(context, points) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) context.lineTo(point.x, point.y);
  context.closePath();
}

function drawLeaf(context, surface, front, back, direction, progress, visible) {
  const silhouette = [
    ...surface[0], ...surface.slice(1, -1).map(row => row.at(-1)),
    ...[...surface.at(-1)].reverse(), ...surface.slice(1, -1).reverse().map(row => row[0])
  ];
  context.save();
  context.globalAlpha = Math.sin(Math.PI * progress) * .32 * visible;
  context.fillStyle = '#231309';
  context.filter = `blur(${Math.max(2, context.canvas.width * .009)}px)`;
  context.translate(direction * context.canvas.width * .012, context.canvas.height * .022);
  shape(context, silhouette);
  context.fill();
  context.restore();

  const facets = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const points = [surface[row][col], surface[row][col + 1], surface[row + 1][col + 1], surface[row + 1][col]];
      const angle = (points[0].angle + points[2].angle) / 2;
      facets.push({ points, angle, z: (points[0].z + points[2].z) / 2 });
    }
  }
  facets.sort((a, b) => a.z - b.z);
  context.globalAlpha = visible;
  for (const { points: [a, b, c, d], angle } of facets) {
    const reverse = Math.cos(angle) < 0;
    const image = reverse ? back : front;
    const mirror = reverse !== (direction === -1);
    const shade = Math.min(.35, Math.abs(Math.sin(angle)) * .27 + (reverse ? .075 : 0));
    const light = Math.max(0, Math.sin(angle * 2)) * .09;
    triangle(context, image, [a, b, c], mirror, shade, light);
    triangle(context, image, [a, c, d], mirror, shade, light);
  }
  context.globalAlpha = 1;
}

export function animateLeaf({ canvas, wide, direction, front, back, signal, onStart, onFrame }) {
  const pixelRatio = Math.min(devicePixelRatio, 1.5);
  const width = Math.round(canvas.parentElement.clientWidth * pixelRatio);
  const height = Math.round(canvas.parentElement.clientHeight * pixelRatio);
  const paddingX = Math.round(width * .05);
  const paddingY = Math.round(height * .13);
  canvas.width = width + paddingX * 2;
  canvas.height = height + paddingY * 2;
  const context = canvas.getContext('2d');
  const duration = wide ? 880 : 620;
  const leaf = wide || direction === 1 ? front : back;
  const underside = wide || direction === 1 ? back : front;
  const destination = wide ? back.rect
    : [leaf.rect[0] * 2 - leaf.rect[2], leaf.rect[1], leaf.rect[0], leaf.rect[3]];
  const sweep = wide ? direction : 1;
  const reversePortrait = !wide && direction === -1;
  return new Promise(resolve => {
    let handle;
    const start = performance.now();
    function finish() {
      cancelAnimationFrame(handle);
      canvas.hidden = true;
      signal.removeEventListener('abort', finish);
      resolve();
    }
    function frame(now) {
      const progress = unit((now - start) / duration);
      const phase = wide ? progress : (reversePortrait ? 1 - progress : progress) * .62;
      const visible = wide ? 1 - smooth((phase - .93) / .07) : 1 - smooth((phase - .46) / .16);
      context.clearRect(0, 0, canvas.width, canvas.height);
      onFrame(smooth(progress));
      if (visible > 0) {
        const surface = mesh(phase, leaf.rect, destination, width, height, sweep);
        context.save();
        context.translate(paddingX, paddingY);
        if (!wide) {
          context.beginPath();
          context.rect(leaf.rect[0] * width, -paddingY, (1 - leaf.rect[0]) * width + paddingX, canvas.height);
          context.clip();
        }
        drawLeaf(context, surface, leaf.canvas, underside.canvas, sweep, phase, visible);
        context.restore();
      }
      if (progress >= 1) finish();
      else handle = requestAnimationFrame(frame);
    }
    if (signal.aborted) { resolve(); return; }
    signal.addEventListener('abort', finish, { once: true });
    canvas.hidden = false;
    onStart();
    frame(start);
  });
}
