<script id="hero-benefit-banner" type="html/js">
(function () {
  'use strict';

  var BANNER_CLASS = 'exp-spectrum-benefit-banner';
  var STYLE_ID = 'exp-spectrum-benefit-banner-styles';

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `

      /* Position relative to the OUTER hero builder */
      pex-pl-hero-builder {
        position: relative !important;
        display: block !important;
      }

      /* =========================
         DESKTOP
         ========================= */

      pex-pl-hero-builder > .${BANNER_CLASS} {
        position: absolute !important;

        left: 50% !important;
        bottom: 18px !important;
        transform: translateX(-50%) !important;

        z-index: 100 !important;

        display: flex !important;
        align-items: center !important;

        width: calc(100% - 160px) !important;
        max-width: 1100px !important;

        box-sizing: border-box !important;

        padding: 18px 22px !important;

        background: #ffffff !important;
        border: 1px solid #e2e2e2 !important;
        border-radius: 10px !important;

        box-shadow: 0 3px 12px rgba(0,0,0,.18) !important;

        color: #000 !important;
      }


      .${BANNER_CLASS}__item {
        flex: 1 1 25% !important;

        display: flex !important;
        align-items: center !important;

        min-width: 0 !important;

        gap: 16px !important;

        padding: 0 28px !important;

        box-sizing: border-box !important;
      }


      .${BANNER_CLASS}__item:first-child {
        padding-left: 0 !important;
      }

      .${BANNER_CLASS}__item:last-child {
        padding-right: 0 !important;
      }


      .${BANNER_CLASS}__item + .${BANNER_CLASS}__item {
        border-left: 1px solid #dedede !important;
      }


      .${BANNER_CLASS}__icon {
        flex: 0 0 36px !important;

        width: 36px !important;
        height: 36px !important;

        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        color: #0037ff !important;
      }


      .${BANNER_CLASS}__icon svg {
        display: block !important;

        width: 34px !important;
        height: 34px !important;

        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.8 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }


      .${BANNER_CLASS}__copy {
        display: block !important;

        min-width: 0 !important;

        font-family: inherit !important;
        font-size: 14px !important;
        line-height: 1.35 !important;
        font-weight: 500 !important;

        color: #111 !important;
      }


      .${BANNER_CLASS}__line {
        display: block !important;
        white-space: nowrap !important;
      }



      /* =========================
         MOBILE
         ========================= */

      @media (max-width: 767px) {

        pex-pl-hero-builder > .${BANNER_CLASS} {
          position: relative !important;

          left: auto !important;
          bottom: auto !important;
          transform: none !important;

          z-index: 1 !important;

          flex-direction: column !important;
          align-items: stretch !important;

          width: calc(100% - 32px) !important;
          max-width: none !important;

          margin: 16px auto !important;

          padding: 10px 16px !important;
        }


        .${BANNER_CLASS}__item {
          flex: none !important;

          width: 100% !important;

          padding: 8px 0 !important;

          gap: 12px !important;
        }


        .${BANNER_CLASS}__item + .${BANNER_CLASS}__item {
          border-left: 0 !important;
        }


        .${BANNER_CLASS}__icon {
          flex-basis: 28px !important;

          width: 28px !important;
          height: 28px !important;
        }


        .${BANNER_CLASS}__icon svg {
          width: 26px !important;
          height: 26px !important;
        }


        .${BANNER_CLASS}__copy {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }


        .${BANNER_CLASS}__line {
          white-space: normal !important;
        }
      }

    `;

    document.head.appendChild(style);
  }


  function buildBanner() {
    var banner = document.createElement('div');

    banner.className = BANNER_CLASS;

    banner.innerHTML = `

      <!-- NO CONTRACTS -->

      <div class="${BANNER_CLASS}__item">

        <div class="${BANNER_CLASS}__icon" aria-hidden="true">

          <svg viewBox="0 0 40 40">

            <path d="M12 7.5a14 14 0 1 0 17.5 3"></path>

            <path d="M12 3.5v8h8"></path>

            <text
              x="20"
              y="24"
              text-anchor="middle"
              fill="currentColor"
              stroke="none"
              font-size="10"
              font-family="Arial, sans-serif"
              font-weight="700"
            >$0</text>

          </svg>

        </div>

        <div class="${BANNER_CLASS}__copy">
          <span class="${BANNER_CLASS}__line">No contracts</span>
          <span class="${BANNER_CLASS}__line">or commitments</span>
        </div>

      </div>



      <!-- CHANGE OR CANCEL -->

      <div class="${BANNER_CLASS}__item">

        <div class="${BANNER_CLASS}__icon" aria-hidden="true">

          <svg viewBox="0 0 40 40">

            <rect x="7" y="10" width="26" height="24" rx="1"></rect>

            <path d="M7 16h26"></path>
            <path d="M13 6v8"></path>
            <path d="M27 6v8"></path>

            <path d="M13 21h3"></path>
            <path d="M19 21h3"></path>
            <path d="M25 21h3"></path>

            <path d="M13 27h3"></path>
            <path d="M19 27h3"></path>
            <path d="M25 27h3"></path>

          </svg>

        </div>

        <div class="${BANNER_CLASS}__copy">
          <span class="${BANNER_CLASS}__line">Change or cancel</span>
          <span class="${BANNER_CLASS}__line">anytime</span>
        </div>

      </div>



      <!-- SAME GREAT PRICE -->

      <div class="${BANNER_CLASS}__item">

        <div class="${BANNER_CLASS}__icon" aria-hidden="true">

          <svg viewBox="0 0 40 40">

            <path d="M7 20L20 7h12v12L19 32 7 20z"></path>

            <circle cx="26.5" cy="12.5" r="2"></circle>

            <path d="M15 19h8"></path>
            <path d="M19 15v8"></path>

          </svg>

        </div>

        <div class="${BANNER_CLASS}__copy">
          <span class="${BANNER_CLASS}__line">Same great price</span>
          <span class="${BANNER_CLASS}__line">every year</span>
        </div>

      </div>



      <!-- HASSLE FREE -->

      <div class="${BANNER_CLASS}__item">

        <div class="${BANNER_CLASS}__icon" aria-hidden="true">

          <svg viewBox="0 0 40 40">

            <path d="M13 18v16H7V18h6z"></path>

            <path d="
              M13 31
              h15
              c2 0 3.5-1 4.2-2.7
              l3.3-8.2
              c.8-2-.7-4.1-2.9-4.1
              H25
              l1-6
              c.3-2-1.2-4-3.3-4
              H21
              l-8 12
            "></path>

          </svg>

        </div>

        <div class="${BANNER_CLASS}__copy">
          <span class="${BANNER_CLASS}__line">100% hassle-free</span>
          <span class="${BANNER_CLASS}__line">online experience</span>
        </div>

      </div>

    `;

    return banner;
  }


  function injectBanner() {

    /*
     * IMPORTANT:
     * Target the builder, NOT the inner Angular hero.
     */
    var builder = document.querySelector(
      'pex-pl-hero-builder'
    );

    if (!builder) {
      return false;
    }


    /*
     * Make sure the actual hero exists first.
     */
    var hero = builder.querySelector(
      ':scope > pex-pl-hero'
    );

    if (!hero) {
      hero = builder.querySelector('pex-pl-hero');
    }

    if (!hero) {
      return false;
    }


    /*
     * Don't inject twice.
     */
    if (builder.querySelector(
      ':scope > .' + BANNER_CLASS
    )) {
      return true;
    }


    var banner = buildBanner();


    /*
     * Insert AFTER pex-pl-hero.

     * This is the important difference:
     *
     * <pex-pl-hero-builder>
     *
     *     <pex-pl-hero>
     *         Angular-controlled content
     *     </pex-pl-hero>
     *
     *     OUR BANNER
     *
     * </pex-pl-hero-builder>
     *
     * This keeps Angular from deleting our element.
     */
    if (hero.nextSibling) {

      builder.insertBefore(
        banner,
        hero.nextSibling
      );

    } else {

      builder.appendChild(banner);

    }


    return true;
  }


  function init() {

    addStyles();


    /*
     * Try immediately.
     */
    injectBanner();


    /*
     * Spectrum renders asynchronously.
     *
     * Continue checking instead of stopping after
     * the first successful attempt because Angular
     * can replace the hero shortly after Target runs.
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
