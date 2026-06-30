<script>
(function () {
  var IMG_SELECTOR = 'img.cmp-image__image[alt="Student graduating"]';
  var SRC_MATCH = 'Infant_DSC3526_05-17-2026-Edit_rt1_HR';

  var MAX_WAIT_MS = 8000;
  var CHECK_INTERVAL_MS = 100;
  var startedAt = Date.now();

  function updateImageStyle() {
    var images = document.querySelectorAll(IMG_SELECTOR);

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (img.src && img.src.indexOf(SRC_MATCH) > -1) {
        img.style.setProperty('object-position', 'right', 'important');
        return true;
      }
    }

    return false;
  }

  function init() {
    var updated = updateImageStyle();

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
