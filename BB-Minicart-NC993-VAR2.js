(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var msgSel = '.utility-overlay__footer-message';
  var doneAttr = 'data-complimentary-shipping';

  function apply(root) {
    var overlay = (root || document).querySelector(overlaySel);
    if (!overlay) return;

    var msg = overlay.querySelector(msgSel);
    if (!msg || msg.getAttribute(doneAttr) === '1') return;

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

    // Tiny inline SVG check (kept very short)
    icon.innerHTML =
      '<svg viewBox="0 0 16 16" width="12" height="12" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
      '</svg>';

    var title = document.createElement('div');
    title.textContent = 'Shipping: Complimentary';
    title.style.color = '#1B2A41'; // navy
    title.style.fontWeight = '600';
    title.style.letterSpacing = '0.01em';

    row.appendChild(icon);
    row.appendChild(title);

    // Subtext
    var sub = document.createElement('div');
    sub.textContent = 'Taxes calculated at checkout';
    sub.style.marginLeft = '28px'; // aligns under title, not icon
    sub.style.marginTop = '2px';
    sub.style.color = '#6B7280'; // gray
    sub.style.fontSize = '0.875em';
    sub.style.lineHeight = '1.25';

    wrap.appendChild(row);
    wrap.appendChild(sub);

    msg.appendChild(wrap);
    msg.setAttribute(doneAttr, '1');
  }

  // Run once
  apply(document);

  // Re-apply on minicart re-render (very lightweight observer)
  var obs = new MutationObserver(function () {
    apply(document);
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
