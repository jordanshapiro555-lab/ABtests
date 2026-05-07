<script>
(function () {
  var TEST_ID = 'goddard-daycare-milestone-banner';

  var SELECTORS = {
    heading: '#searchNearYouHeading',
    resultsWrap: '#searchNearYou .gsi-school-locator__results',
    resultsList: '#searchNearYouResultsList',
    resultsItem: '#searchNearYouResultsList .gsi-school-locator__results-item'
  };

  var MAX_WAIT_MS = 15000;
  var CHECK_INTERVAL_MS = 250;
  var startedAt = Date.now();
  var intervalId = null;
  var observer = null;

  function updateHeading() {
    var heading = document.querySelector(SELECTORS.heading);
    if (heading && heading.textContent.trim() !== 'Find your Goddard Daycare') {
      heading.textContent = 'Find your Goddard Daycare';
    }
  }

  function hasResults() {
    return !!(
      document.querySelector(SELECTORS.resultsWrap) &&
      document.querySelector(SELECTORS.resultsList) &&
      document.querySelector(SELECTORS.resultsItem)
    );
  }

  function insertBanner() {
    updateHeading();

    var resultsWrap = document.querySelector(SELECTORS.resultsWrap);
    var resultsList = document.querySelector(SELECTORS.resultsList);

    if (!resultsWrap || !resultsList) return false;
    if (!hasResults()) return false;

    var existing = resultsWrap.querySelector('.' + TEST_ID);
    if (existing) return true;

    var banner = document.createElement('div');
    banner.className = TEST_ID;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Pre-School Classroom Milestones');

    banner.innerHTML =
      '<h3 class="' + TEST_ID + '__title">Pre-School Classroom Milestones:</h3>' +
      '<ul class="' + TEST_ID + '__list">' +
        '<li>Creative expression through music and arts, scientific investigations and understanding consequences</li>' +
      '</ul>';

    resultsWrap.insertBefore(banner, resultsList);

    return true;
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function check() {
    updateHeading();

    if (insertBanner()) {
      cleanup();
      return;
    }

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      cleanup();
    }
  }

  function init() {
    check();

    intervalId = setInterval(check, CHECK_INTERVAL_MS);

    observer = new MutationObserver(function () {
      check();
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
