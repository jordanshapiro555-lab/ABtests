<script id="exp-spectrum-no-contracts-badge" type="html/js">
(function () {
  'use strict';

  var BADGE_ID = 'exp-spectrum-no-contracts-badge-element';
  var STYLE_ID = 'exp-spectrum-no-contracts-badge-styles';

  /* =========================================================
     ADD STYLES
     ========================================================= */

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      /* =====================================================
         HERO POSITIONING
         ===================================================== */

      pex-pl-hero {
        position: relative !important;
      }

      #${BADGE_ID} {
        position: absolute !important;
        z-index: 50 !important;

        box-sizing: border-box !important;

        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;

        width: 142px !important;
        height: 142px !important;

        border: 3px solid #0066ff !important;
        border-radius: 50% !important;

        background: rgba(255, 255, 255, 0.96) !important;

        color: #001b44 !important;
        text-align: center !important;

        box-shadow:
          0 1px 2px rgba(0,0,0,.08),
          0 0 0 5px rgba(255,255,255,.85) !important;

        font-family: Arial, Helvetica, sans-serif !important;

        pointer-events: none !important;
      }

      #${BADGE_ID} .exp-spectrum-badge__section {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;

        width: 100% !important;
      }

      #${BADGE_ID} .exp-spectrum-badge__divider {
        width: 86px !important;
        height: 1px !important;
        margin: 7px 0 !important;
        background: #0066ff !important;
      }

      #${BADGE_ID} .exp-spectrum-badge__icon {
        width: 25px !important;
        height: 25px !important;

        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        margin: 0 auto 2px !important;
      }

      #${BADGE_ID} .exp-spectrum-badge__icon svg {
        display: block !important;
        width: 100% !important;
        height: 100% !important;

        stroke: #0037ff !important;
        fill: none !important;

        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${BADGE_ID} .exp-spectrum-badge__label {
        display: block !important;

        margin: 0 !important;
        padding: 0 !important;

        font-size: 11px !important;
        line-height: 12px !important;
        font-weight: 700 !important;
        letter-spacing: 0 !important;

        color: #001b44 !important;
      }


      /* =====================================================
         DESKTOP
         1024px+
         ===================================================== */

      @media (min-width: 1024px) {

        #${BADGE_ID} {
          top: 27px !important;
          right: 24px !important;

          width: 142px !important;
          height: 142px !important;
        }

      }


      /* =====================================================
         TABLET
         768px - 1023px
         ===================================================== */

      @media (min-width: 768px) and (max-width: 1023px) {

        #${BADGE_ID} {
          top: 22px !important;
          right: 20px !important;

          width: 124px !important;
          height: 124px !important;

          border-width: 2px !important;

          box-shadow:
            0 1px 2px rgba(0,0,0,.08),
            0 0 0 4px rgba(255,255,255,.85) !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__icon {
          width: 21px !important;
          height: 21px !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__label {
          font-size: 9.5px !important;
          line-height: 10.5px !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__divider {
          width: 72px !important;
          margin: 5px 0 !important;
        }

      }


      /* =====================================================
         MOBILE
         <= 767px

         On Spectrum mobile the hero image sits ABOVE the text,
         so badge remains attached to the image rather than the
         text portion of the hero.
         ===================================================== */

      @media (max-width: 767px) {

        pex-pl-hero-image {
          position: relative !important;
        }

        #${BADGE_ID} {
          top: 10px !important;
          right: 10px !important;

          width: 94px !important;
          height: 94px !important;

          border-width: 2px !important;

          box-shadow:
            0 1px 2px rgba(0,0,0,.08),
            0 0 0 3px rgba(255,255,255,.9) !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__icon {
          width: 16px !important;
          height: 16px !important;
          margin-bottom: 0 !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__label {
          font-size: 7px !important;
          line-height: 7.5px !important;
        }

        #${BADGE_ID} .exp-spectrum-badge__divider {
          width: 54px !important;
          margin: 3px 0 !important;
        }

      }
    `;

    document.head.appendChild(style);
  }


  /* =========================================================
     ICONS
     ========================================================= */

  function contractIcon() {
    return (
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<path d="M7 9l5-5h8l5 5-4 4-5-4-5 4z"></path>' +
        '<path d="M11 13l-3 3 8 8 8-8-3-3"></path>' +
        '<path d="M12 4l4 5 4-5"></path>' +
      '</svg>'
    );
  }


  function calendarIcon() {
    return (
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<rect x="5" y="7" width="22" height="20" rx="2"></rect>' +
        '<path d="M5 12h22"></path>' +
        '<path d="M10 4v6"></path>' +
        '<path d="M22 4v6"></path>' +
        '<path d="M10 16h3"></path>' +
        '<path d="M15 16h3"></path>' +
        '<path d="M20 16h3"></path>' +
        '<path d="M10 21h3"></path>' +
        '<path d="M15 21h3"></path>' +
        '<path d="M20 21h3"></path>' +
      '</svg>'
    );
  }


  /* =========================================================
     BUILD BADGE
     ========================================================= */

  function buildBadge() {
    var badge = document.createElement('div');

    badge.id = BADGE_ID;

    badge.setAttribute(
      'aria-label',
      'No contracts. No commitments.'
    );

    badge.innerHTML =
      '<div class="exp-spectrum-badge__section">' +
        '<div class="exp-spectrum-badge__icon">' +
          contractIcon() +
        '</div>' +
        '<span class="exp-spectrum-badge__label">' +
          'NO<br>CONTRACTS' +
        '</span>' +
      '</div>' +

      '<div class="exp-spectrum-badge__divider"></div>' +

      '<div class="exp-spectrum-badge__section">' +
        '<div class="exp-spectrum-badge__icon">' +
          calendarIcon() +
        '</div>' +
        '<span class="exp-spectrum-badge__label">' +
          'NO<br>COMMITMENTS' +
        '</span>' +
      '</div>';

    return badge;
  }


  /* =========================================================
     RESPONSIVE PLACEMENT
     ========================================================= */

  function placeBadge() {
    var hero = document.querySelector(
      '.pex-pl-hero-container pex-pl-hero'
    );

    if (!hero) {
      return false;
    }

    var badge = document.getElementById(BADGE_ID);

    if (!badge) {
      badge = buildBadge();
    }

    var width =
      window.innerWidth ||
      document.documentElement.clientWidth;


    /*
     * MOBILE
     *
     * Put the badge inside pex-pl-hero-image so it stays
     * attached to the photo exactly like the mockup.
     */
    if (width <= 767) {

      var heroImage = hero.querySelector(
        'pex-pl-hero-image'
      );

      if (heroImage) {

        if (badge.parentNode !== heroImage) {
          heroImage.appendChild(badge);
        }

        return true;
      }
    }


    /*
     * TABLET / DESKTOP
     *
     * Attach badge directly to the hero so top/right
     * positioning is relative to the entire hero.
     */
    if (badge.parentNode !== hero) {
      hero.appendChild(badge);
    }

    return true;
  }


  /* =========================================================
     INIT
     ========================================================= */

  function initExperiment() {
    addStyles();

    placeBadge();


    /*
     * Spectrum is Angular-based and can redraw this hero
     * after Adobe Target initially executes.
     *
     * Re-check for ~15 seconds so the experiment survives
     * those redraws.
     */
    var attempts = 0;
    var MAX_ATTEMPTS = 75;

    var interval = setInterval(function () {

      attempts++;

      addStyles();
      placeBadge();

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
      }

    }, 200);


    /*
     * Move badge between image/hero when viewport crosses
     * the mobile breakpoint.
     */
    var resizeTimer;

    window.addEventListener('resize', function () {

      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(
        placeBadge,
        100
      );

    });
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
