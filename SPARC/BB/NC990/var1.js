(function () {
  var POLL_INTERVAL = 100;
  var REFRESH_INTERVAL = 750;
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

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function bindFakeCta(fakeCta) {
    if (!fakeCta || fakeCta.dataset.bbBound === 'true') return;

    fakeCta.dataset.bbBound = 'true';

    fakeCta.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      scrollToAttributeTarget();
    });

    fakeCta.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();
      e.stopPropagation();
      scrollToAttributeTarget();
    });
  }

  function removeFakeCta(realButton) {
    var fakeCta = document.querySelector('.' + FAKE_CTA_CLASS);

    if (fakeCta) {
      fakeCta.remove();
    }

    if (realButton) {
      realButton.classList.remove(HIDE_REAL_CTA_CLASS);
    }
  }

  function createOrUpdateFakeCta(realButton) {
    var row = getButtonRow();
    var wishlistButton = getWishlistButton();

    if (!realButton || !row) return;

    if (isRealButtonReady(realButton)) {
      removeFakeCta(realButton);
      return;
    }

    var fakeCta = document.querySelector('.' + FAKE_CTA_CLASS);

    if (!fakeCta) {
      fakeCta = document.createElement('div');
      fakeCta.className = FAKE_CTA_CLASS;
      fakeCta.setAttribute('role', 'button');
      fakeCta.setAttribute('tabindex', '0');
      fakeCta.setAttribute('data-bb-scroll-only-cta', 'true');

      if (wishlistButton && wishlistButton.parentNode === row) {
        row.insertBefore(fakeCta, wishlistButton);
      } else {
        row.appendChild(fakeCta);
      }

      bindFakeCta(fakeCta);
    }

    fakeCta.textContent = getDisplayText(realButton);
    fakeCta.setAttribute('aria-label', fakeCta.textContent.trim());

    realButton.classList.add(HIDE_REAL_CTA_CLASS);
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

  function removeOldScrollCtaClassElement() {
    var oldFake = document.querySelector('.product-add__button-scroll');

    if (oldFake && oldFake.getAttribute('data-bb-scroll-only-cta') !== 'true') {
      oldFake.remove();
    }
  }

  function runVariation() {
    var wrapper = getWrapper();
    var realButton = getRealButton();

    if (!wrapper || !realButton) return;

    wrapper.classList.add('product-add__wrapper--show');

    removeOldScrollCtaClassElement();
    guardRealButton(realButton);
    createOrUpdateFakeCta(realButton);
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
