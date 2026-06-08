(function () {
  'use strict';

  var EVENT_NAME = 'bb_dress_shirts_filter_applied';
  var TARGET_PATH = '/mens/dress-shirts';

  var DEBUG = false;

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

  function getFilterElement(el) {
    if (!el || !el.closest) return null;

    return el.closest([
      'a[data-refinement-action][data-refinement-id]',
      'button[data-refinement-action][data-refinement-id]',
      'input[data-refinement-action][data-refinement-id]',
      'label[data-refinement-action][data-refinement-id]'
    ].join(','));
  }

  function getFilterValue(filterEl) {
    var srText = filterEl.querySelector && filterEl.querySelector('.selected-assistive-text');
    var visibleText = filterEl.querySelector && filterEl.querySelector('[aria-hidden="true"]');

    return cleanText(
      (srText && srText.textContent) ||
      (visibleText && visibleText.textContent) ||
      filterEl.textContent ||
      ''
    );
  }

  function getFilterSection(filterEl) {
    var refinement = filterEl.closest && filterEl.closest('[data-refinement-type]');
    var header = refinement && refinement.querySelector('.refinement__type');

    return cleanText(
      (refinement && refinement.getAttribute('data-refinement-type')) ||
      (header && header.textContent) ||
      ''
    );
  }

  function shouldIgnoreFilter(filterEl) {
    var action = cleanText(filterEl.getAttribute('data-refinement-action')).toLowerCase();
    var id = cleanText(filterEl.getAttribute('data-refinement-id')).toLowerCase();
    var text = cleanText(filterEl.textContent).toLowerCase();

    return (
      action === 'clear' ||
      action === 'reset' ||
      action === 'remove' ||
      id.indexOf('clear') > -1 ||
      id.indexOf('reset') > -1 ||
      text === 'clear filters' ||
      text === 'clear all'
    );
  }

  function fireOptimizelyEvent(filterEl) {
    if (!window.optimizely || !Array.isArray(window.optimizely)) {
      log('Optimizely object not ready');
      return;
    }

    var action = cleanText(filterEl.getAttribute('data-refinement-action'));
    var refinementId = cleanText(filterEl.getAttribute('data-refinement-id'));
    var filterValue = getFilterValue(filterEl);
    var filterSection = getFilterSection(filterEl);

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

    log('event fired', {
      eventName: EVENT_NAME,
      filter_action: action,
      filter_id: refinementId,
      filter_value: filterValue,
      filter_section: filterSection
    });
  }

  function bindFilterTracking() {
    if (!isTargetPage()) return;

    document.addEventListener(
      'click',
      function (event) {
        var filterEl = getFilterElement(event.target);

        if (!filterEl) return;
        if (!isTargetPage()) return;
        if (shouldIgnoreFilter(filterEl)) return;

        fireOptimizelyEvent(filterEl);
      },
      true
    );

    log('listener bound');
  }

  bindFilterTracking();
})();
