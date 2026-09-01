<script id="hero-benefit-banner" type="html/js">
(function () {
  'use strict';

  var BANNER_ID = 'exp-spectrum-benefit-banner';


  /* ==========================================================
     ICONS
     ========================================================== */

  var ICON_CONTRACTS =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
    "%3Cg fill='none' stroke='%230037ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E" +
    "%3Cpath d='M12 7.5a14 14 0 1 0 17.5 3'/%3E" +
    "%3Cpath d='M12 3.5v8h8'/%3E" +
    "%3C/g%3E" +
    "%3Ctext x='20' y='24' text-anchor='middle' fill='%230037ff' font-size='10' font-family='Arial' font-weight='700'%3E%240%3C/text%3E" +
    "%3C/svg%3E\")";


  var ICON_CALENDAR =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
    "%3Cg fill='none' stroke='%230037ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E" +
    "%3Crect x='7' y='10' width='26' height='24' rx='1'/%3E" +
    "%3Cpath d='M7 16h26M13 6v8M27 6v8M13 21h3M19 21h3M25 21h3M13 27h3M19 27h3M25 27h3'/%3E" +
    "%3C/g%3E" +
    "%3C/svg%3E\")";


  var ICON_TAG =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
    "%3Cg fill='none' stroke='%230037ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E" +
    "%3Cpath d='M7 20L20 7h12v12L19 32 7 20z'/%3E" +
    "%3Ccircle cx='26.5' cy='12.5' r='2'/%3E" +
    "%3Cpath d='M15 19h8M19 15v8'/%3E" +
    "%3C/g%3E" +
    "%3C/svg%3E\")";


  var ICON_THUMB =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
    "%3Cg fill='none' stroke='%230037ff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E" +
    "%3Cpath d='M13 18v16H7V18h6z'/%3E" +
    "%3Cpath d='M13 31h15c2 0 3.5-1 4.2-2.7l3.3-8.2c.8-2-.7-4.1-2.9-4.1H25l1-6c.3-2-1.2-4-3.3-4H21l-8 12'/%3E" +
    "%3C/g%3E" +
    "%3C/svg%3E\")";


  /* ==========================================================
     ITEM CREATION
     ========================================================== */

  function makeItem(text, icon, divider) {

    var item = document.createElement('div');

    item.className = 'exp-spectrum-benefit-item';

    item.textContent = text;

    item.setAttribute(
      'data-divider',
      divider ? 'true' : 'false'
    );

    item.style.setProperty(
      'background-image',
      icon,
      'important'
    );

    return item;
  }


  /* ==========================================================
     BUILD BANNER
     ========================================================== */

  function buildBanner() {

    var banner = document.createElement('div');

    banner.id = BANNER_ID;


    banner.appendChild(
      makeItem(
        'No contracts\nor commitments',
        ICON_CONTRACTS,
        false
      )
    );


    banner.appendChild(
      makeItem(
        'Change or cancel\nanytime',
        ICON_CALENDAR,
        true
      )
    );


    banner.appendChild(
      makeItem(
        'Same great price\nevery year',
        ICON_TAG,
        true
      )
    );


    banner.appendChild(
      makeItem(
        '100% hassle-free\nonline experience',
        ICON_THUMB,
        true
      )
    );


    return banner;
  }


  /* ==========================================================
     COMMON ITEM STYLES
     ========================================================== */

  function baseItemStyles(item) {

    item.style.setProperty(
      'box-sizing',
      'border-box',
      'important'
    );

    item.style.setProperty(
      'background-repeat',
      'no-repeat',
      'important'
    );

    item.style.setProperty(
      'font-family',
      'Arial, Helvetica, sans-serif',
      'important'
    );

    item.style.setProperty(
      'font-weight',
      '400',
      'important'
    );

    item.style.setProperty(
      'color',
      '#111111',
      'important'
    );

    item.style.setProperty(
      'white-space',
      'pre-line',
      'important'
    );

    item.style.setProperty(
      'visibility',
      'visible',
      'important'
    );

    item.style.setProperty(
      'opacity',
      '1',
      'important'
    );
  }


  /* ==========================================================
     DESKTOP
     911px+
     ========================================================== */

  function applyDesktop(banner, builder) {

    /*
     * Put the banner back outside the Angular hero.
     */
    if (banner.parentNode !== builder) {
      builder.appendChild(banner);
    }


    builder.style.setProperty(
      'position',
      'relative',
      'important'
    );


    banner.style.cssText = '';

    banner.style.setProperty(
      'position',
      'absolute',
      'important'
    );

    banner.style.setProperty(
      'left',
      '50%',
      'important'
    );

    /*
     * Previously 18px.
     *
     * -32px moves it DOWN exactly 50px.
     */
    banner.style.setProperty(
      'bottom',
      '-32px',
      'important'
    );

    banner.style.setProperty(
      'transform',
      'translateX(-50%)',
      'important'
    );

    banner.style.setProperty(
      'z-index',
      '99999',
      'important'
    );

    banner.style.setProperty(
      'display',
      'flex',
      'important'
    );

    banner.style.setProperty(
      'flex-direction',
      'row',
      'important'
    );

    banner.style.setProperty(
      'align-items',
      'center',
      'important'
    );

    banner.style.setProperty(
      'width',
      'calc(100% - 160px)',
      'important'
    );

    banner.style.setProperty(
      'max-width',
      '1100px',
      'important'
    );

    banner.style.setProperty(
      'height',
      '76px',
      'important'
    );

    banner.style.setProperty(
      'padding',
      '10px 0',
      'important'
    );

    banner.style.setProperty(
      'margin',
      '0',
      'important'
    );

    banner.style.setProperty(
      'box-sizing',
      'border-box',
      'important'
    );

    banner.style.setProperty(
      'background',
      '#ffffff',
      'important'
    );

    banner.style.setProperty(
      'border',
      '1px solid #e2e2e2',
      'important'
    );

    banner.style.setProperty(
      'border-radius',
      '10px',
      'important'
    );

    banner.style.setProperty(
      'box-shadow',
      '0 3px 12px rgba(0,0,0,.18)',
      'important'
    );

    banner.style.setProperty(
      'overflow',
      'hidden',
      'important'
    );


    Array.prototype.forEach.call(
      banner.children,
      function (item) {

        baseItemStyles(item);


        item.style.setProperty(
          'display',
          'flex',
          'important'
        );

        item.style.setProperty(
          'align-items',
          'center',
          'important'
        );

        item.style.setProperty(
          'flex',
          '1 1 25%',
          'important'
        );

        item.style.setProperty(
          'min-width',
          '0',
          'important'
        );

        item.style.setProperty(
          'height',
          '40px',
          'important'
        );

        item.style.setProperty(
          'padding',
          '0 24px 0 66px',
          'important'
        );

        item.style.setProperty(
          'font-size',
          '14px',
          'important'
        );

        item.style.setProperty(
          'line-height',
          '19px',
          'important'
        );

        item.style.setProperty(
          'background-position',
          '24px center',
          'important'
        );

        item.style.setProperty(
          'background-size',
          '34px 34px',
          'important'
        );


        if (
          item.getAttribute('data-divider') === 'true'
        ) {

          item.style.setProperty(
            'border-left',
            '1px solid #dedede',
            'important'
          );

        } else {

          item.style.setProperty(
            'border-left',
            '0',
            'important'
          );
        }
      }
    );
  }


  /* ==========================================================
     TABLET
     768px - 910px
     ========================================================== */

  function applyTablet(banner, builder) {

    if (banner.parentNode !== builder) {
      builder.appendChild(banner);
    }


    builder.style.setProperty(
      'position',
      'relative',
      'important'
    );


    banner.style.cssText = '';

    banner.style.setProperty(
      'position',
      'absolute',
      'important'
    );

    banner.style.setProperty(
      'left',
      '50%',
      'important'
    );

    banner.style.setProperty(
      'bottom',
      '-32px',
      'important'
    );

    banner.style.setProperty(
      'transform',
      'translateX(-50%)',
      'important'
    );

    banner.style.setProperty(
      'z-index',
      '99999',
      'important'
    );

    banner.style.setProperty(
      'display',
      'flex',
      'important'
    );

    banner.style.setProperty(
      'flex-direction',
      'row',
      'important'
    );

    banner.style.setProperty(
      'align-items',
      'center',
      'important'
    );


    /*
     * Give tablet substantially more horizontal room.
     */
    banner.style.setProperty(
      'width',
      'calc(100% - 24px)',
      'important'
    );

    banner.style.setProperty(
      'max-width',
      'none',
      'important'
    );

    banner.style.setProperty(
      'height',
      '72px',
      'important'
    );

    banner.style.setProperty(
      'padding',
      '8px 0',
      'important'
    );

    banner.style.setProperty(
      'margin',
      '0',
      'important'
    );

    banner.style.setProperty(
      'box-sizing',
      'border-box',
      'important'
    );

    banner.style.setProperty(
      'background',
      '#ffffff',
      'important'
    );

    banner.style.setProperty(
      'border',
      '1px solid #e2e2e2',
      'important'
    );

    banner.style.setProperty(
      'border-radius',
      '8px',
      'important'
    );

    banner.style.setProperty(
      'box-shadow',
      '0 3px 12px rgba(0,0,0,.18)',
      'important'
    );

    banner.style.setProperty(
      'overflow',
      'hidden',
      'important'
    );


    Array.prototype.forEach.call(
      banner.children,
      function (item) {

        baseItemStyles(item);


        item.style.setProperty(
          'display',
          'flex',
          'important'
        );

        item.style.setProperty(
          'align-items',
          'center',
          'important'
        );

        item.style.setProperty(
          'flex',
          '1 1 25%',
          'important'
        );

        item.style.setProperty(
          'min-width',
          '0',
          'important'
        );

        item.style.setProperty(
          'height',
          '42px',
          'important'
        );


        /*
         * Much less left/right dead space.
         */
        item.style.setProperty(
          'padding',
          '0 8px 0 44px',
          'important'
        );


        item.style.setProperty(
          'font-size',
          '11.5px',
          'important'
        );

        item.style.setProperty(
          'line-height',
          '15px',
          'important'
        );


        item.style.setProperty(
          'background-position',
          '10px center',
          'important'
        );

        item.style.setProperty(
          'background-size',
          '27px 27px',
          'important'
        );


        if (
          item.getAttribute('data-divider') === 'true'
        ) {

          item.style.setProperty(
            'border-left',
            '1px solid #dedede',
            'important'
          );

        } else {

          item.style.setProperty(
            'border-left',
            '0',
            'important'
          );
        }
      }
    );
  }


  /* ==========================================================
     MOBILE
     <= 767px
     ========================================================== */

  function applyMobile(banner, builder) {

    /*
     * On mobile we DON'T want the banner absolutely positioned.
     *
     * Find the text stack and physically place the banner
     * immediately after the LAST actions block.
     *
     * The final actions block contains:
     * "Already a Spectrum customer? Sign in"
     */
    var typeStack =
      builder.querySelector(
        'nova-type-stack'
      );


    if (typeStack) {

      var actions =
        typeStack.querySelectorAll(
          'nova-type-stack-actions'
        );


      if (actions.length) {

        var signInActions =
          actions[actions.length - 1];


        if (
          banner.previousElementSibling !==
          signInActions
        ) {

          signInActions.insertAdjacentElement(
            'afterend',
            banner
          );
        }
      }
    }


    banner.style.cssText = '';


    /*
     * Normal document flow.
     */
    banner.style.setProperty(
      'position',
      'relative',
      'important'
    );

    banner.style.setProperty(
      'left',
      'auto',
      'important'
    );

    banner.style.setProperty(
      'bottom',
      'auto',
      'important'
    );

    banner.style.setProperty(
      'transform',
      'none',
      'important'
    );

    banner.style.setProperty(
      'z-index',
      '10',
      'important'
    );


    /*
     * Vertical mobile card.
     */
    banner.style.setProperty(
      'display',
      'flex',
      'important'
    );

    banner.style.setProperty(
      'flex-direction',
      'column',
      'important'
    );

    banner.style.setProperty(
      'align-items',
      'stretch',
      'important'
    );

    banner.style.setProperty(
      'width',
      '100%',
      'important'
    );

    banner.style.setProperty(
      'max-width',
      'none',
      'important'
    );

    banner.style.setProperty(
      'height',
      'auto',
      'important'
    );

    banner.style.setProperty(
      'margin',
      '16px 0 0',
      'important'
    );

    banner.style.setProperty(
      'padding',
      '12px 16px',
      'important'
    );

    banner.style.setProperty(
      'box-sizing',
      'border-box',
      'important'
    );

    banner.style.setProperty(
      'background',
      '#ffffff',
      'important'
    );

    banner.style.setProperty(
      'border',
      '1px solid #e2e2e2',
      'important'
    );

    banner.style.setProperty(
      'border-radius',
      '8px',
      'important'
    );

    banner.style.setProperty(
      'box-shadow',
      '0 2px 8px rgba(0,0,0,.14)',
      'important'
    );

    banner.style.setProperty(
      'overflow',
      'visible',
      'important'
    );


    Array.prototype.forEach.call(
      banner.children,
      function (item) {

        baseItemStyles(item);


        item.style.setProperty(
          'display',
          'flex',
          'important'
        );

        item.style.setProperty(
          'align-items',
          'center',
          'important'
        );

        item.style.setProperty(
          'flex',
          'none',
          'important'
        );

        item.style.setProperty(
          'width',
          '100%',
          'important'
        );

        item.style.setProperty(
          'height',
          'auto',
          'important'
        );

        item.style.setProperty(
          'min-height',
          '42px',
          'important'
        );

        item.style.setProperty(
          'padding',
          '6px 6px 6px 44px',
          'important'
        );

        item.style.setProperty(
          'font-size',
          '12px',
          'important'
        );

        item.style.setProperty(
          'line-height',
          '15px',
          'important'
        );

        item.style.setProperty(
          'background-position',
          '6px center',
          'important'
        );

        item.style.setProperty(
          'background-size',
          '27px 27px',
          'important'
        );


        /*
         * No vertical dividers on mobile.
         */
        item.style.setProperty(
          'border-left',
          '0',
          'important'
        );
      }
    );
  }


  /* ==========================================================
     RESPONSIVE HANDLER
     ========================================================== */

  function applyResponsiveLayout() {

    var banner =
      document.getElementById(
        BANNER_ID
      );


    var builder =
      document.querySelector(
        'pex-pl-hero-builder'
      );


    if (!banner || !builder) {
      return;
    }


    var width =
      window.innerWidth ||
      document.documentElement.clientWidth;


    if (width <= 767) {

      applyMobile(
        banner,
        builder
      );

    } else if (width <= 910) {

      applyTablet(
        banner,
        builder
      );

    } else {

      applyDesktop(
        banner,
        builder
      );
    }
  }


  /* ==========================================================
     INJECTION
     ========================================================== */

  function injectBanner() {

    var builder =
      document.querySelector(
        'pex-pl-hero-builder'
      );


    if (!builder) {
      return false;
    }


    var hero =
      builder.querySelector(
        'pex-pl-hero'
      );


    if (!hero) {
      return false;
    }


    var banner =
      document.getElementById(
        BANNER_ID
      );


    if (!banner) {

      banner = buildBanner();

      /*
       * Initial placement.
       *
       * Responsive handler will immediately move it
       * into the correct desktop/tablet/mobile location.
       */
      builder.appendChild(banner);
    }


    applyResponsiveLayout();

    return true;
  }


  /* ==========================================================
     INIT
     ========================================================== */

  function init() {

    injectBanner();


    /*
     * Spectrum/Angular re-render protection.
     */
    var attempts = 0;
    var MAX_ATTEMPTS = 75;


    var interval =
      setInterval(function () {

        attempts++;

        injectBanner();


        if (
          attempts >= MAX_ATTEMPTS
        ) {

          clearInterval(
            interval
          );
        }

      }, 200);


    /*
     * Handle actual device resizing / orientation changes.
     */
    var resizeTimer;


    window.addEventListener(
      'resize',
      function () {

        clearTimeout(
          resizeTimer
        );


        resizeTimer =
          setTimeout(
            applyResponsiveLayout,
            100
          );

      }
    );
  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();
  }

})();
</script>
