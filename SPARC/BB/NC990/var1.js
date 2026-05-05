(function () {
  var POLL_INTERVAL = 100;
  var REFRESH_INTERVAL = 1000;

  var HIDE_REAL_CTA_CLASS = 'bb-hide-real-cta';
  var FAKE_CTA_CLASS = 'bb-scroll-size-cta';

  var refreshTimer = null;

  function getWrapper() {
    return document.querySelector('.product-add__wrapper');
  }

  function getRealButton() {
    return document.querySelector('.product-add__button.add-to-cart');
  }

  function getButtonRow() {
    return document.querySelector('.product-add__container.cart-and-ipay > .flex');
  }

  function getWishlistButton() {
    return document.querySelector('.product-add__container.cart-and-ipay .button--wishlist');
  }

  function getFakeCta() {
    return document.querySelector('.' + FAKE_CTA_CLASS);
  }

  function getButtonText(button) {
    return ((button && button.textContent) || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function getDisplayText(button) {
    var text = ((button && button.textContent) || '')
      .replace(/\s+/g, ' ')
      .trim();

    return text || button.getAttribute('data-disabled-text') || 'Select A Size';
  }

  function getAttributeTarget() {
    return document.querySelector(
      '.product-attribute.product-attribute__swatches.product-attribute--Size, ' +
      '.product-attribute--Size, ' +
      '.product-attribute.product-attribute__swatches.product-attribute--Color, ' +
      '.product-attribute--Color'
    );
  }

  function isRealButtonReady(button) {
    if (!button) return false;

    return (
      getButtonText(button) === 'add to bag' &&
      !button.disabled &&
      !button.hasAttribute('disabled')
    );
  }

  function scrollToAttributeTarget() {
    var target = getAttributeTarget();
    if (!target) return;

    var targetY = target.getBoundingClientRect().top + window.pageYOffset - 100;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }

  function bindFakeCta(fakeCta) {
    if (!fakeCta || fakeCta.dataset.bbBound === 'true') return;

    fakeCta.dataset.bbBound = 'true';

    fakeCta.addEventListener('click', function (e) {
      var realButton = getRealButton();

      e.preventDefault();
      e.stopPropagation();

      if (isRealButtonReady(realButton)) {
        realButton.click();
        return;
      }

      scrollToAttributeTarget();
    });

    fakeCta.addEventListener('keydown', function (e) {
      var realButton = getRealButton();

      if (e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();
      e.stopPropagation();

      if (isRealButtonReady(realButton)) {
        realButton.click();
        return;
      }

      scrollToAttributeTarget();
    });
  }

  function removeOldVariationCta() {
    var oldFake = document.querySelector('.product-add__button-scroll');

    if (oldFake) {
      oldFake.remove();
    }
  }

  function createFakeCtaIfNeeded(realButton) {
    var row = getButtonRow();
    var wishlistButton = getWishlistButton();
    var fakeCta = getFakeCta();

    if (!realButton || !row) return null;

    if (!fakeCta) {
      fakeCta = document.createElement('div');
      fakeCta.className = FAKE_CTA_CLASS;
      fakeCta.setAttribute('role', 'button');
      fakeCta.setAttribute('tabindex', '0');
      fakeCta.setAttribute('aria-hidden', 'false');
      fakeCta.setAttribute('data-bb-scroll-only-cta', 'true');

      if (wishlistButton && wishlistButton.parentNode === row) {
        row.insertBefore(fakeCta, wishlistButton);
      } else {
        row.appendChild(fakeCta);
      }

      bindFakeCta(fakeCta);
    }

var displayText = getDisplayText(realButton);
var normalizedText = displayText.replace(/\s+/g, ' ').trim().toLowerCase();

fakeCta.textContent = displayText;
fakeCta.setAttribute('aria-label', displayText.trim());
fakeCta.setAttribute('aria-hidden', 'false');
fakeCta.setAttribute('tabindex', '0');

if (normalizedText === 'select a size') {
  fakeCta.classList.add('bb-scroll-size-cta--select-size');
} else {
  fakeCta.classList.remove('bb-scroll-size-cta--select-size');
}
    
    return fakeCta;
  }

  function guardRealButton(realButton) {
    if (!realButton || realButton.dataset.bbGuardBound === 'true') return;

    realButton.dataset.bbGuardBound = 'true';

    realButton.addEventListener(
      'click',
      function (e) {
        if (isRealButtonReady(realButton)) return;

        e.preventDefault();
        e.stopPropagation();

        scrollToAttributeTarget();
      },
      true
    );
  }

  function lockWrapperVisible(wrapper) {
    if (!wrapper) return;

    /*
      Do not depend on product-add__wrapper--show.
      The CSS below keeps the base wrapper visible.
    */
    wrapper.style.display = 'block';
    wrapper.style.visibility = 'visible';
    wrapper.style.opacity = '1';
    wrapper.style.transform = 'none';
    wrapper.style.pointerEvents = 'auto';
  }

  function runVariation() {
    var wrapper = getWrapper();
    var realButton = getRealButton();

    if (!wrapper || !realButton || !getButtonRow()) return;

    lockWrapperVisible(wrapper);
    removeOldVariationCta();
    guardRealButton(realButton);
    createFakeCtaIfNeeded(realButton);

    realButton.classList.add(HIDE_REAL_CTA_CLASS);
  }

  var initTimer = setInterval(function () {
    if (getWrapper() && getRealButton() && getButtonRow()) {
      clearInterval(initTimer);

      runVariation();

      /*
        Lower-frequency sync only.
        The wrapper visibility is handled by CSS now, so we avoid fighting
        the site’s scroll logic every few hundred milliseconds.
      */
      if (!refreshTimer) {
        refreshTimer = setInterval(runVariation, REFRESH_INTERVAL);
      }
    }
  }, POLL_INTERVAL);
})();
