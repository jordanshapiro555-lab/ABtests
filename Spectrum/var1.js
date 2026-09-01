<script id="no-commitment" type="html/js">
    (function () {
  function initExperiment() {
    var hero = document.querySelector('pex-pl-hero-content');
    if (!hero) {
      return setTimeout(initExperiment, 200);
    }

    // Prevent double-injection
    if (hero.querySelector('.exp-abcd-trust-strip')) return;

    // 1. Update the eyebrow
    var eyebrow = hero.querySelector('nova-type-stack-eyebrow');
    if (eyebrow) eyebrow.textContent = 'SPECTRUM INTERNET® GIG';

    // 2. Update the headline
    var title = hero.querySelector('.nova-type-stack-hero-title-large');
    if (title) title.textContent = 'Fast, reliable Internet you can count on';

    // 3. Update the paragraph
    var para = hero.querySelector('.nova-type-stack-paragraph');
    if (para) {
      para.textContent = 'Get reliable Internet with no contracts and the freedom to change or cancel anytime.';
    }

    // 4. Build the trust element ("No contracts or commitments")
    var trust = document.createElement('div');
    trust.className = 'exp-abcd-trust-strip';
    trust.innerHTML =
      '<img class="exp-abcd-trust-strip__icon" ' +
      'src="https://buyflow-prod-component.phoenix.spectrum.com/assets/production/images/SEM/internet/icon-thirty-day-guarantee-dtm.svg" ' +
      'alt="No contracts" />' +
      '<div class="exp-abcd-trust-strip__text">' +
      '<span class="exp-abcd-trust-strip__title">No contracts or commitments.</span>' +
      '<span class="exp-abcd-trust-strip__sub">The freedom to change or cancel anytime.</span>' +
      '</div>';

    // 5. Insert the trust element ABOVE the paragraph
    var paraWrap = hero.querySelector('nova-type-stack-paragraph');
    if (paraWrap && paraWrap.parentNode) {
      paraWrap.parentNode.insertBefore(trust, paraWrap);
    } else {
      // fallback: before the actions
      var actions = hero.querySelector('nova-type-stack-actions');
      if (actions && actions.parentNode) {
        actions.parentNode.insertBefore(trust, actions);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperiment);
  } else {
    initExperiment();
  }
})();
</script>
