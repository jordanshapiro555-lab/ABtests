<script>
(function () {
  var MODULE_ID = "gsi-target-hero-availability";
  var MAX_WAIT_MS = 15000;
  var RENDER_DEBOUNCE_MS = 75;

  var CONFIG = {
    heroRowSelector: ".gsi-school-hero__row",
    heroColOneSelector: ".gsi-school-hero__col-1",
    heroDefaultInsertAfterSelector: ".gsi-school-hero__programs-and-recognitions",
    cardSelector: ".gsi-image-card",
    cardContentSelector: ".gsi-image-card__content",
    cardTitleSelector: "h6",
    availabilitySelector: ".gsi-school-classroom-cards__availability",

    statusPriority: {
      available: 3,
      limited: 2,
      upcoming: 1
    },

    statusStyles: {
      available: {
        label: "Available",
        background: "#C9F7B7",
        color: "#006B2E",
        border: "1px solid #8AD66F"
      },
      limited: {
        label: "Limited",
        background: "#FFE77A",
        color: "#8A6500",
        border: "1px solid #E7C94C"
      },
      upcoming: {
        label: "Upcoming",
        background: "#FFE77A",
        color: "#8A6500",
        border: "1px solid #E7C94C"
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

  function getDisplayProgram(programName) {
    var normalized = normalizeText(programName);

    if (normalized === "first steps" || normalized === "toddlers" || normalized === "toddler") {
      return {
        key: "toddlers",
        label: "Toddlers",
        order: 2
      };
    }

    if (normalized === "twos" || normalized === "bridge") {
      return {
        key: "early-learning",
        label: "Early Learning",
        order: 3
      };
    }

    if (normalized === "infant") {
      return {
        key: "infant",
        label: "Infant",
        order: 1
      };
    }

    if (normalized === "preschool") {
      return {
        key: "preschool",
        label: "Preschool",
        order: 4
      };
    }

    if (normalized === "pre-k" || normalized === "pre k" || normalized === "prek") {
      return {
        key: "pre-k",
        label: "Pre-K",
        order: 5
      };
    }

    return {
      key: normalized,
      label: String(programName || "").replace(/\s+/g, " ").trim(),
      order: 99
    };
  }

  function getAvailabilityKey(availabilityEl) {
    if (!availabilityEl) return null;

    var classText = normalizeText(availabilityEl.className);
    var text = normalizeText(availabilityEl.textContent);

    if (classText.indexOf("available") > -1 || text === "available") {
      return "available";
    }

    if (classText.indexOf("limited") > -1 || text === "limited") {
      return "limited";
    }

    if (classText.indexOf("upcoming") > -1 || text === "upcoming") {
      return "upcoming";
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

      var rawProgramName = String(titleEl.textContent || "").replace(/\s+/g, " ").trim();
      if (!rawProgramName) return;

      var displayProgram = getDisplayProgram(rawProgramName);
      if (!displayProgram || !displayProgram.label) return;

      var statusKey = getAvailabilityKey(availabilityEl);
      if (!statusKey || !CONFIG.statusStyles[statusKey]) return;

      var status = CONFIG.statusStyles[statusKey];
      var priority = CONFIG.statusPriority[statusKey] || 0;

      /*
        For paired programs:
        - First Steps + Toddlers show as Toddlers
        - Twos + Bridge show as Early Learning

        If values differ, priority is:
        Available > Limited > Upcoming
      */
      if (!grouped[displayProgram.key] || priority > grouped[displayProgram.key].priority) {
        grouped[displayProgram.key] = {
          key: displayProgram.key,
          programName: displayProgram.label,
          statusKey: statusKey,
          statusLabel: status.label,
          badgeBackground: status.background,
          badgeColor: status.color,
          badgeBorder: status.border,
          order: displayProgram.order,
          priority: priority
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

  function getSignature(items) {
    return items
      .map(function (item) {
        return item.key + ":" + item.statusKey;
      })
      .join("|");
  }

  function createAvailabilityModule(items) {
    var root = document.createElement("section");
    root.id = MODULE_ID;
    root.setAttribute("aria-label", "Availability by program");
    root.setAttribute("data-gsi-availability-signature", getSignature(items));

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
        "min-height": "26px",
        "margin": "0 24px 10px 0",
        "padding": "0 24px 0 0",
        "border-right": index === items.length - 1 ? "0" : "1px solid rgba(0, 40, 86, 0.22)",
        "white-space": "nowrap",
        "color": "#002856",
        "font-family": "'Noto Sans', Arial, sans-serif"
      });

      var program = document.createElement("span");
      program.textContent = item.programName;

      setImportantStyles(program, {
        "display": "inline-block",
        "margin": "0 9px 0 0",
        "padding": "0",
        "color": "#002856",
        "font-family": "'Noto Sans', Arial, sans-serif",
        "font-size": "15px",
        "font-weight": "800",
        "line-height": "1.25"
      });

      var badge = document.createElement("span");
      badge.textContent = item.statusLabel.toUpperCase();

      setImportantStyles(badge, {
        "display": "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        "box-sizing": "border-box",
        "margin": "0",
        "padding": "2px 7px 3px 7px",
        "border-radius": "3px",
        "background": item.badgeBackground,
        "border": item.badgeBorder,
        "color": item.badgeColor,
        "font-family": "'Noto Sans', Arial, sans-serif",
        "font-size": "12px",
        "font-weight": "800",
        "line-height": "1",
        "letter-spacing": "0.03em",
        "text-transform": "uppercase",
        "vertical-align": "middle"
      });

      row.appendChild(program);
      row.appendChild(badge);
      list.appendChild(row);
    });

    root.appendChild(eyebrow);
    root.appendChild(list);

    return root;
  }

  function placeModule(root) {
    if (!root) return;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var heroRow = document.querySelector(CONFIG.heroRowSelector);
    var heroColOne = document.querySelector(CONFIG.heroColOneSelector);
    var defaultInsertAfter = document.querySelector(CONFIG.heroDefaultInsertAfterSelector);

    if (viewportWidth >= 1185 && viewportWidth <= 1297 && heroRow && heroRow.parentNode) {
      heroRow.parentNode.insertBefore(root, heroRow.nextSibling);
      root.setAttribute("data-gsi-placement", "below-row");
      return;
    }

    if (viewportWidth >= 840 && viewportWidth <= 1184 && heroColOne) {
      heroColOne.appendChild(root);
      root.setAttribute("data-gsi-placement", "right-of-col-one");
      return;
    }

    if (defaultInsertAfter && defaultInsertAfter.parentNode) {
      defaultInsertAfter.parentNode.insertBefore(root, defaultInsertAfter.nextSibling);
      root.setAttribute("data-gsi-placement", "default");
    }
  }

  function applyResponsiveStyles() {
    var root = document.getElementById(MODULE_ID);
    if (!root) return;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var isMobile = viewportWidth < 768;
    var isTabletRight = viewportWidth >= 840 && viewportWidth <= 1184;
    var isBelowRow = viewportWidth >= 1185 && viewportWidth <= 1297;

    var heroColOne = document.querySelector(CONFIG.heroColOneSelector);
    var list = root.querySelector("[data-gsi-availability-list]");
    var items = root.querySelectorAll("[data-gsi-availability-item]");

    placeModule(root);

    if (heroColOne && isTabletRight) {
      setImportantStyles(heroColOne, {
        "position": "relative"
      });
    }

    if (isTabletRight) {
      setImportantStyles(root, {
        "position": "absolute",
        "top": "32px",
        "right": "24px",
        "width": "43%",
        "max-width": "520px",
        "margin": "0",
        "padding": "0",
        "z-index": "2"
      });

      if (list) {
        setImportantStyles(list, {
          "display": "flex",
          "flex-direction": "column",
          "align-items": "flex-start",
          "justify-content": "flex-start",
          "flex-wrap": "nowrap",
          "gap": "10px"
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

      return;
    }

    if (isBelowRow) {
      setImportantStyles(root, {
        "position": "relative",
        "top": "auto",
        "right": "auto",
        "width": "auto",
        "max-width": "none",
        "margin": "18px 48px 0 48px",
        "padding": "0",
        "z-index": "1"
      });

      if (list) {
        setImportantStyles(list, {
          "display": "flex",
          "flex-direction": "row",
          "align-items": "center",
          "justify-content": "flex-start",
          "flex-wrap": "wrap",
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

      return;
    }

    if (isMobile) {
      setImportantStyles(root, {
        "position": "relative",
        "top": "auto",
        "right": "auto",
        "width": "100%",
        "max-width": "100%",
        "margin": "24px 0 0 0",
        "padding": "0",
        "z-index": "1"
      });

      if (list) {
        setImportantStyles(list, {
          "display": "flex",
          "flex-direction": "row",
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

      return;
    }

    setImportantStyles(root, {
      "position": "relative",
      "top": "auto",
      "right": "auto",
      "width": "100%",
      "max-width": "100%",
      "margin": "26px 0 0 0",
      "padding": "0",
      "z-index": "1"
    });

    if (list) {
      setImportantStyles(list, {
        "display": "flex",
        "flex-direction": "row",
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

  function renderAvailabilityModule() {
    var defaultInsertAfter = document.querySelector(CONFIG.heroDefaultInsertAfterSelector);
    var heroRow = document.querySelector(CONFIG.heroRowSelector);
    var heroColOne = document.querySelector(CONFIG.heroColOneSelector);

    if (!defaultInsertAfter && !heroRow && !heroColOne) return false;

    var items = collectAvailabilityItems();
    var existing = document.getElementById(MODULE_ID);

    if (!items.length) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return false;
    }

    var signature = getSignature(items);

    if (existing && existing.getAttribute("data-gsi-availability-signature") === signature) {
      applyResponsiveStyles();
      return true;
    }

    var module = createAvailabilityModule(items);

    if (existing && existing.parentNode) {
      existing.parentNode.replaceChild(module, existing);
    }

    placeModule(module);
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
</script>
