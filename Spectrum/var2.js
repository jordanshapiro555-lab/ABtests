<script id="hero-benefit-banner" type="html/js">
(function () {
  'use strict';

  var BANNER_ID = 'exp-spectrum-benefit-banner';

  function iconSvg(type) {
    if (type === 'contracts') {
      return `
        <svg viewBox="0 0 40 40"
             style="width:34px;height:34px;display:block;fill:none;stroke:#0037ff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;">
          <path d="M12 7.5a14 14 0 1 0 17.5 3"></path>
          <path d="M12 3.5v8h8"></path>
          <text x="20" y="24"
                text-anchor="middle"
                fill="#0037ff"
                stroke="none"
                font-size="10"
                font-family="Arial, sans-serif"
                font-weight="700">$0</text>
        </svg>`;
    }

    if (type === 'calendar') {
      return `
        <svg viewBox="0 0 40 40"
             style="width:34px;height:34px;display:block;fill:none;stroke:#0037ff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;">
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
        </svg>`;
    }

    if (type === 'tag') {
      return `
        <svg viewBox="0 0 40 40"
             style="width:34px;height:34px;display:block;fill:none;stroke:#0037ff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;">
          <path d="M7 20L20 7h12v12L19 32 7 20z"></path>
          <circle cx="26.5" cy="12.5" r="2"></circle>
          <path d="M15 19h8"></path>
          <path d="M19 15v8"></path>
        </svg>`;
    }

    return `
      <svg viewBox="0 0 40 40"
           style="width:34px;height:34px;display:block;fill:none;stroke:#0037ff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;">
        <path d="M13 18v16H7V18h6z"></path>
        <path d="M13 31h15c2 0 3.5-1 4.2-2.7l3.3-8.2c.8-2-.7-4.1-2.9-4.1H25l1-6c.3-2-1.2-4-3.3-4H21l-8 12"></path>
      </svg>`;
  }


  function makeItem(icon, line1, line2, hasDivider) {
    var item = document.createElement('div');

    item.style.cssText = [
      'display:flex!important',
      'flex-direction:row!important',
      'align-items:center!important',
      'flex:1 1 25%!important',
      'min-width:0!important',
      'gap:16px!important',
      'padding:0 28px!important',
      'box-sizing:border-box!important',
      hasDivider ? 'border-left:1px solid #dedede!important' : ''
    ].join(';');

    item.innerHTML = `
      <div style="
        flex:0 0 36px!important;
        width:36px!important;
        height:36px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
      ">
        ${iconSvg(icon)}
      </div>

      <div style="
        display:block!important;
        min-width:0!important;
        font-family:inherit!important;
        font-size:14px!important;
        line-height:1.35!important;
        font-weight:500!important;
        color:#111!important;
        white-space:normal!important;
      ">
        <span style="display:block!important;white-space:nowrap!important;">${line1}</span>
        <span style="display:block!important;white-space:nowrap!important;">${line2}</span>
      </div>
    `;

    return item;
  }


  function buildBanner() {
    var banner = document.createElement('div');

    banner.id = BANNER_ID;

    banner.style.cssText = [
      'position:absolute!important',
      'left:50%!important',
      'bottom:18px!important',
      'transform:translateX(-50%)!important',
      'z-index:99999!important',

      'display:flex!important',
      'flex-direction:row!important',
      'align-items:center!important',

      'width:calc(100% - 160px)!important',
      'max-width:1100px!important',
      'min-height:76px!important',

      'margin:0!important',
      'padding:18px 22px!important',
      'box-sizing:border-box!important',

      'background:#ffffff!important',
      'border:1px solid #e2e2e2!important',
      'border-radius:10px!important',
      'box-shadow:0 3px 12px rgba(0,0,0,.18)!important',

      'color:#111!important'
    ].join(';');

    banner.appendChild(
      makeItem('contracts', 'No contracts', 'or commitments', false)
    );

    banner.appendChild(
      makeItem('calendar', 'Change or cancel', 'anytime', true)
    );

    banner.appendChild(
      makeItem('tag', 'Same great price', 'every year', true)
    );

    banner.appendChild(
      makeItem('thumb', '100% hassle-free', 'online experience', true)
    );

    return banner;
  }


  function applyMobileStyles(banner) {
    if (window.innerWidth > 767) return;

    banner.style.cssText = [
      'position:relative!important',
      'left:auto!important',
      'bottom:auto!important',
      'transform:none!important',
      'z-index:10!important',

      'display:flex!important',
      'flex-direction:column!important',
      'align-items:stretch!important',

      'width:calc(100% - 32px)!important',
      'max-width:none!important',
      'min-height:0!important',

      'margin:16px auto!important',
      'padding:10px 16px!important',
      'box-sizing:border-box!important',

      'background:#ffffff!important',
      'border:1px solid #e2e2e2!important',
      'border-radius:8px!important',
      'box-shadow:0 3px 12px rgba(0,0,0,.18)!important'
    ].join(';');

    Array.prototype.forEach.call(
      banner.children,
      function (item) {
        item.style.cssText = [
          'display:flex!important',
          'flex-direction:row!important',
          'align-items:center!important',
          'flex:none!important',
          'width:100%!important',
          'gap:12px!important',
          'padding:8px 0!important',
          'box-sizing:border-box!important',
          'border-left:0!important'
        ].join(';');

        var spans = item.querySelectorAll('span');

        Array.prototype.forEach.call(
          spans,
          function (span) {
            span.style.whiteSpace = 'normal';
          }
        );
      }
    );
  }


  function injectBanner() {
    var builder = document.querySelector('pex-pl-hero-builder');
    if (!builder) return false;

    var hero = builder.querySelector('pex-pl-hero');
    if (!hero) return false;

    /*
     * This is critical because the banner is absolutely
     * positioned relative to the builder.
     */
    builder.style.setProperty('position', 'relative', 'important');
    builder.style.setProperty('display', 'block', 'important');

    var existing = document.getElementById(BANNER_ID);

    if (existing) {
      return true;
    }

    var banner = buildBanner();

    /*
     * Keep it outside Spectrum's inner hero component.
     */
    builder.appendChild(banner);

    applyMobileStyles(banner);

    return true;
  }


  function init() {
    injectBanner();

    /*
     * Spectrum / Angular can rebuild the hero after Target runs,
     * so keep checking for 15 seconds.
     */
    var attempts = 0;

    var interval = setInterval(function () {
      attempts++;

      injectBanner();

      if (attempts >= 75) {
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
