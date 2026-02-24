(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var msgSel = '.utility-overlay__footer-message';
  var totalSel = '[data-totals-component="value"]';
  var doneAttr = 'data-complimentary-shipping';
  var THRESHOLD = 200;

  function getTotalValue() {
    var el = document.querySelector(totalSel);
    if (!el) return 0;

    var text = el.textContent || '';
    var numeric = text.replace(/[^0-9.]/g, '');
    return parseFloat(numeric) || 0;
  }

  function apply(root) {
    var overlay = (root || document).querySelector(overlaySel);
    if (!overlay) return;

    var msg = overlay.querySelector(msgSel);
    if (!msg) return;

    var total = getTotalValue();
    var alreadyApplied = msg.getAttribute(doneAttr) === '1';

    // If total is below threshold, remove custom message and reset
    if (total < THRESHOLD) {
      if (alreadyApplied) {
        msg.removeAttribute(doneAttr);
        msg.innerHTML = ''; // or restore default text if needed
      }
      return;
    }

    // If already injected and still valid, do nothing
    if (alreadyApplied) return;

    // Clear only the shipping/tax message line area
    while (msg.firstChild) msg.removeChild(msg.firstChild);

    // Wrapper
    var wrap = document.createElement('div');
    wrap.style.display = 'block';

    // Row: icon + "Shipping: Complimentary"
    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'flex-start';
    row.style.gap = '10px';

    var icon = document.createElement('span');
    icon.style.width = '18px';
    icon.style.height = '18px';
    icon.style.borderRadius = '999px';
    icon.style.background = '#C6A24A'; // gold
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.marginTop = '2px';
    icon.setAttribute('aria-hidden', 'true');

    icon.innerHTML =
      '<svg viewBox="0 0 16 16" width="12" height="12" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
      '</svg>';

    var title = document.createElement('div');
    title.textContent = 'Standard Shipping: Complimentary';
    title.style.color = '#1B2A41';
    title.style.fontWeight = '600';
    title.style.letterSpacing = '0.01em';

    row.appendChild(icon);
    row.appendChild(title);

    // Subtext
    var sub = document.createElement('div');
    sub.textContent = 'Taxes calculated at checkout';
    sub.style.marginLeft = '28px';
    sub.style.marginTop = '2px';
    sub.style.color = '#6B7280';
    sub.style.fontSize = '0.875em';
    sub.style.lineHeight = '1.25';

    wrap.appendChild(row);
    wrap.appendChild(sub);

    msg.appendChild(wrap);
    msg.setAttribute(doneAttr, '1');
  }

  // Run once
  apply(document);

  // Re-apply on minicart re-render
  var obs = new MutationObserver(function () {
    apply(document);
  });

  obs.observe(document.body, { childList: true, subtree: true });
})();
