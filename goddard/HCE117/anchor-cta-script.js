<script>
(function () {
  var CTA_ID = 'teaser-924a5c7723-cta-90ff6ab598';
  var TARGET_ID = 'text-402f4cbf33';
  var OFFSET_PX = 175;

  var MAX_WAIT_MS = 8000;
  var CHECK_INTERVAL_MS = 100;
  var startedAt = Date.now();

  function getTarget() {
    return document.getElementById(TARGET_ID);
  }

  function getCtas() {
    return document.querySelectorAll('a#' + CTA_ID);
  }

  function scrollToTargetWithOffset() {
    var target = getTarget();

    if (!target) {
      return;
    }

    var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    var scrollTop = targetTop - OFFSET_PX;

    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }

  function bindCta(cta) {
    if (!cta || cta.getAttribute('data-gsi-offset-anchor-bound-v2') === 'true') {
      return;
    }

    cta.setAttribute('href', '#' + TARGET_ID);
    cta.setAttribute('data-gsi-offset-anchor-bound-v2', 'true');

    /*
      Capture-phase handler intentionally blocks native hash-anchor behavior
      and any older bubbling handlers that may push the hash into history.
    */
    cta.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      scrollToTargetWithOffset();

      return false;
    }, true);
  }

  function updateCta() {
    var target = getTarget();
    var ctas = getCtas();

    if (!target || !ctas.length) {
      return false;
    }

    target.style.setProperty('scroll-margin-top', OFFSET_PX + 'px', 'important');

    for (var i = 0; i < ctas.length; i++) {
      bindCta(ctas[i]);
    }

    return true;
  }

  function init() {
    var updated = updateCta();

    if (!updated && Date.now() - startedAt < MAX_WAIT_MS) {
      setTimeout(init, CHECK_INTERVAL_MS);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
