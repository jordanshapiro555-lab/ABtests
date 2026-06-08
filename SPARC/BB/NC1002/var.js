(function () {
  'use strict';

  var TEST_ID = 'bb-dress-shirt-filter-reorder';
  var TARGET_PATH = '/mens/dress-shirts';
  var INIT_TIMEOUT_MS = 10000;
  var POLL_MS = 100;
  var OBSERVER_DEBOUNCE_MS = 100;

  function isTargetPage() {
    return window.location.pathname === TARGET_PATH;
  }

  function getRefinement(container, type) {
    return (
      container.querySelector('.refinement[data-refinement-type="' + type + '"]') ||
      container.querySelector('.refinement-' + type)
    );
  }

  function moveAfter(sourceEl, targetEl) {
    if (!sourceEl || !targetEl || !targetEl.parentNode) return false;

    var parent = targetEl.parentNode;
    var nextEl = targetEl.nextElementSibling;

    if (nextEl === sourceEl) return false;

    parent.insertBefore(sourceEl, nextEl);
    return true;
  }

  function reorderFilters() {
    if (!isTargetPage()) return false;

    var didMove = false;
    var refinementContainers = document.querySelectorAll('.refinements');

    refinementContainers.forEach(function (container) {
      var fit = getRefinement(container, 'fit');
      var fabric = getRefinement(container, 'fabric');
      var collection = getRefinement(container, 'collection');
      var pattern = getRefinement(container, 'pattern');
      var size = getRefinement(container, 'size');

      /*
        Required final relationships:
        1. Fabric immediately below Fit
        2. Collection immediately below Fabric
        3. Size immediately below Pattern

        Run fabric/collection first so collection follows the newly moved fabric.
      */

      if (fit && fabric) {
        didMove = moveAfter(fabric, fit) || didMove;
      }

      if (fabric && collection) {
        didMove = moveAfter(collection, fabric) || didMove;
      }

      if (pattern && size) {
        didMove = moveAfter(size, pattern) || didMove;
      }

      container.setAttribute('data-' + TEST_ID, 'true');
    });

    return didMove;
  }

  function debounce(fn, delay) {
    var timer = null;

    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function initObserver() {
    if (window[TEST_ID + '_observer']) return;

    var debouncedReorder = debounce(function () {
      reorderFilters();
    }, OBSERVER_DEBOUNCE_MS);

    var observer = new MutationObserver(function (mutations) {
      var shouldRun = mutations.some(function (mutation) {
        if (!mutation.addedNodes || !mutation.addedNodes.length) return false;

        return Array.prototype.some.call(mutation.addedNodes, function (node) {
          if (!node || node.nodeType !== 1) return false;

          return (
            node.matches && (
              node.matches('.refinements') ||
              node.matches('.refinement') ||
              node.querySelector('.refinements') ||
              node.querySelector('.refinement')
            )
          );
        });
      });

      if (shouldRun) debouncedReorder();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window[TEST_ID + '_observer'] = observer;
  }

  function init() {
    if (!isTargetPage()) return;

    var start = Date.now();

    var poll = setInterval(function () {
      var hasFilters = document.querySelector('.refinements .refinement');

      if (hasFilters) {
        clearInterval(poll);
        reorderFilters();
        initObserver();
        return;
      }

      if (Date.now() - start > INIT_TIMEOUT_MS) {
        clearInterval(poll);
      }
    }, POLL_MS);
  }

  init();
})();
