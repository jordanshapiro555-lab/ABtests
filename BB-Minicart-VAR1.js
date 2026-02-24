(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var headerSel = '.utility-overlay__header';
  var titleRowSel = '.utility-overlay__header .flex';
  var bannerId = 'bb-complimentary-ship-banner';

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = bannerId;

    var frame = document.createElement('div');
    frame.className = 'bb-frame';
    banner.appendChild(frame);

    var icon = document.createElement('span');
    icon.className = 'bb-ic';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
      '</svg>';

    var textWrap = document.createElement('div');

    var headline = document.createElement('p');
    headline.className = 'bb-ttl';
    headline.textContent = "You’ve Earned Complimentary Shipping.";

    var sub = document.createElement('p');
    sub.className = 'bb-sub';
    sub.textContent = "Standard shipping has been applied to your order.";

    textWrap.appendChild(headline);
    textWrap.appendChild(sub);

    banner.appendChild(icon);
    banner.appendChild(textWrap);

    return banner;
  }

  function insertBanner() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return;

    var header = overlay.querySelector(headerSel);
    if (!header) return;

    if (header.querySelector('#' + bannerId)) return;

    var titleRow = overlay.querySelector(titleRowSel);
    var banner = buildBanner();

    if (titleRow && titleRow.parentNode === header) {
      header.insertBefore(banner, titleRow.nextSibling);
    } else {
      header.appendChild(banner);
    }

    // Match header left/right padding for proper inset alignment
    var cs = window.getComputedStyle(header);
    banner.style.marginLeft = cs.paddingLeft;
    banner.style.marginRight = cs.paddingRight;
  }

  insertBanner();

  var obs = new MutationObserver(function () {
    insertBanner();
  });

  obs.observe(document.body, { childList: true, subtree: true });
})();
