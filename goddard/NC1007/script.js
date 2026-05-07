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

  function setImportant(el, styles) {
    if (!el) return;

    Object.keys(styles).forEach(function (prop) {
      el.style.setProperty(prop, styles[prop], 'important');
    });
  }

  function applyBannerStyles(banner) {
    if (!banner) return;

    var title = banner.querySelector('.' + TEST_ID + '__title');
    var body = banner.querySelector('.' + TEST_ID + '__body');
    var bullet = banner.querySelector('.' + TEST_ID + '__bullet');
    var copy = banner.querySelector('.' + TEST_ID + '__copy');

    setImportant(banner, {
      display: 'block',
      width: '100%',
      'box-sizing': 'border-box',
      background: '#f3e6cd',
      color: '#08294f',
      padding: '12px 18px 13px',
      margin: '0',
      border: '0',
      'border-bottom': '1px solid rgba(8, 41, 79, 0.12)',
      'box-shadow': '0 1px 5px rgba(8, 41, 79, 0.08)',
      'font-family': '"Noto Sans", Arial, sans-serif',
      'font-style': 'normal',
      'letter-spacing': '0',
      'text-transform': 'none'
    });

    setImportant(title, {
      display: 'block',
      margin: '0 0 7px',
      padding: '0',
      color: '#08294f',
      'font-family': '"Noto Sans", Arial, sans-serif',
      'font-size': '17px',
      'line-height': '1.25',
      'font-weight': '700',
      'font-style': 'normal',
      'letter-spacing': '0',
      'text-transform': 'none',
      'text-decoration': 'none'
    });

    setImportant(body, {
      display: 'grid',
      'grid-template-columns': '10px 1fr',
      'column-gap': '10px',
      'align-items': 'start',
      margin: '0',
      padding: '0',
      color: '#08294f',
      'font-family': '"Noto Sans", Arial, sans-serif'
    });

    setImportant(bullet, {
      display: 'block',
      color: '#08294f',
      'font-family': '"Noto Sans", Arial, sans-serif',
      'font-size': '15px',
      'line-height': '1.35',
      'font-weight': '700',
      margin: '0',
      padding: '0'
    });

    setImportant(copy, {
      display: 'block',
      color: '#08294f',
      'font-family': '"Noto Sans", Arial, sans-serif',
      'font-size': '14px',
      'line-height': '1.38',
      'font-weight': '400',
      'font-style': 'normal',
      'letter-spacing': '0',
      'text-transform': 'none',
      'text-decoration': 'none',
      margin: '0',
      padding: '0'
    });
  }

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

  function buildBannerHTML() {
    return (
      '<div class="' + TEST_ID + '__title">Pre-School Classroom Milestones:</div>' +
      '<div class="' + TEST_ID + '__body">' +
        '<span class="' + TEST_ID + '__bullet" aria-hidden="true">•</span>' +
        '<span class="' + TEST_ID + '__copy">Creative expression through music and arts, scientific investigations and understanding consequences</span>' +
      '</div>'
    );
  }

  function insertBanner() {
    updateHeading();

    var resultsWrap = document.querySelector(SELECTORS.resultsWrap);
    var resultsList = document.querySelector(SELECTORS.resultsList);

    if (!resultsWrap || !resultsList) return false;
    if (!hasResults()) return false;

    var banner = resultsWrap.querySelector('.' + TEST_ID);

    if (!banner) {
      banner = document.createElement('div');
      banner.className = TEST_ID;
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Pre-School Classroom Milestones');
      banner.innerHTML = buildBannerHTML();

      resultsWrap.insertBefore(banner, resultsList);
    } else {
      banner.innerHTML = buildBannerHTML();
    }

    applyBannerStyles(banner);

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
      var banner = document.querySelector('.' + TEST_ID);

      if (banner) {
        applyBannerStyles(banner);
      } else {
        check();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
