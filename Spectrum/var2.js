<script id="hero-benefit-banner" type="html/js">
(function () {
  'use strict';

  var BANNER_ID = 'exp-spectrum-benefit-banner';

  /*
   * SVG icons encoded as data URLs.
   * These render as BACKGROUNDS rather than nested <svg> elements,
   * which avoids Spectrum's component styling entirely.
   */

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


  function makeItem(text, icon, divider) {

    var item = document.createElement('div');

    /*
     * IMPORTANT:
     * Direct text only.
     *
     * No spans.
     * No nested divs.
     * No nested SVG.
     */
    item.textContent = text;

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
      'box-sizing',
      'border-box',
      'important'
    );

    /*
     * Space on left for background icon.
     */
    item.style.setProperty(
      'padding',
      '0 24px 0 66px',
      'important'
    );

    item.style.setProperty(
      'margin',
      '0',
      'important'
    );

    /*
     * Text
     */
    item.style.setProperty(
      'font-family',
      'Arial, Helvetica, sans-serif',
      'important'
    );

    item.style.setProperty(
      'font-size',
      '14px',
      'important'
    );

    item.style.setProperty(
      'font-weight',
      '400',
      'important'
    );

    item.style.setProperty(
      'line-height',
      '19px',
      'important'
    );

    item.style.setProperty(
      'color',
      '#111111',
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

    /*
     * \n becomes a deliberate second line.
     */
    item.style.setProperty(
      'white-space',
      'pre-line',
      'important'
    );

    /*
     * Icon is a background image on THIS SAME ELEMENT.
     */
    item.style.setProperty(
      'background-image',
      icon,
      'important'
    );

    item.style.setProperty(
      'background-repeat',
      'no-repeat',
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

    if (divider) {
      item.style.setProperty(
        'border-left',
        '1px solid #dedede',
        'important'
      );
    }

    return item;
  }


  function buildBanner() {

    var banner = document.createElement('div');

    banner.id = BANNER_ID;

    /*
     * Exact desktop card positioning that is already working
     * in your latest screenshot.
     */
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
      '18px',
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


    /*
     * Horizontal layout.
     */
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
     * Card sizing.
     */
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
      'box-sizing',
      'border-box',
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


    /*
     * Visual styling.
     */
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


    /*
     * Four benefits.
     */

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


  function injectBanner() {

    var builder =
      document.querySelector('pex-pl-hero-builder');

    if (!builder) {
      return false;
    }


    var hero =
      builder.querySelector('pex-pl-hero');

    if (!hero) {
      return false;
    }


    /*
     * Anchor our absolute positioning.
     */
    builder.style.setProperty(
      'position',
      'relative',
      'important'
    );

    builder.style.setProperty(
      'display',
      'block',
      'important'
    );


    /*
     * Prevent duplicates.
     */
    if (document.getElementById(BANNER_ID)) {
      return true;
    }


    var banner = buildBanner();

    builder.appendChild(banner);

    return true;
  }


  function init() {

    injectBanner();


    /*
     * Spectrum may rebuild the hero during Angular rendering.
     * Re-check for ~15 seconds.
     */
    var attempts = 0;
    var MAX_ATTEMPTS = 75;

    var interval = setInterval(function () {

      attempts++;

      injectBanner();

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
      }

    }, 200);
  }


  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();
</script>
