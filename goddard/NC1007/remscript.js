<script>
    (function() {
        var PANEL_SELECTOR = '#gsiSchoolLocator > div.gsi-school-locator__panel';
        var MQ = window.matchMedia('(min-width: 48rem)');
        var MAX_WAIT_MS = 15000;
        var CHECK_INTERVAL_MS = 100;
        var startedAt = Date.now();
        var intervalId = null;

        function applyPanelWidth() {
            var panel = document.querySelector(PANEL_SELECTOR);
            if (!panel) return false;

            if (MQ.matches) {
                panel.style.setProperty('max-width', '19rem', 'important');
            } else {
                panel.style.removeProperty('max-width');
            }

            return true;
        }

        function check() {
            if (applyPanelWidth() || Date.now() - startedAt > MAX_WAIT_MS) {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        }

        function init() {
            intervalId = setInterval(check, CHECK_INTERVAL_MS);
            check();

            if (MQ.addEventListener) {
                MQ.addEventListener('change', applyPanelWidth);
            } else if (MQ.addListener) {
                MQ.addListener(applyPanelWidth);
            }

            window.addEventListener('resize', applyPanelWidth);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
</script>
