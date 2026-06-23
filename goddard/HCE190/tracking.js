<script>
    (function() {
        function getGsiAvailabilityFlagStatus() {
            var selector = [
                '.gsi-school-classroom-cards__availability.available',
                '.gsi-school-classroom-cards__availability.limited',
                '.gsi-school-classroom-cards__availability.upcoming'
            ].join(',');

            var flags = Array.prototype.slice.call(document.querySelectorAll(selector));

            if (!flags.length) {
                return 'none';
            }

            // If multiple flags exist, prioritize the most actionable status.
            var priority = ['available', 'limited', 'upcoming'];

            for (var i = 0; i < priority.length; i++) {
                var status = priority[i];
                for (var j = 0; j < flags.length; j++) {
                    if (flags[j].classList.contains(status)) {
                        return status;
                    }
                }
            }
            return 'none';
        }

        function sendGsiAvailabilityToTarget() {
            var status = getGsiAvailabilityFlagStatus();
            var hasFlag = status !== 'none' ? 'true' : 'false';
            if (window.adobe && adobe.target && typeof adobe.target.trackEvent === 'function') {
                adobe.target.trackEvent({
                    mbox: 'gsiAvailabilityFlagDetector',
                    params: {
                        'profile.gsiHasAvailabilityFlag': hasFlag,
                        'profile.gsiAvailabilityFlagStatus': status
                    }
                });
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                window.setTimeout(sendGsiAvailabilityToTarget, 250);
            });
        } else {
            window.setTimeout(sendGsiAvailabilityToTarget, 250);
        }
    })();
</script>
