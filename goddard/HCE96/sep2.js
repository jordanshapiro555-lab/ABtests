<script type="text/javascript">
    (function() {
        "use strict";

        /* ============================================================
           SHARED UTILITIES
           ============================================================ */
        function getText(element) {
            return element ? String(element.textContent || "").replace(/\s+/g, " ").trim() : "";
        }

        function escapeHtml(value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
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

        /* ============================================================
           1. CLICK TRACKING
           ============================================================ */
        function initClickTracking() {
            // Prevent duplicate listeners if Target re-applies the offer
            if (window.__gsiSchoolLocatorClickTracking) return;
            window.__gsiSchoolLocatorClickTracking = true;

            document.addEventListener("click", function(event) {
                var target = event.target;
                if (!target || !target.closest) return;

                // 1. Google Maps / directions
                var mapsLink = target.closest('a[href^="https://www.google.com/maps/dir/"]');
                if (mapsLink) {
                    adobe.target.trackEvent({
                        mbox: "school_locator_directions_click"
                    });
                    return;
                }

                // 2. Website icon
                var websiteLink = target.closest("a.gsi-school-locator__results-item-link");
                if (websiteLink) {
                    adobe.target.trackEvent({
                        mbox: "school_locator_website_click"
                    });
                    return;
                }

                // 3. Card header
                var cardHeader = target.closest("a.gsi-exp-card__name");
                if (cardHeader) {
                    adobe.target.trackEvent({
                        mbox: "school_locator_card_header_click"
                    });
                    return;
                }

                // 4. Tour CTA
                var tourCTA = target.closest(
                    'a.cmp-button.cmp-button--cool-mint[href*="/our-school/goddard-form"]'
                );
                if (tourCTA) {
                    adobe.target.trackEvent({
                        mbox: "school_locator_tour_cta_click"
                    });
                    return;
                }
            }, false);
        }

        /* ============================================================
           2. LIST CARD REWRITE
           ============================================================ */
        var LIST_RENDER_DEBOUNCE_MS = 100;
        var LIST_APPLIED_ATTR = "data-gsi-experiment-applied";
        var listRenderTimer = null;

        function extractCardData(item) {
            var data = {};

            var numberElement = item.querySelector(".gsi-school-locator__results-item-number");
            var headingElement = item.querySelector(".gsi-school-locator__results-item-heading");
            var reviewsElement = item.querySelector(".gsi-google-reviews.gsi-google-reviews--school-locator");
            var comingSoonElement = item.querySelector(".gsi-school-locator__results-item-coming-soon");
            var distanceElement = item.querySelector(".gsi-font-size-xsmall");
            var featuresElement = item.querySelector(".gsi-school-locator__features-list");
            var resultLinks = item.querySelectorAll(".gsi-school-locator__results-item-link");

            var websiteElement = null;
            var websiteLabelElement = null;
            var directionsElement = null;

            var infoBlock = item.querySelector(".gsi-font-size-small");
            var phoneElement = infoBlock ?
                infoBlock.querySelector(".gsi-school-locator__results-item-telephone") :
                null;

            var tourElement = item.querySelector("a.cmp-button[href*='/our-school/goddard-form']");

            data.number = getText(numberElement).replace(/\.$/, "");
            data.name = getText(headingElement);
            data.schoolHref = headingElement ? headingElement.getAttribute("href") : null;
            data.googleReviewsHtml = reviewsElement ? reviewsElement.outerHTML : "";
            data.hasReviews = !!reviewsElement;
            data.comingSoon = getText(comingSoonElement);
            data.distance = getText(distanceElement).replace(/\bmiles?\b/i, "mi");
            data.featuresHtml = featuresElement ? featuresElement.outerHTML : "";

            Array.prototype.forEach.call(resultLinks, function(link) {
                var href = link.getAttribute("href") || "";
                if (!websiteElement && href.indexOf("/schools/") === 0) {
                    websiteElement = link;
                    if (link.parentNode) {
                        websiteLabelElement = link.parentNode.querySelector(
                            ".gsi-school-locator__results-item-link-label"
                        );
                    }
                }
                if (!directionsElement && href.indexOf("google.com/maps") > -1) {
                    directionsElement = link;
                }
            });

            data.websiteHtml = websiteElement ? websiteElement.outerHTML : "";
            data.websiteLabelHtml = websiteLabelElement ? websiteLabelElement.outerHTML : "";
            data.directionsHref = directionsElement ? directionsElement.getAttribute("href") : null;
            data.phone = getText(phoneElement);
            data.phoneHref = phoneElement ? phoneElement.getAttribute("href") : null;

            data.address = "";
            data.hours = "";

            if (infoBlock) {
                var infoClone = infoBlock.cloneNode(true);
                Array.prototype.forEach.call(infoClone.querySelectorAll(".sr-only"), function(element) {
                    if (element.parentNode) element.parentNode.removeChild(element);
                });
                var infoParts = String(infoClone.textContent || "")
                    .replace(/\s+/g, " ")
                    .trim()
                    .split("•")
                    .map(function(part) {
                        return part.trim();
                    })
                    .filter(Boolean);
                data.address = infoParts.length ? infoParts[0] : "";
                data.hours = infoParts.length > 1 ? infoParts[infoParts.length - 1] : "";
            }

            data.tourHtml = tourElement ? tourElement.outerHTML : "";
            return data;
        }

function buildCardHtml(data) {
    var phoneIcon = buildPhoneIcon();

    // ---- LEFT COLUMN (badge, name, reviews, coming-soon, meta, features, tour) ----
    var left = "";

    left += '<div class="gsi-exp-card__top">';
    if (data.number) {
        left += '<span class="gsi-exp-card__badge">' + escapeHtml(data.number) + "</span>";
    }
    if (data.schoolHref) {
        left += '<a class="gsi-exp-card__name" href="' + escapeHtml(data.schoolHref) + '">' +
            escapeHtml(data.name) + "</a>";
    } else {
        left += '<span class="gsi-exp-card__name">' + escapeHtml(data.name) + "</span>";
    }
    left += "</div>";

    if (data.googleReviewsHtml) left += data.googleReviewsHtml;

    if (data.comingSoon) {
        left += '<div class="gsi-exp-card__coming-soon">' + escapeHtml(data.comingSoon) + "</div>";
    }

    left += '<div class="gsi-exp-card__meta">';
    if (data.distance) {
        left += '<span class="gsi-exp-card__distance"><strong>' +
            escapeHtml(data.distance) + "</strong></span>";
    }
    if (data.distance && data.address) left += " • ";
    if (data.address) {
        if (data.directionsHref) {
            left += '<a class="gsi-exp-card__address" href="' + escapeHtml(data.directionsHref) +
                '" target="_blank" rel="noopener noreferrer">' + escapeHtml(data.address) + "</a>";
        } else {
            left += '<span class="gsi-exp-card__address">' + escapeHtml(data.address) + "</span>";
        }
    }
    if (data.hours) {
        left += '<div class="gsi-exp-card__hours">M-F ' + escapeHtml(data.hours) + "</div>";
    }
    if (data.phone && data.phoneHref) {
        left += '<a class="gsi-exp-card__phone-link" href="' + escapeHtml(data.phoneHref) + '">' +
            phoneIcon + escapeHtml(data.phone) + "</a>";
    }
    left += "</div>";

    if (data.featuresHtml) left += data.featuresHtml;

    if (data.tourHtml) {
        left += '<div class="gsi-exp-card__tour">';
        left += data.tourHtml;
        left += "</div>";
    }

    // ---- RIGHT COLUMN (website only) ----
    var right = "";
    if (data.websiteHtml) {
        right += '<div class="gsi-exp-card__website d-flex flex-column align-items-center pr-8">';
        right += data.websiteHtml;
        if (data.websiteLabelHtml) right += data.websiteLabelHtml;
        right += "</div>";
    }

    // ---- ASSEMBLE INTO PRODUCTION'S GRID ----
    var html = "";
    html += '<div class="row">';
    html += '<div class="col">' + left + "</div>";
    if (right) {
        html += '<div class="col-auto d-flex pl-0">' + right + "</div>";
    }
    html += "</div>";

    return html;
}

        function applyCard(item) {
            if (item.getAttribute(LIST_APPLIED_ATTR) === "true") return;

            var data = extractCardData(item);
            if (!data.name) return;

            item.innerHTML = buildCardHtml(data);
            item.classList.add("gsi-exp-card");
            if (!data.hasReviews) item.classList.add("gsi-exp-card--no-reviews");
            item.setAttribute(LIST_APPLIED_ATTR, "true");
        }

        function renderListCards() {
            var items = document.querySelectorAll(
                "#searchNearYouResultsList > .gsi-school-locator__results-item"
            );
            Array.prototype.forEach.call(items, function(item) {
                applyCard(item);
            });
        }

        function scheduleListRender() {
            window.clearTimeout(listRenderTimer);
            listRenderTimer = window.setTimeout(renderListCards, LIST_RENDER_DEBOUNCE_MS);
        }

        function initListRewrite() {
            renderListCards();

            if (!window.MutationObserver || !document.body) return;

            var observer = new MutationObserver(function(mutations) {
                var shouldRender = false;
                Array.prototype.forEach.call(mutations, function(mutation) {
                    if (mutation.addedNodes.length) shouldRender = true;
                });
                if (shouldRender) scheduleListRender();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        /* ============================================================
           3. POPUP CARD REWRITE
           ============================================================ */
        var POPUP_APPLIED_ATTR = "data-gsi-popup-layout-applied";
        var POPUP_RENDER_DEBOUNCE_MS = 100;
        var popupRenderTimer = null;
        var phoneIcon = buildPhoneIcon();

        function createPopupMeta(item, distanceElement, infoBlock, directionsHref) {
            if (!distanceElement || !infoBlock) return;

            var distance = getText(distanceElement).replace(/\bmiles?\b/i, "mi");

            var phoneElement = infoBlock.querySelector(".gsi-school-locator__results-item-telephone");
            var phone = getText(phoneElement);
            var phoneHref = phoneElement ? phoneElement.getAttribute("href") : "";

            var infoClone = infoBlock.cloneNode(true);
            Array.prototype.forEach.call(infoClone.querySelectorAll(".sr-only"), function(element) {
                if (element.parentNode) element.parentNode.removeChild(element);
            });

            var parts = String(infoClone.textContent || "")
                .replace(/\s+/g, " ")
                .trim()
                .split("•")
                .map(function(part) {
                    return part.trim();
                })
                .filter(Boolean);

            var address = parts.length ? parts[0] : "";
            var hours = parts.length > 1 ? parts[parts.length - 1] : "";

            var meta = document.createElement("div");
            meta.className = "gsi-popup-exp-card__meta";

            if (distance) {
                var distanceSpan = document.createElement("span");
                distanceSpan.className = "gsi-popup-exp-card__distance";
                var strong = document.createElement("strong");
                strong.textContent = distance;
                distanceSpan.appendChild(strong);
                meta.appendChild(distanceSpan);
            }

            if (distance && address) {
                meta.appendChild(document.createTextNode(" • "));
            }

            if (address) {
                var addressElement;
                if (directionsHref) {
                    addressElement = document.createElement("a");
                    addressElement.href = directionsHref;
                    addressElement.target = "_blank";
                    addressElement.rel = "noopener noreferrer";
                } else {
                    addressElement = document.createElement("span");
                }
                addressElement.className = "gsi-popup-exp-card__address";
                addressElement.textContent = address;
                meta.appendChild(addressElement);
            }

            if (hours) {
                var hoursElement = document.createElement("div");
                hoursElement.className = "gsi-popup-exp-card__hours";
                hoursElement.textContent = "M-F " + hours;
                meta.appendChild(hoursElement);
            }

            if (phone && phoneHref) {
                var phoneLink = document.createElement("a");
                phoneLink.className = "gsi-popup-exp-card__phone";
                phoneLink.href = phoneHref;
                phoneLink.innerHTML = phoneIcon;
                phoneLink.appendChild(document.createTextNode(phone));
                meta.appendChild(phoneLink);
            }

            // Keep the new information inside the existing left column.
            // This leaves Google Reviews exactly where production rendered them.
            var heading = item.querySelector(".gsi-school-locator__results-item-heading");
            var leftColumn = heading;
            while (leftColumn && !leftColumn.classList.contains("col")) {
                leftColumn = leftColumn.parentElement;
            }
            if (leftColumn) {
                leftColumn.classList.add("gsi-popup-exp-card__content-col");
                leftColumn.appendChild(meta);
            }

            // Remove only the original distance and information blocks
            // now that their information has been repositioned.
            if (distanceElement.parentNode) {
                distanceElement.parentNode.removeChild(distanceElement);
            }
            if (infoBlock.parentNode) {
                infoBlock.parentNode.removeChild(infoBlock);
            }
        }

        function applyPopupCard(item) {
            if (item.getAttribute(POPUP_APPLIED_ATTR) === "true") return;

            // Never touch the regular locator results list.
            if (item.closest("#searchNearYouResultsList")) return;

            var heading = item.querySelector(".gsi-school-locator__results-item-heading");
            if (!heading) return;

            item.classList.add("gsi-popup-exp-card");

            var links = item.querySelectorAll(".gsi-school-locator__results-item-link");
            var websiteLink = null;
            var directionsLink = null;

            Array.prototype.forEach.call(links, function(link) {
                var href = link.getAttribute("href") || "";
                if (!websiteLink && href.indexOf("/schools/") === 0) websiteLink = link;
                if (!directionsLink && href.indexOf("google.com/maps") > -1) directionsLink = link;
            });

            var directionsHref = directionsLink ? directionsLink.getAttribute("href") : "";

            // Mark the existing Website control. Its icon, color and label are preserved.
            if (websiteLink) {
                var websiteGroup = websiteLink.parentElement;
                if (websiteGroup) {
                    websiteGroup.classList.add("gsi-popup-exp-card__website");
                    if (websiteGroup.parentElement) {
                        websiteGroup.parentElement.classList.add("gsi-popup-exp-card__actions");
                    }
                }
            }

            // Remove only the Directions control and its label.
            if (directionsLink) {
                var directionsGroup = directionsLink.parentElement;
                if (directionsGroup && directionsGroup.parentNode) {
                    directionsGroup.parentNode.removeChild(directionsGroup);
                }
            }

            // Find the actual distance element specifically,
            // rather than assuming the first x-small element.
            var distanceElement = null;
            var smallElements = item.querySelectorAll(".gsi-font-size-xsmall");
            Array.prototype.forEach.call(smallElements, function(element) {
                if (!distanceElement && /\bmiles?\b/i.test(getText(element))) {
                    distanceElement = element;
                }
            });

            // Locate the production address / phone / hours block.
            var infoBlock = null;
            var telephone = item.querySelector(".gsi-school-locator__results-item-telephone");
            if (telephone) {
                var current = telephone.parentElement;
                while (current && current !== item) {
                    if (
                        current.classList.contains("gsi-font-size-xsmall") ||
                        current.classList.contains("gsi-font-size-small")
                    ) {
                        infoBlock = current;
                        break;
                    }
                    current = current.parentElement;
                }
            }

            createPopupMeta(item, distanceElement, infoBlock, directionsHref);

            item.setAttribute(POPUP_APPLIED_ATTR, "true");
        }

        function renderPopupCards() {
            var items = document.querySelectorAll(
                ".mapboxgl-popup-content .gsi-school-locator__results-item"
            );
            Array.prototype.forEach.call(items, function(item) {
                applyPopupCard(item);
            });
        }

        function schedulePopupRender() {
            window.clearTimeout(popupRenderTimer);
            popupRenderTimer = window.setTimeout(renderPopupCards, POPUP_RENDER_DEBOUNCE_MS);
        }

        function initPopupRewrite() {
            renderPopupCards();

            if (!window.MutationObserver || !document.body) return;

            var observer = new MutationObserver(function(mutations) {
                var shouldRender = false;
                Array.prototype.forEach.call(mutations, function(mutation) {
                    if (mutation.addedNodes.length) shouldRender = true;
                });
                if (shouldRender) schedulePopupRender();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        /* ============================================================
           BOOTSTRAP
           ============================================================ */
        function init() {
            initClickTracking();
            initListRewrite();
            initPopupRewrite();
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }
    })();
</script>
