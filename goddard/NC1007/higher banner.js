<script>
    (function() {
        var TEST_ID = 'goddard-daycare-milestone-banner';

        var SELECTORS = {
            heading: '#searchNearYouHeading',
            resultsWrap: '#searchNearYou .gsi-school-locator__results',
            resultsList: '#searchNearYouResultsList',
            resultsItem: '#searchNearYouResultsList .gsi-school-locator__results-item'
        };

        var MQ_MOBILE = window.matchMedia('(max-width: 47.999rem)');
        var MAX_WAIT_MS = 15000;
        var CHECK_INTERVAL_MS = 250;

        var startedAt = Date.now();
        var intervalId = null;
        var observer = null;
        var resizeTimer = null;
        var isApplying = false;

        function setImportant(el, styles) {
            if (!el) return;

            Object.keys(styles).forEach(function(prop) {
                el.style.setProperty(prop, styles[prop], 'important');
            });
        }

        function updateHeading() {
            var heading = document.querySelector(SELECTORS.heading);

            if (heading && heading.textContent.trim() !== 'Find your Goddard Daycare') {
                heading.textContent = 'Find your Goddard Daycare';
            }
        }

        function hasResults() {
            return !!(
                document.querySelector(SELECTORS.resultsWrap) &&
                document.querySelector(SELECTORS.resultsList) &&
                document.querySelector(SELECTORS.resultsItem)
            );
        }

        function buildBannerHTML() {
            return (
                '<div class="' + TEST_ID + '__title">Infant Care Classroom Milestones:</div>' +
                '<div class="' + TEST_ID + '__body">' +
                '<span class="' + TEST_ID + '__bullet" aria-hidden="true">•</span>' +
                '<span class="' + TEST_ID + '__copy">Develop physical skills like crawling and rolling, fine motor skills like holding a crayon and an internal sense of security and safety</span>' +
                '</div>'
            );
        }

        function applyBannerStyles(banner) {
            if (!banner) return;

            var title = banner.querySelector('.' + TEST_ID + '__title');
            var body = banner.querySelector('.' + TEST_ID + '__body');
            var bullet = banner.querySelector('.' + TEST_ID + '__bullet');
            var copy = banner.querySelector('.' + TEST_ID + '__copy');

            setImportant(banner, {
                display: 'block',
                width: '100%',
                'box-sizing': 'border-box',
                background: '#f3e6cd',
                color: '#08294f',
                padding: '12px 18px 13px',
                margin: '0',
                border: '0',
                'border-bottom': '1px solid rgba(8, 41, 79, 0.12)',
                'box-shadow': '0 1px 5px rgba(8, 41, 79, 0.08)',
                'font-family': '"Noto Sans", Arial, sans-serif',
                'font-style': 'normal',
                'letter-spacing': '0',
                'text-transform': 'none',
                'z-index': '9999'
            });

            setImportant(title, {
                display: 'block',
                margin: '0 0 7px',
                padding: '0',
                color: '#08294f',
                'font-family': '"Noto Sans", Arial, sans-serif',
                'font-size': '17px',
                'line-height': '1.25',
                'font-weight': '700',
                'font-style': 'normal',
                'letter-spacing': '0',
                'text-transform': 'none',
                'text-decoration': 'none'
            });

            setImportant(body, {
                display: 'grid',
                'grid-template-columns': '10px 1fr',
                'column-gap': '10px',
                'align-items': 'start',
                margin: '0',
                padding: '0',
                color: '#08294f',
                'font-family': '"Noto Sans", Arial, sans-serif'
            });

            setImportant(bullet, {
                display: 'block',
                color: '#08294f',
                'font-family': '"Noto Sans", Arial, sans-serif',
                'font-size': '15px',
                'line-height': '1.35',
                'font-weight': '700',
                margin: '0',
                padding: '0'
            });

            setImportant(copy, {
                display: 'block',
                color: '#08294f',
                'font-family': '"Noto Sans", Arial, sans-serif',
                'font-size': '14px',
                'line-height': '1.38',
                'font-weight': '400',
                'font-style': 'normal',
                'letter-spacing': '0',
                'text-transform': 'none',
                'text-decoration': 'none',
                margin: '0',
                padding: '0'
            });
        }

        function applyPlacement(resultsWrap, resultsList, banner) {
            if (!resultsWrap || !resultsList || !banner) return;

            if (MQ_MOBILE.matches) {
                setImportant(resultsWrap, {
                    position: 'relative',
                    overflow: 'visible',
                    'z-index': '20'
                });

                setImportant(resultsList, {
                    'margin-top': '0',
                    'padding-top': '0',
                    position: 'relative',
                    'z-index': '1'
                });

                setImportant(banner, {
                    position: 'absolute',
                    top: 'auto',
                    bottom: '100%',
                    left: '0',
                    right: '0',
                    margin: '0',
                    transform: 'none',
                    'pointer-events': 'none',
                    'z-index': '9999'
                });
            } else {
                setImportant(banner, {
                    position: 'relative',
                    top: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    right: 'auto',
                    margin: '0',
                    transform: 'none',
                    'pointer-events': 'auto',
                    'z-index': '9999'
                });
            }
        }

        function getOrCreateBanner(resultsWrap) {
            var banner = resultsWrap.querySelector('.' + TEST_ID);

            if (!banner) {
                banner = document.createElement('div');
                banner.className = TEST_ID;
                banner.setAttribute('role', 'region');
                banner.setAttribute('aria-label', 'Infant Care Classroom Milestones');
            }

            banner.innerHTML = buildBannerHTML();
            banner.setAttribute('role', 'region');
            banner.setAttribute('aria-label', 'Infant Care Classroom Milestones');

            return banner;
        }

        function placeBanner() {
            if (isApplying) return false;
            isApplying = true;

            updateHeading();

            var resultsWrap = document.querySelector(SELECTORS.resultsWrap);
            var resultsList = document.querySelector(SELECTORS.resultsList);

            if (!resultsWrap || !resultsList || !hasResults()) {
                isApplying = false;
                return false;
            }

            var banner = getOrCreateBanner(resultsWrap);

            if (banner.parentNode !== resultsWrap || banner.nextElementSibling !== resultsList) {
                resultsWrap.insertBefore(banner, resultsList);
            }

            applyBannerStyles(banner);
            applyPlacement(resultsWrap, resultsList, banner);

            isApplying = false;
            return true;
        }

        function cleanupInterval() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function check() {
            if (placeBanner()) {
                cleanupInterval();
                return;
            }

            if (Date.now() - startedAt > MAX_WAIT_MS) {
                cleanupInterval();

                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            }
        }

        function reapply() {
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }

            resizeTimer = setTimeout(function() {
                placeBanner();
            }, 100);
        }

        function init() {
            check();

            intervalId = setInterval(check, CHECK_INTERVAL_MS);

            observer = new MutationObserver(function() {
                if (!isApplying && !document.querySelector('.' + TEST_ID)) {
                    check();
                }
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });

            if (MQ_MOBILE.addEventListener) {
                MQ_MOBILE.addEventListener('change', reapply);
            } else if (MQ_MOBILE.addListener) {
                MQ_MOBILE.addListener(reapply);
            }

            window.addEventListener('resize', reapply);
            window.addEventListener('orientationchange', reapply);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
</script>
