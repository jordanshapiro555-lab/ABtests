<script>
    (function () {
  var SELECTOR = 'h1.cmp-teaser__title';
  var TARGET_TEXT = 'Care You Trust for the One You Love';
  var MAX_WAIT_MS = 8000;
  var CHECK_INTERVAL_MS = 100;
  var startedAt = Date.now();
  var resizeTimer = null;

  function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function getTargetHeadline() {
    var headlines = document.querySelectorAll(SELECTOR);

    for (var i = 0; i < headlines.length; i++) {
      if (normalizeText(headlines[i].textContent) === TARGET_TEXT) {
        return headlines[i];
      }
    }

    /*
      Fallback:
      If there is only one matching H1 on the page, use it even if text matching fails.
      This avoids failure from unexpected AEM whitespace or rendering changes.
    */
    if (headlines.length === 1) {
      return headlines[0];
    }

    return null;
  }

  function updateHeadlineInlineStyles() {
    var headline = getTargetHeadline();

    if (!headline) {
      return false;
    }

    var width = window.innerWidth || document.documentElement.clientWidth;

    if (width >= 1185 && width <= 1204) {
      headline.style.setProperty('font-size', '3.5rem', 'important');
    } else if (width >= 1205 && width <= 1403) {
      headline.style.setProperty('font-size', '3.75rem', 'important');
    } else {
      headline.style.removeProperty('font-size');
    }

    return true;
  }

  function pollForHeadline() {
    var applied = updateHeadlineInlineStyles();

    if (!applied && Date.now() - startedAt < MAX_WAIT_MS) {
      setTimeout(pollForHeadline, CHECK_INTERVAL_MS);
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      updateHeadlineInlineStyles();
    }, 50);
  }

  /*
    Reapply when AEM/Target/page scripts mutate the hero.
    This protects the inline style if the H1 is replaced after Target runs.
  */
  var observer = new MutationObserver(function () {
    updateHeadlineInlineStyles();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pollForHeadline);
  } else {
    pollForHeadline();
  }
})();
</script>
