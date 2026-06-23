(function () {
  var MODULE_ID = "gsi-target-hero-availability";
  var MAX_WAIT_MS = 15000;
  var RENDER_DEBOUNCE_MS = 75;

  var CONFIG = {
    heroInsertAfterSelector: ".gsi-school-hero__programs-and-recognitions",
    cardSelector: ".gsi-image-card",
    cardContentSelector: ".gsi-image-card__content",
    cardTitleSelector: "h6",
    availabilitySelector: ".gsi-school-classroom-cards__availability",

    /*
      The comp shows four Hero-level program categories:
      Infant Daycare, Toddler Daycare, Early Learning Care, Preschool.

      Pre-K is intentionally not shown as its own Hero flag here.
      To surface Pre-K separately, add:
      { key: "pre-k", label: "Pre-K", programs: ["pre-k", "pre k"] }
    */
    programGroups: [
      { key: "infant-daycare", label: "Infant Daycare", programs: ["infant"] },
      { key: "toddler-daycare", label: "Toddler Daycare", programs: ["first steps", "toddlers", "toddler"] },
      { key: "early-learning-care", label: "Early Learning Care", programs: ["twos", "bridge"] },
      { key: "preschool", label: "Preschool", programs: ["preschool"] }
    ],

    statusStyles: {
      available: {
        label: "Available",
        color: "#35A852"
      },
      limited: {
        label: "Limited",
        color: "#FFC20E"
      },
      upcoming: {
        label: "Upcoming",
        color: "#4F7BFF"
      }
    }
  };

  var startedAt = Date.now();
  var renderTimer = null;
  var observer = null;
  var pollTimer = null;

  function setImportantStyles(el, styles) {
    Object.keys(styles).forEach(function (prop) {
      el.style.setProperty(prop, styles[prop], "important");
    });
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getProgramGroup(programName) {
    var normalized = normalizeText(programName);

    for (var i = 0; i < CONFIG.programGroups.length; i += 1) {
      var group = CONFIG.programGroups[i];

      for (var j = 0; j < group.programs.length; j += 1) {
        if (normalized === group.programs[j]) {
          return {
            key: group.key,
            label: group.label,
            order: i
          };
        }
      }
    }

    return null;
  }

  function getAvailabilityStatus(availabilityEl) {
    if (!availabilityEl) return null;

    var classText = normalizeText(availabilityEl.className);
    var text = normalizeText(availabilityEl.textContent);

    if (classText.indexOf("available") > -1 || text === "available") {
      return CONFIG.statusStyles.available;
    }

    if (classText.indexOf("limited") > -1 || text === "limited") {
      return CONFIG.statusStyles.limited;
    }

    if (classText.indexOf("upcoming") > -1 || text === "upcoming") {
      return CONFIG.statusStyles.upcoming;
    }

    return null;
  }

  function collectAvailabilityItems() {
    var cards = document.querySelectorAll(CONFIG.cardSelector);
    var grouped = {};

    Array.prototype.forEach.call(cards, function (card) {
      var content = card.querySelector(CONFIG.cardContentSelector);
      if (!content) return;

      var availabilityEl = content.querySelector(CONFIG.availabilitySelector);
      if (!availabilityEl) return;

      var titleEl = content.querySelector(CONFIG.cardTitleSelector);
      if (!titleEl) return;

      var group = getProgramGroup(titleEl.textContent);
      if (!group) return;

      var status = getAvailabilityStatus(availabilityEl);
      if (!status) return;

      /*
        If multiple classroom cards roll up to the same Hero program,
        the first available card in page order wins.
      */
      if (!grouped[group.key]) {
        grouped[group.key] = {
          key: group.key,
          label: group.label,
          statusLabel: status.label,
          dotColor: status.color,
          order: group.order
        };
      }
    });

    return Object.keys(grouped)
      .map(function (key) {
        return grouped[key];
      })
      .sort(function (a, b) {
        return a.order - b.order;
      });
  }

  function createAvailabilityModule(items) {
    var root = document.createElement("section");
    root.id = MODULE_ID;
    root.setAttribute("aria-label", "Availability by program");
    root.setAttribute(
      "data-gsi-availability-signature",
      items
        .map(function (item) {
          return item.key + ":" + item.statusLabel;
        })
        .join("|")
    );

    setImportantStyles(root, {
      "display": "block",
      "width": "100%",
      "max-width": "100%",
      "box-sizing": "border-box",
      "margin": "26px 0 0 0",
      "padding": "0",
      "background": "transparent",
      "color": "#002856",
      "font-family": "'Noto Sans', Arial, sans-serif",
      "font-style": "normal",
      "text-align": "left",
      "position": "relative",
      "z-index": "1"
    });

    var eyebrow = document.createElement("div");
    eyebrow.textContent = "Availability by Program";

    setImportantStyles(eyebrow, {
      "display": "block",
      "margin": "0 0 14px 0",
      "padding": "0",
      "color": "#002856",
      "font-family": "'Noto Sans', Arial, sans-serif",
      "font-size": "13px",
      "font-weight": "800",
      "line-height": "1.2",
      "letter-spacing": "0.08em",
      "text-transform": "uppercase"
    });

    var list = document.createElement("div");
    list.setAttribute("role", "list");
    list.setAttribute("data-gsi-availability-list", "true");

    setImportantStyles(list, {
      "display": "flex",
      "align-items": "center",
      "justify-content": "flex-start",
      "flex-wrap": "wrap",
      "gap": "0",
      "margin": "0",
      "padding": "0",
      "list-style": "none"
    });

    items.forEach(function (item, index) {
      var row = document.createElement("div");
      row.setAttribute("role", "listitem");
      row.setAttribute("data-gsi-availability-item", "true");

      setImportantStyles(row, {
        "display": "flex",
        "align-items": "center",
        "justify-content": "flex-start",
        "box-sizing": "border-box",
        "min-height": "24px",
        "margin": "0 24px 10px 0",
        "padding": "0 24px 0 0",
        "border-right": index === items.length - 1 ? "0" : "1px solid rgba(0, 40, 86, 0.22)",
        "white-space": "nowrap",
        "color": "#002856",
        "font-family": "'Noto Sans', Arial, sans-serif"
      });

      var program = document.createElement("span");
      program.textContent = item.label;

      setImportantStyles(program, {
        "display": "inline-block",
        "margin": "0",
        "padding": "0",
        "color": "#002856",
        "font-family": "'Noto Sans', Arial, sans-serif",
        "font-size": "15px",
        "font-weight": "800",
        "line-height": "1.25"
      });

      var dot = document.createElement("span");
      dot.setAttribute("aria-hidden", "true");

      setImportantStyles(dot, {
        "display": "inline-block",
        "width": "8px",
        "height": "8px",
        "min-width": "8px",
        "min-height": "8px",
        "margin": "0 9px",
        "padding": "0",
        "border-radius": "999px",
        "background": item.dotColor,
        "vertical-align": "middle"
      });

      var status = document.createElement("span");
      status.textContent = item.statusLabel;

      setImportantStyles(status, {
        "display": "inline-block",
        "margin": "0",
        "padding": "0",
        "color": "#002856",
        "font-family": "'Noto Sans', Arial, sans-serif",
        "font-size": "14px",
        "font-weight": "700",
        "line-height": "1.25"
      });

      row.appendChild(program);
      row.appendChild(dot);
      row.appendChild(status);
      list.appendChild(row);
    });

    root.appendChild(eyebrow);
    root.appendChild(list);

    return root;
  }

  function applyResponsiveStyles() {
    var root = document.getElementById(MODULE_ID);
    if (!root) return;

    var isMobile = window.matchMedia("(max-width: 767px)").matches;
    var list = root.querySelector("[data-gsi-availability-list]");
    var items = root.querySelectorAll("[data-gsi-availability-item]");

    if (isMobile) {
      setImportantStyles(root, {
        "margin": "24px 0 0 0",
        "padding": "0"
      });

      if (list) {
        setImportantStyles(list, {
          "display": "flex",
          "flex-wrap": "wrap",
          "align-items": "center",
          "justify-content": "flex-start",
          "column-gap": "18px",
          "row-gap": "10px"
        });
      }

      Array.prototype.forEach.call(items, function (item) {
        setImportantStyles(item, {
          "margin": "0",
          "padding": "0",
          "border-right": "0",
          "white-space": "nowrap"
        });
      });
    } else {
      if (list) {
        setImportantStyles(list, {
          "display": "flex",
          "flex-wrap": "wrap",
          "align-items": "center",
          "justify-content": "flex-start",
          "gap": "0"
        });
      }

      Array.prototype.forEach.call(items, function (item, index) {
        setImportantStyles(item, {
          "margin": "0 24px 10px 0",
          "padding": "0 24px 0 0",
          "border-right": index === items.length - 1 ? "0" : "1px solid rgba(0, 40, 86, 0.22)",
          "white-space": "nowrap"
        });
      });
    }
  }

  function renderAvailabilityModule() {
    var insertAfterEl = document.querySelector(CONFIG.heroInsertAfterSelector);
    if (!insertAfterEl) return false;

    var items = collectAvailabilityItems();
    var existing = document.getElementById(MODULE_ID);

    if (!items.length) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return false;
    }

    var signature = items
      .map(function (item) {
        return item.key + ":" + item.statusLabel;
      })
      .join("|");

    if (existing && existing.getAttribute("data-gsi-availability-signature") === signature) {
      applyResponsiveStyles();
      return true;
    }

    var module = createAvailabilityModule(items);

    if (existing && existing.parentNode) {
      existing.parentNode.replaceChild(module, existing);
    } else if (insertAfterEl.parentNode) {
      insertAfterEl.parentNode.insertBefore(module, insertAfterEl.nextSibling);
    }

    applyResponsiveStyles();
    return true;
  }

  function scheduleRender() {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderAvailabilityModule, RENDER_DEBOUNCE_MS);
  }

  function init() {
    renderAvailabilityModule();

    pollTimer = window.setInterval(function () {
      renderAvailabilityModule();

      if (Date.now() - startedAt > MAX_WAIT_MS) {
        window.clearInterval(pollTimer);
      }
    }, 300);

    if (window.MutationObserver && document.body) {
      observer = new MutationObserver(function () {
        if (Date.now() - startedAt <= MAX_WAIT_MS || document.getElementById(MODULE_ID)) {
          scheduleRender();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      window.setTimeout(function () {
        if (observer) {
          observer.disconnect();
        }
      }, MAX_WAIT_MS);
    }

    window.addEventListener("resize", function () {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(applyResponsiveStyles, 100);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
