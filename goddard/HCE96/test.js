<script type="text/javascript">
(function () {
    "use strict";

    var RENDER_DEBOUNCE_MS = 100;
    var APPLIED_ATTR = "data-gsi-experiment-applied";
    var renderTimer = null;

    function getText(element) {
        return element
            ? String(element.textContent || "").replace(/\s+/g, " ").trim()
            : "";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function extractCardData(item) {
        var data = {};

        var numberElement = item.querySelector(
            ".gsi-school-locator__results-item-number"
        );

        var headingElement = item.querySelector(
            ".gsi-school-locator__results-item-heading"
        );

        var reviewsElement = item.querySelector(
            ".gsi-google-reviews.gsi-google-reviews--school-locator"
        );

        var comingSoonElement = item.querySelector(
            ".gsi-school-locator__results-item-coming-soon"
        );

        var distanceElement = item.querySelector(
            ".gsi-font-size-xsmall"
        );

        var resultLinks = item.querySelectorAll(
            ".gsi-school-locator__results-item-link"
        );

        var websiteElement = null;
        var websiteLabelElement = null;
        var directionsElement = null;

        var infoBlock = item.querySelector(
            ".gsi-font-size-small"
        );

        var phoneElement = infoBlock
            ? infoBlock.querySelector(
                ".gsi-school-locator__results-item-telephone"
            )
            : null;

        var tourElement = item.querySelector(
            "a.cmp-button[href*='/our-school/goddard-form']"
        );

        data.number = getText(numberElement).replace(/\.$/, "");

        data.name = getText(headingElement);

        data.schoolHref = headingElement
            ? headingElement.getAttribute("href")
            : null;

        data.googleReviewsHtml = reviewsElement
            ? reviewsElement.outerHTML
            : "";

        data.comingSoon = getText(comingSoonElement);

        data.distance = getText(distanceElement).replace(
            /\bmiles?\b/i,
            "mi"
        );

        Array.prototype.forEach.call(resultLinks, function (link) {
            var href = link.getAttribute("href") || "";

            if (
                !websiteElement &&
                href.indexOf("/schools/") === 0
            ) {
                websiteElement = link;

                var websiteParent = link.parentNode;

                if (websiteParent) {
                    websiteLabelElement = websiteParent.querySelector(
                        ".gsi-school-locator__results-item-link-label"
                    );
                }
            }

            if (
                !directionsElement &&
                href.indexOf("google.com/maps") > -1
            ) {
                directionsElement = link;
            }
        });

        data.websiteHtml = websiteElement
            ? websiteElement.outerHTML
            : "";

        data.websiteLabelHtml = websiteLabelElement
            ? websiteLabelElement.outerHTML
            : "";

        data.directionsHref = directionsElement
            ? directionsElement.getAttribute("href")
            : null;

        data.phone = getText(phoneElement);

        data.phoneHref = phoneElement
            ? phoneElement.getAttribute("href")
            : null;

        data.address = "";
        data.hours = "";

        if (infoBlock) {
            var infoClone = infoBlock.cloneNode(true);

            Array.prototype.forEach.call(
                infoClone.querySelectorAll(".sr-only"),
                function (element) {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            );

            var infoParts = String(infoClone.textContent || "")
                .replace(/\s+/g, " ")
                .trim()
                .split("•")
                .map(function (part) {
                    return part.trim();
                })
                .filter(Boolean);

            data.address = infoParts.length
                ? infoParts[0]
                : "";

            data.hours = infoParts.length > 1
                ? infoParts[infoParts.length - 1]
                : "";
        }

        data.tourHtml = tourElement
            ? tourElement.outerHTML
            : "";

        return data;
    }

    function buildPhoneIcon() {
        return (
            '<svg class="gsi-exp-card__phone-icon" ' +
            'viewBox="0 0 24 24" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'aria-hidden="true">' +
                '<path fill="currentColor" ' +
                'd="M6.62 10.79c1.44 2.83 3.76 5.15 ' +
                '6.59 6.59l2.2-2.2c.27-.27.67-.36 ' +
                '1.02-.24 1.12.37 2.33.57 3.57.57.55 ' +
                '0 1 .45 1 1V20c0 .55-.45 1-1 ' +
                '1C10.29 21 3 13.71 3 4.5c0-.55.45-1 ' +
                '1-1h3.5c.55 0 1 .45 1 1 0 ' +
                '1.25.2 2.45.57 3.57.11.35.03.74-.25 ' +
                '1.02l-2.2 2.18z"></path>' +
            "</svg>"
        );
    }

    function buildCardHtml(data) {
        var html = "";
        var phoneIcon = buildPhoneIcon();

        if (data.websiteHtml) {
            html += '<div class="gsi-exp-card__website">';
            html += data.websiteHtml;

            if (data.websiteLabelHtml) {
                html += data.websiteLabelHtml;
            }

            html += "</div>";
        }

        html += '<div class="gsi-exp-card__top">';

        if (data.number) {
            html +=
                '<span class="gsi-exp-card__badge">' +
                escapeHtml(data.number) +
                "</span>";
        }

        if (data.schoolHref) {
            html +=
                '<a class="gsi-exp-card__name" href="' +
                escapeHtml(data.schoolHref) +
                '">' +
                escapeHtml(data.name) +
                "</a>";
        } else {
            html +=
                '<span class="gsi-exp-card__name">' +
                escapeHtml(data.name) +
                "</span>";
        }

        html += "</div>";

        if (data.googleReviewsHtml) {
            html += data.googleReviewsHtml;
        }

        if (data.comingSoon) {
            html +=
                '<div class="gsi-exp-card__coming-soon">' +
                escapeHtml(data.comingSoon) +
                "</div>";
        }

        html += '<div class="gsi-exp-card__meta">';

        if (data.distance) {
            html +=
                '<span class="gsi-exp-card__distance">' +
                    "<strong>" +
                    escapeHtml(data.distance) +
                    "</strong>" +
                "</span>";
        }

        if (data.distance && data.address) {
            html += " • ";
        }

        if (data.address) {
            if (data.directionsHref) {
                html +=
                    '<a class="gsi-exp-card__address" href="' +
                    escapeHtml(data.directionsHref) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    escapeHtml(data.address) +
                    "</a>";
            } else {
                html +=
                    '<span class="gsi-exp-card__address">' +
                    escapeHtml(data.address) +
                    "</span>";
            }
        }

        if (data.hours) {
            html +=
                '<div class="gsi-exp-card__hours">M-F ' +
                escapeHtml(data.hours) +
                "</div>";
        }

        if (data.phone && data.phoneHref) {
            html +=
                '<a class="gsi-exp-card__phone-link" href="' +
                escapeHtml(data.phoneHref) +
                '">' +
                phoneIcon +
                escapeHtml(data.phone) +
                "</a>";
        }

        html += "</div>";

        if (data.tourHtml) {
            html += '<div class="gsi-exp-card__tour">';
            html += data.tourHtml;
            html += "</div>";
        }

        return html;
    }

    function applyCard(item) {
        if (item.getAttribute(APPLIED_ATTR) === "true") {
            return;
        }

        var data = extractCardData(item);

        if (!data.name) {
            return;
        }

        item.innerHTML = buildCardHtml(data);
        item.classList.add("gsi-exp-card");
        item.setAttribute(APPLIED_ATTR, "true");
    }

    function renderCards() {
        var items = document.querySelectorAll(
            ".gsi-school-locator__results-item"
        );

        Array.prototype.forEach.call(
            items,
            function (item) {
                applyCard(item);
            }
        );
    }

    function scheduleRender() {
        window.clearTimeout(renderTimer);

        renderTimer = window.setTimeout(
            renderCards,
            RENDER_DEBOUNCE_MS
        );
    }

    function init() {
        renderCards();

        if (!window.MutationObserver || !document.body) {
            return;
        }

        var observer = new MutationObserver(
            function (mutations) {
                var shouldRender = false;

                Array.prototype.forEach.call(
                    mutations,
                    function (mutation) {
                        if (mutation.addedNodes.length) {
                            shouldRender = true;
                        }
                    }
                );

                if (shouldRender) {
                    scheduleRender();
                }
            }
        );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }
})();
</script>
