<script>
(function () {
  var STYLE_ID = 'gsi-carousel-bottom-arrows-style';

  var existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }

  var css = `
    .cmp-carousel--side-arrows .cmp-carousel {
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__content {
      order: 1 !important;
      position: relative !important;
      z-index: 1 !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__controls {
      order: 2 !important;
      position: relative !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;

      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 14px !important;

      width: 100% !important;
      margin: 18px auto 0 !important;
      padding: 0 !important;
      z-index: 2 !important;
      pointer-events: auto !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action {
      position: relative !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;

      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;

      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      opacity: 1 !important;
      cursor: pointer !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action-icon,
    .cmp-carousel--side-arrows .cmp-carousel__action-icon::before,
    .cmp-carousel--side-arrows .cmp-carousel__action-icon::after {
      display: none !important;
      content: none !important;
      background: none !important;
      border: 0 !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action::before {
      content: "" !important;
      display: block !important;
      width: 15px !important;
      height: 15px !important;
      border-style: solid !important;
      border-color: currentColor !important;
      border-width: 0 4px 4px 0 !important;
      border-radius: 1px !important;
      background: transparent !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action--previous::before {
      transform: rotate(135deg) !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action--next::before {
      transform: rotate(-45deg) !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__action-text {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__indicators {
      position: relative !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;

      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;

      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .cmp-carousel--side-arrows .cmp-carousel__indicator {
      margin: 0 !important;
      cursor: pointer !important;
    }

    @media (max-width: 767px) {
      .cmp-carousel--side-arrows .cmp-carousel__controls {
        margin-top: 16px !important;
        gap: 12px !important;
      }

      .cmp-carousel--side-arrows .cmp-carousel__action {
        width: 26px !important;
        height: 26px !important;
        min-width: 26px !important;
        min-height: 26px !important;
      }

      .cmp-carousel--side-arrows .cmp-carousel__action::before {
        width: 14px !important;
        height: 14px !important;
      }
    }
  `;

  var style = document.createElement('style');
  style.id = STYLE_ID;
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();
</script>
