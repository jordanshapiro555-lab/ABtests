<script>
    (function() {
        var MOBILE_QUERY = '(max-width: 767px)';
        var PANEL_SELECTOR = '.gsi-school-locator__panel';
        var NAV_SEARCH_ID = 'gsiNavSearch';

        var MAX_WAIT_MS = 8000;
        var CHECK_INTERVAL_MS = 150;
        var startedAt = Date.now();

        var navSearch = null;
        var observedPanels = [];
        var observer = null;
        var mobileMedia = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;

        var originalDisplay = null;
        var originalVisibility = null;
        var originalAriaHidden = null;

        var isPanelInView = false;

        function isMobile() {
            return mobileMedia ? mobileMedia.matches : window.innerWidth <= 767;
        }

        function saveOriginalState() {
            if (!navSearch || originalDisplay !== null) {
                return;
            }

            originalDisplay = navSearch.style.getPropertyValue('display') || '';
            originalVisibility = navSearch.style.getPropertyValue('visibility') || '';
            originalAriaHidden = navSearch.getAttribute('aria-hidden');
        }

        function hideNavSearch() {
            if (!navSearch) {
                return;
            }

            navSearch.style.setProperty('display', 'none', 'important');
            navSearch.style.setProperty('visibility', 'hidden', 'important');
            navSearch.setAttribute('aria-hidden', 'true');
        }

        function restoreNavSearch() {
            if (!navSearch) {
                return;
            }

            if (originalDisplay) {
                navSearch.style.setProperty('display', originalDisplay, 'important');
            } else {
                navSearch.style.removeProperty('display');
            }

            if (originalVisibility) {
                navSearch.style.setProperty('visibility', originalVisibility, 'important');
            } else {
                navSearch.style.removeProperty('visibility');
            }

            if (originalAriaHidden === null) {
                navSearch.removeAttribute('aria-hidden');
            } else {
                navSearch.setAttribute('aria-hidden', originalAriaHidden);
            }
        }

        function updateNavSearchVisibility() {
            if (!navSearch) {
                navSearch = document.getElementById(NAV_SEARCH_ID);
            }

            if (!navSearch) {
                return false;
            }

            saveOriginalState();

            if (isMobile() && isPanelInView) {
                hideNavSearch();
            } else {
                restoreNavSearch();
            }

            return true;
        }

        function setupIntersectionObserver() {
            var panels = document.querySelectorAll(PANEL_SELECTOR);

            if (!panels.length) {
                return false;
            }

            if (observer) {
                observer.disconnect();
            }

            observedPanels = Array.prototype.slice.call(panels);

            observer = new IntersectionObserver(function(entries) {
                var anyPanelInView = false;

                for (var i = 0; i < observedPanels.length; i++) {
                    var rect = observedPanels[i].getBoundingClientRect();

                    if (
                        rect.width > 0 &&
                        rect.height > 0 &&
                        rect.bottom > 0 &&
                        rect.top < window.innerHeight
                    ) {
                        anyPanelInView = true;
                        break;
                    }
                }

                isPanelInView = anyPanelInView;
                updateNavSearchVisibility();
            }, {
                root: null,
                threshold: 0
            });

            for (var j = 0; j < observedPanels.length; j++) {
                observer.observe(observedPanels[j]);
            }

            return true;
        }

        function init() {
            navSearch = document.getElementById(NAV_SEARCH_ID);

            var hasNavSearch = !!navSearch;
            var hasObserver = setupIntersectionObserver();

            if (hasNavSearch) {
                saveOriginalState();
                updateNavSearchVisibility();
            }

            if ((!hasNavSearch || !hasObserver) && Date.now() - startedAt < MAX_WAIT_MS) {
                setTimeout(init, CHECK_INTERVAL_MS);
            }
        }

        if (mobileMedia) {
            if (mobileMedia.addEventListener) {
                mobileMedia.addEventListener('change', updateNavSearchVisibility);
            } else if (mobileMedia.addListener) {
                mobileMedia.addListener(updateNavSearchVisibility);
            }
        }

        window.addEventListener('orientationchange', function() {
            setTimeout(updateNavSearchVisibility, 250);
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
</script>
