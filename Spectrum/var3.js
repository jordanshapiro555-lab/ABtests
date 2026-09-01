<script id="exp-spectrum-no-contracts-badge" type="html/js">
    (function () {
  'use strict';

  var BADGE_ID = 'exp-spectrum-no-contracts-badge-element';


  /* =========================================================
     HELPERS
     ========================================================= */

  function setStyle(el, prop, value) {
    if (!el) return;

    el.style.setProperty(
      prop,
      value,
      'important'
    );
  }


  function getWidth() {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      1200
    );
  }


  /* =========================================================
     ICONS
     ========================================================= */

  function createContractsIcon() {
    var wrap = document.createElement('div');

    wrap.innerHTML =
      '<svg viewBox="0 0 32 32" ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'width="24" height="24" ' +
      'fill="none" ' +
      'stroke="#0037ff" ' +
      'stroke-width="2" ' +
      'stroke-linecap="round" ' +
      'stroke-linejoin="round" ' +
      'aria-hidden="true">' +

        '<path d="M6 11l5-5h5l3 3 3-3 4 5-5 5-5-4-5 4z"></path>' +
        '<path d="M11 16l5 5 5-5"></path>' +

      '</svg>';

    return wrap.firstChild;
  }


  function createCalendarIcon() {
    var wrap = document.createElement('div');

    wrap.innerHTML =
      '<svg viewBox="0 0 32 32" ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'width="24" height="24" ' +
      'fill="none" ' +
      'stroke="#0037ff" ' +
      'stroke-width="2" ' +
      'stroke-linecap="round" ' +
      'stroke-linejoin="round" ' +
      'aria-hidden="true">' +

        '<rect x="5" y="7" width="22" height="20" rx="2"></rect>' +
        '<path d="M5 12h22"></path>' +
        '<path d="M10 4v6"></path>' +
        '<path d="M22 4v6"></path>' +
        '<path d="M10 17h3"></path>' +
        '<path d="M15 17h3"></path>' +
        '<path d="M20 17h3"></path>' +
        '<path d="M10 22h3"></path>' +
        '<path d="M15 22h3"></path>' +
        '<path d="M20 22h3"></path>' +

      '</svg>';

    return wrap.firstChild;
  }


  /* =========================================================
     CREATE SECTION
     ========================================================= */

  function createSection(icon, line1, line2) {
    var section = document.createElement('div');

    setStyle(section, 'display', 'flex');
    setStyle(section, 'flex-direction', 'column');
    setStyle(section, 'align-items', 'center');
    setStyle(section, 'justify-content', 'center');
    setStyle(section, 'width', '100%');
    setStyle(section, 'margin', '0');
    setStyle(section, 'padding', '0');
    setStyle(section, 'box-sizing', 'border-box');


    var iconWrap = document.createElement('div');

    setStyle(iconWrap, 'display', 'flex');
    setStyle(iconWrap, 'align-items', 'center');
    setStyle(iconWrap, 'justify-content', 'center');
    setStyle(iconWrap, 'width', '24px');
    setStyle(iconWrap, 'height', '24px');
    setStyle(iconWrap, 'margin', '0 0 1px 0');
    setStyle(iconWrap, 'padding', '0');

    iconWrap.appendChild(icon);


    var text = document.createElement('div');

    text.innerHTML =
      line1 + '<br>' + line2;

    setStyle(text, 'display', 'block');
    setStyle(text, 'margin', '0');
    setStyle(text, 'padding', '0');

    setStyle(
      text,
      'font-family',
      'Arial, Helvetica, sans-serif'
    );

    setStyle(text, 'font-size', '10px');
    setStyle(text, 'line-height', '11px');
    setStyle(text, 'font-weight', '700');

    setStyle(text, 'color', '#001b44');
    setStyle(text, 'text-align', 'center');
    setStyle(text, 'letter-spacing', '0');
    setStyle(text, 'white-space', 'nowrap');


    section.appendChild(iconWrap);
    section.appendChild(text);

    return section;
  }


  /* =========================================================
     CREATE BADGE
     ========================================================= */

  function buildBadge() {
    var badge = document.createElement('div');

    badge.id = BADGE_ID;

    badge.setAttribute(
      'aria-label',
      'No contracts. No commitments.'
    );


    var topSection = createSection(
      createContractsIcon(),
      'NO',
      'CONTRACTS'
    );


    var divider = document.createElement('div');

    setStyle(divider, 'display', 'block');
    setStyle(divider, 'width', '72px');
    setStyle(divider, 'height', '1px');
    setStyle(divider, 'min-height', '1px');
    setStyle(divider, 'margin', '5px 0');
    setStyle(divider, 'padding', '0');
    setStyle(divider, 'background', '#0066ff');


    var bottomSection = createSection(
      createCalendarIcon(),
      'NO',
      'COMMITMENTS'
    );


    badge.appendChild(topSection);
    badge.appendChild(divider);
    badge.appendChild(bottomSection);

    return badge;
  }


  /* =========================================================
     BASE BADGE STYLES
     ========================================================= */

  function applyBaseStyles(badge) {
    setStyle(badge, 'position', 'absolute');
    setStyle(badge, 'z-index', '9999');

    setStyle(badge, 'display', 'flex');
    setStyle(badge, 'flex-direction', 'column');
    setStyle(badge, 'align-items', 'center');
    setStyle(badge, 'justify-content', 'center');

    setStyle(badge, 'box-sizing', 'border-box');

    setStyle(badge, 'margin', '0');
    setStyle(badge, 'padding', '10px');

    setStyle(badge, 'background', '#ffffff');

    setStyle(
      badge,
      'border',
      '2px solid #0066ff'
    );

    setStyle(badge, 'border-radius', '50%');

    setStyle(
      badge,
      'box-shadow',
      '0 0 0 4px rgba(255,255,255,.88)'
    );

    setStyle(badge, 'overflow', 'hidden');

    /*
     * Critical:
     * badge must NEVER block hero interaction.
     */
    setStyle(badge, 'pointer-events', 'none');

    setStyle(badge, 'visibility', 'visible');
    setStyle(badge, 'opacity', '1');
  }


  /* =========================================================
     SIZE CHILDREN
     ========================================================= */

  function sizeChildren(badge, mode) {
    if (!badge) return;

    var sections = [
      badge.children[0],
      badge.children[2]
    ];

    var divider = badge.children[1];


    Array.prototype.forEach.call(
      sections,
      function (section) {
        if (!section) return;

        var iconWrap = section.children[0];
        var text = section.children[1];
        var svg = iconWrap
          ? iconWrap.querySelector('svg')
          : null;


        if (mode === 'mobile') {

          setStyle(iconWrap, 'width', '17px');
          setStyle(iconWrap, 'height', '17px');

          if (svg) {
            svg.setAttribute('width', '17');
            svg.setAttribute('height', '17');
          }

          setStyle(text, 'font-size', '7px');
          setStyle(text, 'line-height', '7.5px');


        } else if (mode === 'tablet') {

          setStyle(iconWrap, 'width', '20px');
          setStyle(iconWrap, 'height', '20px');

          if (svg) {
            svg.setAttribute('width', '20');
            svg.setAttribute('height', '20');
          }

          setStyle(text, 'font-size', '8.5px');
          setStyle(text, 'line-height', '9px');


        } else {

          setStyle(iconWrap, 'width', '24px');
          setStyle(iconWrap, 'height', '24px');

          if (svg) {
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
          }

          setStyle(text, 'font-size', '10px');
          setStyle(text, 'line-height', '11px');
        }
      }
    );


    if (mode === 'mobile') {

      setStyle(divider, 'width', '50px');
      setStyle(divider, 'margin', '3px 0');


    } else if (mode === 'tablet') {

      setStyle(divider, 'width', '62px');
      setStyle(divider, 'margin', '4px 0');


    } else {

      setStyle(divider, 'width', '72px');
      setStyle(divider, 'margin', '5px 0');

    }
  }


  /* =========================================================
     DESKTOP
     ========================================================= */

  function applyDesktop(badge, hero) {
    if (badge.parentNode !== hero) {
      hero.appendChild(badge);
    }

    setStyle(hero, 'position', 'relative');


    applyBaseStyles(badge);
    sizeChildren(badge, 'desktop');


    setStyle(badge, 'width', '140px');
    setStyle(badge, 'height', '140px');

    setStyle(badge, 'top', '22px');
    setStyle(badge, 'right', '24px');

    setStyle(badge, 'left', 'auto');
    setStyle(badge, 'bottom', 'auto');

    setStyle(badge, 'transform', 'none');
  }


  /* =========================================================
     TABLET
     ========================================================= */

  function applyTablet(badge, hero) {
    if (badge.parentNode !== hero) {
      hero.appendChild(badge);
    }

    setStyle(hero, 'position', 'relative');


    applyBaseStyles(badge);
    sizeChildren(badge, 'tablet');


    setStyle(badge, 'width', '116px');
    setStyle(badge, 'height', '116px');

    setStyle(badge, 'top', '18px');
    setStyle(badge, 'right', '18px');

    setStyle(badge, 'left', 'auto');
    setStyle(badge, 'bottom', 'auto');

    setStyle(badge, 'transform', 'none');
  }


  /* =========================================================
     MOBILE
     ========================================================= */

  function applyMobile(badge, hero) {
    var heroImage =
      hero.querySelector('pex-pl-hero-image');

    /*
     * Use the actual image wrapper as positioning context.
     */
    if (heroImage) {

      setStyle(
        heroImage,
        'position',
        'relative'
      );

      if (badge.parentNode !== heroImage) {
        heroImage.appendChild(badge);
      }

    } else {

      setStyle(hero, 'position', 'relative');

      if (badge.parentNode !== hero) {
        hero.appendChild(badge);
      }

    }


    applyBaseStyles(badge);
    sizeChildren(badge, 'mobile');


    /*
     * Matches the mobile comp:
     * small circle tucked into upper-right of photo.
     */
    setStyle(badge, 'width', '88px');
    setStyle(badge, 'height', '88px');

    setStyle(badge, 'padding', '7px');

    setStyle(badge, 'top', '10px');
    setStyle(badge, 'right', '10px');

    setStyle(badge, 'left', 'auto');
    setStyle(badge, 'bottom', 'auto');

    setStyle(badge, 'transform', 'none');

    setStyle(
      badge,
      'box-shadow',
      '0 0 0 3px rgba(255,255,255,.9)'
    );
  }


  /* =========================================================
     RESPONSIVE
     ========================================================= */

  function applyResponsiveLayout() {
    var hero =
      document.querySelector(
        '.pex-pl-hero-container pex-pl-hero'
      );

    if (!hero) {
      return false;
    }


    var badge =
      document.getElementById(BADGE_ID);


    if (!badge) {
      badge = buildBadge();
    }


    var width = getWidth();


    if (width <= 767) {

      applyMobile(
        badge,
        hero
      );


    } else if (width <= 1023) {

      applyTablet(
        badge,
        hero
      );


    } else {

      applyDesktop(
        badge,
        hero
      );

    }


    return true;
  }


  /* =========================================================
     INIT
     ========================================================= */

  function initExperiment() {

    applyResponsiveLayout();


    /*
     * Spectrum Angular re-render protection
     */
    var attempts = 0;
    var MAX_ATTEMPTS = 75;

    var interval =
      setInterval(function () {

        attempts++;

        applyResponsiveLayout();


        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
        }

      }, 200);


    /*
     * Responsive changes
     */
    var resizeTimer;

    window.addEventListener(
      'resize',
      function () {

        clearTimeout(resizeTimer);

        resizeTimer =
          setTimeout(
            applyResponsiveLayout,
            100
          );

      }
    );
  }


  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      initExperiment
    );

  } else {

    initExperiment();

  }

})();
</script>
