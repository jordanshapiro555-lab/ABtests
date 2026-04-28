<script>
(function () {
  var TEST_ID = 'goddard-daycare-milestone-banner';
  var API_MATCH = '/apps/gsi/api/v1/schools';

  var SELECTORS = {
    heading: '#searchNearYouHeading',
    resultsWrap: '.gsi-school-locator__results',
    resultsList: '#searchNearYouResultsList',
    resultsItem: '.gsi-school-locator__results-item'
  };

  function addStyles() {
    if (document.getElementById(TEST_ID + '-styles')) return;

    var style = document.createElement('style');
    style.id = TEST_ID + '-styles';
    style.textContent = `
      .${TEST_ID} {
        background: #fbf7ef;
        border-radius: 0;
        box-shadow: 0 2px 10px rgba(8, 41, 79, 0.12);
        padding: 18px 22px 16px;
        margin: 0 0 22px;
        color: #08294f;
        font-family: inherit;
      }

      .${TEST_ID}__title {
        font-size: 22px;
        line-height: 1.25;
        font-weight: 700;
        margin: 0 0 10px;
        color: #08294f;
      }

      .${TEST_ID}__list {
        margin: 0;
        padding-left: 21px;
      }

      .${TEST_ID}__list li {
        font-size: 16px;
        line-height: 1.45;
        color: #08294f;
        margin: 0;
      }

      @media (max-width: 767px) {
        .${TEST_ID} {
          padding: 16px 18px 14px;
          margin-bottom: 18px;
        }

        .${TEST_ID}__title {
          font-size: 20px;
        }

        .${TEST_ID}__list li {
          font-size: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function updateHeading() {
    var heading = document.querySelector(SELECTORS.heading);

    if (heading) {
      heading.textContent = 'Find your Goddard Daycare';
    }
  }

  function resultsArePresent() {
    var resultsWrap = document.querySelector(SELECTORS.resultsWrap);
    var resultsList = document.querySelector(SELECTORS.resultsList);
    var resultsItem = document.querySelector(SELECTORS.resultsItem);

    return !!(resultsWrap && resultsList && resultsItem);
  }

  function insertBanner() {
    updateHeading();

    if (!resultsArePresent()) return false;
    if (document.querySelector('.' + TEST_ID)) return true;

    var heading = document.querySelector(SELECTORS.heading);
    if (!heading || !heading.parentNode) return false;

    addStyles();

    var banner = document.createElement('div');
    banner.className = TEST_ID;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Pre-School Classroom Milestones');

    banner.innerHTML = `
      <h3 class="${TEST_ID}__title">Pre-School Classroom Milestones:</h3>
      <ul class="${TEST_ID}__list">
        <li>Creative expression through music and arts, scientific investigations and understanding consequences</li>
      </ul>
    `;

    heading.parentNode.insertBefore(banner, heading);

    return true;
  }

  function waitForResultsThenInsert() {
    if (insertBanner()) return;

    var observer = new MutationObserver(function () {
      if (insertBanner()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    setTimeout(function () {
      observer.disconnect();
      insertBanner();
    }, 10000);
  }

  function patchFetch() {
    if (!window.fetch || window.__goddardTargetFetchPatched) return;
    window.__goddardTargetFetchPatched = true;

    var originalFetch = window.fetch;

    window.fetch = function () {
      var fetchArgs = arguments;
      var requestUrl = '';

      try {
        requestUrl = typeof fetchArgs[0] === 'string'
          ? fetchArgs[0]
          : fetchArgs[0] && fetchArgs[0].url;
      } catch (e) {}

      return originalFetch.apply(this, fetchArgs).then(function (response) {
        if (requestUrl && requestUrl.indexOf(API_MATCH) > -1) {
          setTimeout(waitForResultsThenInsert, 100);
        }

        return response;
      });
    };
  }

  function patchXHR() {
    if (window.__goddardTargetXHRPatched) return;
    window.__goddardTargetXHRPatched = true;

    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.__goddardTargetUrl = url;
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
      var xhr = this;

      xhr.addEventListener('loadend', function () {
        try {
          if (
            xhr.__goddardTargetUrl &&
            xhr.__goddardTargetUrl.indexOf(API_MATCH) > -1 &&
            xhr.status >= 200 &&
            xhr.status < 300
          ) {
            setTimeout(waitForResultsThenInsert, 100);
          }
        } catch (e) {}
      });

      return originalSend.apply(this, arguments);
    };
  }

  function init() {
    updateHeading();
    patchFetch();
    patchXHR();
    waitForResultsThenInsert();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
