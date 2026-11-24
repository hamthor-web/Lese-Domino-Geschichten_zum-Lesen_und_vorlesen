'use strict';
(() => {
  const resume = document.getElementById('silvana-resume');
  function update() {
    const target = SilvanaProgress.resumeTarget();
    resume.disabled = !target;
    resume.onclick = () => { if (target) location.assign(target); };
  }
  update();
  for (const event of ['pageshow', 'storage', 'game-reset']) addEventListener(event, update);
})();
