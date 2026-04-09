(function () {

  function attachScrollToButton() {
    var button = document.querySelector('.product-add__button');
    if (!button) return;

    if (button.dataset.scrollBound === 'true') return;
    button.dataset.scrollBound = 'true';

    button.addEventListener('click', function (e) {

      var text = button.textContent.trim().toLowerCase();
      if (text === 'add to bag') return;

      if (!button.disabled) return;

      e.preventDefault();
      e.stopPropagation();

      var target = document.querySelector('.product-attribute.product-attribute__swatches.product-attribute--Color');
      if (!target) return;

    });
  }

  function forceStickyBar() {
    var wrapper = document.querySelector('.product-add__wrapper');
    if (!wrapper) return;

    wrapper.classList.add('product-add__wrapper--show');

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === 'class') {
          if (!wrapper.classList.contains('product-add__wrapper--show')) {
            wrapper.classList.add('product-add__wrapper--show');
          }
        }
      });
    });

    observer.observe(wrapper, { attributes: true });

    attachScrollToButton();
  }

  var interval = setInterval(function () {
    var el = document.querySelector('.product-add__wrapper');
    if (el) {
      clearInterval(interval);
      forceStickyBar();

      setInterval(function () {
        attachScrollToButton();
        enhanceAddToCartButton();
      }, 500);
    }
  }, 100);

  function enhanceAddToCartButton() {

    var fakeButton = document.querySelector('.product-add__button-scroll');
    if (fakeButton) {
      fakeButton.remove();
    }

    var button = document.querySelector('.product-add__button');
    if (!button) return;

    if (button.hasAttribute('disabled')) {
      button.removeAttribute('disabled');
    }

    if (button.dataset.customScrollBound === 'true') return;
    button.dataset.customScrollBound = 'true';

    var colorSection = document.querySelector('.product-attribute--Color');

    button.addEventListener('click', function () {

      var text = button.textContent.trim().toLowerCase();
      if (text === 'add to bag') return;

      if (!colorSection) return;

      setTimeout(function () {
        colorSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 200);

    });

  }

})();
