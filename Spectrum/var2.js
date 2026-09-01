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
      /* Banner */
      .${BANNER_CLASS} {
        display: flex;
        align-items: stretch;

        width: calc(100% - 48px);
        max-width: 1100px;

        margin: 20px auto 0;
        padding: 18px 20px;

        box-sizing: border-box;

        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 10px;

        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
      }

      .${BANNER_CLASS}__item {
        display: flex;
        align-items: center;
        gap: 14px;

        flex: 1 1 25%;
        min-width: 0;

        padding: 0 24px;
        box-sizing: border-box;
      }

      .${BANNER_CLASS}__item:first-child {
        padding-left: 8px;
      }

      .${BANNER_CLASS}__item:last-child {
        padding-right: 8px;
      }

      .${BANNER_CLASS}__item + .${BANNER_CLASS}__item {
        border-left: 1px solid #e5e5e5;
      }

      .${BANNER_CLASS}__icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 38px;
        min-width: 38px;
        height: 38px;

        color: #001bde;
      }

      .${BANNER_CLASS}__icon svg {
        display: block;
        width: 34px;
        height: 34px;

        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .${BANNER_CLASS}__copy {
        font-family: inherit;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
        color: #111111;
      }

      /*
       * MOBILE
       */
      @media (max-width: 767px) {
        .${BANNER_CLASS} {
          display: flex;
          flex-direction: column;

          width: calc(100% - 32px);
          max-width: none;

          margin: 16px auto 0;
          padding: 14px 16px;

          border-radius: 8px;
        }

        .${BANNER_CLASS}__item {
          width: 100%;
          flex: none;

          padding: 8px 0;
          gap: 12px;
        }

        .${BANNER_CLASS}__item:first-child,
        .${BANNER_CLASS}__item:last-child {
          padding-left: 0;
          padding-right: 0;
        }

        .${BANNER_CLASS}__item + .${BANNER_CLASS}__item {
          border-left: 0;
        }

        .${BANNER_CLASS}__icon {
          width: 30px;
          min-width: 30px;
          height: 30px;
        }

        .${BANNER_CLASS}__icon svg {
          width: 27px;
          height: 27px;
        }

        .${BANNER_CLASS}__copy {
          font-size: 12px;
          line-height: 1.3;
        }
      }
    `;

    document.head.appendChild(style);
  }


  function buildBanner() {
    var banner = document.createElement('div');

    banner.className = BANNER_CLASS;

    banner.innerHTML = `

      <!-- 1. No contracts -->
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
              font-size="11"
              font-family="Arial, sans-serif"
              font-weight="700">$0</text>
          </svg>
        </div>

        <div class="${BANNER_CLASS}__copy">
          No contracts<br>
          or commitments
        </div>
      </div>


      <!-- 2. Change or cancel -->
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
          Change or cancel<br>
          anytime
        </div>
      </div>


      <!-- 3. Same great price -->
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
          Same great price<br>
          every year
        </div>
      </div>


      <!-- 4. Hassle-free -->
      <div class="${BANNER_CLASS}__item">
        <div class="${BANNER_CLASS}__icon" aria-hidden="true">
          <svg viewBox="0 0 40 40">
            <path d="M13 18v16H7V18h6z"></path>
            <path d="M13 31h15c2 0 3.5-1 4.2-2.7l3.3-8.2c.8-2-.7-4.1-2.9-4.1H25l1-6c.3-2-1.2-4-3.3-4H21l-8 12"></path>
          </svg>
        </div>

        <div class="${BANNER_CLASS}__copy">
          100% hassle-free<br>
          online experience
        </div>
      </div>

    `;

    return banner;
  }


  function injectBanner() {
    /*
     * Scope specifically to the SEM Internet hero.
     */
    var hero = document.querySelector(
      'pex-pl-hero-builder pex-pl-hero'
    );

    if (!hero) return false;


    /*
     * Never inject twice.
     */
    if (hero.querySelector('.' + BANNER_CLASS)) {
      return true;
    }


    /*
     * The banner should sit below the existing hero copy / CTAs
     * while remaining inside the hero.
     */
    var content = hero.querySelector('pex-pl-hero-content');

    if (!content) return false;


    var banner = buildBanner();

    content.appendChild(banner);

    return true;
  }


  function init() {
    addStyles();

    /*
     * Try immediately.
     */
    if (injectBanner()) return;


    /*
     * Spectrum renders through Angular, so wait for the hero
     * if it is not available when Target first executes.
     */
    var attempts = 0;
    var maxAttempts = 50;

    var interval = setInterval(function () {
      attempts++;

      if (injectBanner() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
</script>
