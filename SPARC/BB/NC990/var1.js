(function () {
  var POLL_INTERVAL = 100;
  var REFRESH_INTERVAL = 1000;

  var HIDE_REAL_CTA_CLASS = 'bb-hide-real-cta';
  var FAKE_CTA_CLASS = 'bb-scroll-size-cta';
  var SELECT_SIZE_CLASS = 'bb-scroll-size-cta--select-size';

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

  function triggerRealButtonClick(realButton) {
    if (!realButton) return;

    realButton.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
  }

  function bindFakeCta(fakeCta) {
    if (!fakeCta || fakeCta.dataset.bbBound === 'true') return;

    fakeCta.dataset.bbBound = 'true';

    fakeCta.addEventListener('click', function (e) {
      var realButton = getRealButton();

      e.preventDefault();
      e.stopPropagation();

      if (isRealButtonReady(realButton)) {
        triggerRealButtonClick(realButton);
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
        triggerRealButtonClick(realButton);
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
  var realButtonReady = isRealButtonReady(realButton);

  fakeCta.textContent = displayText;
  fakeCta.setAttribute('aria-label', displayText.trim());

  if (realButtonReady) {
    /*
      Safari-safe behavior:
      Once the product is add-to-bag-ready, restore the real native button
      and hide the fake div CTA. This lets Safari use the site's native
      add-to-cart handler directly.
    */
    realButton.classList.remove(HIDE_REAL_CTA_CLASS);

    fakeCta.classList.add('bb-hide-fake-cta');
    fakeCta.setAttribute('aria-hidden', 'true');
    fakeCta.setAttribute('tabindex', '-1');
  } else {
    /*
      Pre-size-selection behavior:
      Keep the real native button hidden and show the fake CTA.
      This prevents premature clicks/events on:
      button[data-add-enabled], button.product-add__button.add-to-cart
    */
    realButton.classList.add(HIDE_REAL_CTA_CLASS);

    fakeCta.classList.remove('bb-hide-fake-cta');
    fakeCta.setAttribute('aria-hidden', 'false');
    fakeCta.setAttribute('tabindex', '0');
  }

  if (normalizedText === 'select a size') {
    fakeCta.classList.add(SELECT_SIZE_CLASS);
  } else {
    fakeCta.classList.remove(SELECT_SIZE_CLASS);
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
  }

  var initTimer = setInterval(function () {
    if (getWrapper() && getRealButton() && getButtonRow()) {
      clearInterval(initTimer);

      runVariation();

      if (!refreshTimer) {
        refreshTimer = setInterval(runVariation, REFRESH_INTERVAL);
      }
    }
  }, POLL_INTERVAL);
})();
