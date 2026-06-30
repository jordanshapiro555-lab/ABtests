<script>
(function () {
  var CARD_IDS = [
    'icon-card-2094651030',
    'icon-card-2094651029',
    'icon-card-2094651028'
  ];

  var CTA_ID = 'teaser-924a5c7723-cta-90ff6ab598';
  var TARGET_ID = 'text-402f4cbf33';
  var OFFSET_PX = 50;

  var INSERTED_CONTAINER_ATTR = 'data-gsi-icon-cards-cta';
  var MAX_WAIT_MS = 8000;
  var CHECK_INTERVAL_MS = 100;
  var startedAt = Date.now();

  function getIconCardsModule() {
    for (var i = 0; i < CARD_IDS.length; i++) {
      var card = document.getElementById(CARD_IDS[i]);

      if (card) {
        return card.closest('.gsi-icon-cards');
      }
    }

    return null;
  }

  function getTarget() {
    return document.getElementById(TARGET_ID);
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

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + TARGET_ID);
    }
  }

  function buildCtaContainer() {
    var container = document.createElement('div');
    container.className = 'cmp-teaser__action-container';
    container.setAttribute(INSERTED_CONTAINER_ATTR, 'true');

    var anchor = document.createElement('a');
    anchor.className = 'cmp-teaser__action-link cmp-button';
    anchor.id = CTA_ID;
    anchor.href = '#' + TARGET_ID;
    anchor.setAttribute('data-gsi-offset-anchor-bound', 'true');

    var span = document.createElement('span');
    span.className = 'cmp-button__text';
    span.textContent = 'Find a School Near You';

    anchor.appendChild(span);
    container.appendChild(anchor);

    anchor.addEventListener('click', function (event) {
      event.preventDefault();
      scrollToTargetWithOffset();
    });

    return container;
  }

  function updateIconCards() {
    var module = getIconCardsModule();
    var target = getTarget();

    if (!module || !target) {
      return false;
    }

    target.style.setProperty('scroll-margin-top', OFFSET_PX + 'px', 'important');

    var existingInsertedContainer = module.querySelector('[' + INSERTED_CONTAINER_ATTR + '="true"]');

    if (!existingInsertedContainer) {
      module.appendChild(buildCtaContainer());
    }

    return true;
  }

  function init() {
    var updated = updateIconCards();

    if (!updated && Date.now() - startedAt < MAX_WAIT_MS) {
      setTimeout(init, CHECK_INTERVAL_MS);
    }
  }

  var observer = new MutationObserver(function () {
    updateIconCards();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
