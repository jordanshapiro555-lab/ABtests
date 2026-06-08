(function () {
  'use strict';

  var EVENT_NAME = 'bb_dress_shirts_filter_applied';
  var TARGET_PATH = '/mens/dress-shirts';
  var DEBUG = true;

  function log() {
    if (DEBUG && window.console) {
      console.log.apply(console, ['[BB Filter Event]'].concat([].slice.call(arguments)));
    }
  }

  function isTargetPage() {
    return window.location.pathname.indexOf(TARGET_PATH) === 0;
  }

  function cleanText(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getClosestRefinementClick(el) {
    if (!el || !el.closest) return null;

    return el.closest([
      'a[data-refinement-action]',
      'button[data-refinement-action]',
      'input[data-refinement-action]',
      'label[data-refinement-action]',
      'a[href*="Search-ShowAjax"]',
      'a[href*="prefn"]',
      'a[href*="prefv"]'
    ].join(','));
  }

  function isActualFilterSelection(el) {
    var action;
    var href;

    if (!el) return false;

    action = cleanText(el.getAttribute('data-refinement-action')).toLowerCase();
    href = el.getAttribute('href') || '';

    if (action === 'boolean') return true;
    if (action === 'size') return true;
    if (action === 'color') return true;
    if (action === 'fit') return true;
    if (action === 'pattern') return true;
    if (action === 'price') return true;

    if (href.indexOf('Search-ShowAjax') > -1 && href.indexOf('prefn') > -1) return true;
    if (href.indexOf('prefv') > -1) return true;

    return false;
  }

  function shouldIgnore(el) {
    var action = cleanText(el.getAttribute('data-refinement-action')).toLowerCase();
    var id = cleanText(el.getAttribute('data-refinement-id')).toLowerCase();
    var text = cleanText(el.textContent).toLowerCase();

    return (
      action === 'clear' ||
      action === 'reset' ||
      action === 'remove' ||
      id.indexOf('clear') > -1 ||
      id.indexOf('reset') > -1 ||
      text === 'clear filters' ||
      text === 'clear all' ||
      text === 'close'
    );
  }

  function getFilterValue(el) {
    var srText = el.querySelector && el.querySelector('.selected-assistive-text');
    var visibleText = el.querySelector && el.querySelector('[aria-hidden="true"]');

    return cleanText(
      (srText && srText.textContent) ||
      (visibleText && visibleText.textContent) ||
      el.textContent ||
      el.getAttribute('data-refinement-id') ||
      ''
    );
  }

  function getFilterSection(el) {
    var refinement = el.closest && el.closest('[data-refinement-type]');
    var header = refinement && refinement.querySelector('.refinement__type');

    return cleanText(
      (refinement && refinement.getAttribute('data-refinement-type')) ||
      (header && header.textContent) ||
      ''
    );
  }

  function fireEvent(el) {
    var action = cleanText(el.getAttribute('data-refinement-action'));
    var refinementId = cleanText(el.getAttribute('data-refinement-id'));
    var filterValue = getFilterValue(el);
    var filterSection = getFilterSection(el);

    var payload = {
      eventName: EVENT_NAME,
      filter_action: action,
      filter_id: refinementId,
      filter_value: filterValue,
      filter_section: filterSection,
      page_path: window.location.pathname,
      firedAt: new Date().toISOString()
    };

    window.__bbFilterEventLastFired = payload;
    window.__bbFilterEventAllFired = window.__bbFilterEventAllFired || [];
    window.__bbFilterEventAllFired.push(payload);

    if (!window.optimizely || typeof window.optimizely.push !== 'function') {
      log('Did not fire: window.optimizely.push unavailable', {
        optimizely: window.optimizely,
        payload: payload
      });
      return;
    }

    window.optimizely.push({
      type: 'event',
      eventName: EVENT_NAME,
      tags: {
        filter_action: action,
        filter_id: refinementId,
        filter_value: filterValue,
        filter_section: filterSection,
        page_path: window.location.pathname
      }
    });

    log('FIRED', payload);
  }

  function bindFilterTracking() {
    if (!isTargetPage()) {
      log('Not target page', window.location.pathname);
      return;
    }

    document.addEventListener('click', function (event) {
      var el = getClosestRefinementClick(event.target);

      if (!el) return;
      if (!isTargetPage()) return;

      log('Potential refinement click detected', {
        element: el,
        text: cleanText(el.textContent),
        action: el.getAttribute('data-refinement-action'),
        id: el.getAttribute('data-refinement-id'),
        href: el.getAttribute('href')
      });

      if (shouldIgnore(el)) {
        log('Ignored: clear/reset/remove/close');
        return;
      }

      if (!isActualFilterSelection(el)) {
        log('Ignored: not actual filter selection');
        return;
      }

      fireEvent(el);
    }, true);

    log('Listener bound', window.location.pathname);
  }

  bindFilterTracking();
})();

(function () {
  'use strict';

  var ATTRIBUTE_NAME = 'bb_saw_active_refinement_bar';
  var ATTRIBUTE_VALUE = 'true';
  var STORAGE_KEY = 'bb_saw_active_refinement_bar';
  var TARGET_PATH = '/mens/dress-shirts';
  var SELECTOR = '.refinement-bar.refinement-bar--active';

  function isTargetPage() {
    return window.location.pathname.replace(/\/$/, '') === TARGET_PATH;
  }

  function isActuallyVisible(el) {
    if (!el) return false;

    var style = window.getComputedStyle(el);

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0'
    ) {
      return false;
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function setAttributeOnce() {
    if (!isTargetPage()) return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;

    var el = document.querySelector(SELECTOR);

    if (!isActuallyVisible(el)) return;

    sessionStorage.setItem(STORAGE_KEY, '1');

    window.optimizely = window.optimizely || [];

    window.optimizely.push({
      type: 'user',
      attributes: {
        bb_saw_active_refinement_bar: ATTRIBUTE_VALUE
      }
    });

    console.log('[Optimizely] Attribute set:', ATTRIBUTE_NAME, ATTRIBUTE_VALUE);
  }

  function init() {
    setAttributeOnce();

    var observer = new MutationObserver(setAttributeOnce);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-expanded']
    });

    window.addEventListener('scroll', setAttributeOnce, { passive: true });
    window.addEventListener('resize', setAttributeOnce);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
