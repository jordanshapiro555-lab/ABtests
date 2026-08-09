<script>
    (function() {
        // Tracking Code
        // Prevent duplicate listeners if Target re-applies the offer
        if (window.__gsiSchoolLocatorClickTracking) return;
        window.__gsiSchoolLocatorClickTracking = true;

        document.addEventListener('click', function(event) {
            var target = event.target;

            if (!target || !target.closest) return;

            /*
             * 1. WEBSITE ICON CLICK
             *
             * Tracks only the Website link/icon used in school locator results
             * and map popups.
             *
             * Does NOT track other links that happen to have the same href.
             */
            var websiteLink = target.closest(
                'a.gsi-school-locator__results-item-link'
            );

            if (websiteLink) {
                adobe.target.trackEvent({
                    mbox: 'school_locator_website_click'
                });

                return;
            }


            /*
             * 2. CARD HEADER CLICK
             *
             * Tracks only school-name/header links.
             */
            var cardHeader = target.closest(
                'a.gsi-exp-card__name'
            );

            if (cardHeader) {
                adobe.target.trackEvent({
                    mbox: 'school_locator_card_header_click'
                });

                return;
            }


            /*
             * 3. TOUR CTA CLICK
             *
             * Tracks Book A Tour / Tell Me More buttons that specifically
             * point to a school's Goddard form.
             *
             * This avoids tracking unrelated cool-mint buttons elsewhere.
             */
            var tourCTA = target.closest(
                'a.cmp-button.cmp-button--cool-mint[href*="/our-school/goddard-form"]'
            );

            if (tourCTA) {
                adobe.target.trackEvent({
                    mbox: 'school_locator_tour_cta_click'
                });

                return;
            }

        }, false);

    })();
</script>
