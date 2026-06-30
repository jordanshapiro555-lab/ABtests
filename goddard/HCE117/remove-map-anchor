<script>
(function () {
  var MARKER_SELECTOR = '.gsi-school-locator__marker.mapboxgl-marker';
  var RESTORE_THRESHOLD_PX = 20;

  var lastMarkerClick = null;
  var restoreTimer = null;
  var isRestoring = false;

  function isMarkerClick(event) {
    return !!(
      event &&
      event.target &&
      event.target.closest &&
      event.target.closest(MARKER_SELECTOR)
    );
  }

  function getCleanUrlWithHash(hash) {
    return window.location.pathname + window.location.search + (hash || '');
  }

  function captureMarkerClickState(event) {
    if (!isMarkerClick(event)) {
      return;
    }

    lastMarkerClick = {
      scrollX: window.pageXOffset || document.documentElement.scrollLeft || 0,
      scrollY: window.pageYOffset || document.documentElement.scrollTop || 0,
      hash: window.location.hash || '',
      url: window.location.pathname + window.location.search + (window.location.hash || ''),
      time: Date.now()
    };
  }

  function restoreMarkerClickScroll() {
    if (!lastMarkerClick || isRestoring) {
      return;
    }

    var currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var currentHash = window.location.hash || '';
    var scrollChanged = Math.abs(currentScrollY - lastMarkerClick.scrollY) > RESTORE_THRESHOLD_PX;
    var hashChanged = currentHash !== lastMarkerClick.hash;

    if (!scrollChanged && !hashChanged) {
      return;
    }

    isRestoring = true;

    if (hashChanged && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', getCleanUrlWithHash(lastMarkerClick.hash));
    }

    window.scrollTo({
      top: lastMarkerClick.scrollY,
      left: lastMarkerClick.scrollX,
      behavior: 'auto'
    });

    window.setTimeout(function () {
      isRestoring = false;
    }, 50);
  }

  function scheduleRestore() {
    clearTimeout(restoreTimer);

    window.requestAnimationFrame(function () {
      restoreMarkerClickScroll();

      window.requestAnimationFrame(function () {
        restoreMarkerClickScroll();
      });
    });

    restoreTimer = window.setTimeout(function () {
      restoreMarkerClickScroll();
    }, 150);
  }

  document.addEventListener('pointerdown', function (event) {
    captureMarkerClickState(event);
  }, true);

  document.addEventListener('click', function (event) {
    if (!isMarkerClick(event)) {
      return;
    }

    captureMarkerClickState(event);
    scheduleRestore();
  }, true);

  window.addEventListener('hashchange', function () {
    if (lastMarkerClick && Date.now() - lastMarkerClick.time < 1000) {
      scheduleRestore();
    }
  });
})();
</script>
