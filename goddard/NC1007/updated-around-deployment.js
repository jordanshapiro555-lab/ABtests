<script>
    (function() {
        var TEST_ID = 'goddard-daycare-milestone-banner';

        var SELECTORS = {
            resultsWrap: '.gsi-school-locator__results.gsi-school-locator__results--visible',
            resultsToggle: '#schoolLocatorResultsToggle',
            resultsList: '#schoolLocatorResultsList',
            firstResultItem: '#schoolLocatorResultsList .gsi-school-locator__results-item'
        };

        var MQ_DESKTOP = window.matchMedia('(min-width: 48rem)');
        var MAX_WAIT_MS = 15000;
        var CHECK_INTERVAL_MS = 250;

        var startedAt = Date.now();
        var intervalId = null;
        var observer = null;
        var isApplying = false;

        function setImportant(el, styles) {
            if (!el) return;

            Object.keys(styles).forEach(function(prop) {
                el.style.setProperty(prop, styles[prop], 'important');
            });
        }

        function buildBannerHTML() {
            return (
                '<div class="' + TEST_ID + '__title">Infant Care Classroom Milestones:</div>' +
                '<div class="' + TEST_ID + '__body">' +
                '<span class="' + TEST_ID + '__bullet" aria-hidden="true">•</span>' +
                '<span class="' + TEST_ID + '__copy">Form secure attachments to teachers so they feel safe and ready to develop physical skills like crawling and rolling and fine motor skills like grasping</span>' +
                '</div>'
            );
        }

        function styleResultsWrap(resultsWrap) {
            if (!resultsWrap) return;

            if (MQ_DESKTOP.matches) {
                resultsWrap.style.setProperty('width', '21rem', 'important');
                resultsWrap.style.setProperty('max-width', '21rem', 'important');
            } else {
                resultsWrap.style.removeProperty('width');
                resultsWrap.style.removeProperty('max-width');
            }
        }

        function styleBanner(banner) {
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
                position: 'relative',
                'z-index': '2'
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

        function insertBanner() {
            if (isApplying) return false;
            isApplying = true;

            var resultsWrap = document.querySelector(SELECTORS.resultsWrap);
            var resultsToggle = document.querySelector(SELECTORS.resultsToggle);
            var resultsList = document.querySelector(SELECTORS.resultsList);
            var firstResultItem = document.querySelector(SELECTORS.firstResultItem);

            if (!resultsWrap || !resultsList || !firstResultItem) {
                isApplying = false;
                return false;
            }

            styleResultsWrap(resultsWrap);

            var banner = resultsWrap.querySelector('.' + TEST_ID);

            if (!banner) {
                banner = document.createElement('div');
                banner.className = TEST_ID;
                banner.setAttribute('role', 'region');
                banner.setAttribute('aria-label', 'Infant Care Classroom Milestones');
                banner.innerHTML = buildBannerHTML();
            }

            if (resultsToggle && resultsToggle.parentNode === resultsWrap) {
                if (resultsToggle.nextElementSibling !== banner) {
                    resultsWrap.insertBefore(banner, resultsToggle.nextElementSibling);
                }
            } else if (banner.nextElementSibling !== resultsList) {
                resultsWrap.insertBefore(banner, resultsList);
            }

            styleBanner(banner);

            isApplying = false;
            return true;
        }

        function check() {
            if (insertBanner()) {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return;
            }

            if (Date.now() - startedAt > MAX_WAIT_MS && intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function reapply() {
            insertBanner();
        }

        function init() {
            check();
            intervalId = setInterval(check, CHECK_INTERVAL_MS);

            observer = new MutationObserver(function() {
                check();
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });

            if (MQ_DESKTOP.addEventListener) {
                MQ_DESKTOP.addEventListener('change', reapply);
            } else if (MQ_DESKTOP.addListener) {
                MQ_DESKTOP.addListener(reapply);
            }

            window.addEventListener('resize', reapply);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
</script>
