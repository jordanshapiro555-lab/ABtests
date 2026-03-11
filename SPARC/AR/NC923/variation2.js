(function () {
  var CHECKOUT_BASE = "https://www.aeropostale.com/checkout/";
  var SUBMITTED_SELECTOR = ".product-quickadd.submitted";
  var VIEW_BAG_CONTAINER_SELECTOR = ".product-add-to-cart.product-view-bag";
  var VIEW_BAG_LINK_SELECTOR = "a.view-bag";

  var WRAP_CLASS = "optly-cta-row";
  var CHECKOUT_CLASS = "optly-checkout-btn";

  function getCheckoutHref() {
    // Preserve Optimizely preview hash if present
    return CHECKOUT_BASE + (window.location.hash || "");
  }

  function buildTwoButtonLayout(root) {
    var container = root.querySelector(VIEW_BAG_CONTAINER_SELECTOR);
    if (!container) return false;

    // Already processed
    if (container.querySelector("." + WRAP_CLASS)) return true;

    var viewBag = container.querySelector(VIEW_BAG_LINK_SELECTOR);
    if (!viewBag) return false;

    // Clone View Bag EXACTLY
    var checkout = viewBag.cloneNode(true);

    // Update content
    checkout.textContent = "Checkout";
    checkout.title = "Checkout";
    checkout.href = getCheckoutHref();

    // Apply ONLY your 3 style changes
    checkout.style.backgroundColor = "#005eb8";
    checkout.style.borderColor = "#005eb8";
    checkout.style.color = "#fff";

    checkout.classList.add(CHECKOUT_CLASS);

    // Create flex wrapper
    var row = document.createElement("div");
    row.className = WRAP_CLASS;
    row.style.display = "flex";
    row.style.gap = "16px";

    // Move existing View Bag and add Checkout
    row.appendChild(viewBag);
    row.appendChild(checkout);

    // Clear container and insert row
    container.innerHTML = "";
    container.appendChild(row);

    return true;
  }

  function run() {
    var submitted = document.querySelectorAll(SUBMITTED_SELECTOR);
    submitted.forEach(function (root) {
      buildTwoButtonLayout(root);
    });
  }

  // Initial run
  run();

  // Retry for async render
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    run();
    if (tries >= 80) clearInterval(iv);
  }, 200);

  // Observe full document so it works for multiple adds
  var mo = new MutationObserver(function () {
    run();
  });

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
})();
