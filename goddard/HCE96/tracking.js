<script>
    (function() {
        // Prevent duplicate listeners if Target re-applies the offer
        if (window.__gsiSchoolLocatorClickTracking) return;
        window.__gsiSchoolLocatorClickTracking = true;

        document.addEventListener('click', function(event) {
            var target = event.target;

            if (!target || !target.closest) return;


            /*
             * 1. GOOGLE MAPS / DIRECTIONS CLICK
             *
             * Tracks:
             * - School address links
             * - Directions icon links
             *
             * Must point specifically to Google Maps directions.
             */
            var mapsLink = target.closest(
                'a[href^="https://www.google.com/maps/dir/"]'
            );

            if (mapsLink) {
                adobe.target.trackEvent({
                    mbox: 'school_locator_directions_click'
                });

                return;
            }


            /*
             * 2. WEBSITE ICON CLICK
             *
             * Tracks school Website links/icons.
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
             * 3. CARD HEADER CLICK
             *
             * Tracks school-name/header links.
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
             * 4. TOUR CTA CLICK
             *
             * Tracks Book A Tour / Tell Me More buttons
             * pointing to a school's Goddard form.
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
