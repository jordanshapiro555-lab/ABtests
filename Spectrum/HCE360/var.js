<script type="html/js">
(function () {
  function initExperiment() {
    var hero = document.querySelector('pex-pl-hero-content');
    if (!hero) {
      return setTimeout(initExperiment, 200);
    }



var eyebrow = hero.querySelector('nova-type-stack-eyebrow');
var title = hero.querySelector('.nova-type-stack-hero-title-large');
var para = hero.querySelector('.nova-type-stack-paragraph');
// Guard: only run once the target text is present, and prevent re-running
if (!eyebrow || !title || !para) {
  return setTimeout(initExperiment, 200);
}
if (title.getAttribute('data-exp-updated') === 'true') return;
// 1. Eyebrow
eyebrow.textContent = 'SPECTRUM INTERNET® ADVANTAGE';
// 2. Headline
title.textContent = 'Most reliable speed, starting at $30/mo.';
// 3. Paragraph (two lines, separated by a <br>)
para.innerHTML =
  "Get the speed your home needs at a price you'll love.<br>" +
  "Explore affordable internet plans with no contracts and no data caps.";
title.setAttribute('data-exp-updated', 'true');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperiment);
  } else {
    initExperiment();
  }
})();
</script>
