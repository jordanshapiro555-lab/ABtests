<script type="text/javascript">
    (function() {
        "use strict";

        var APPLIED_ATTR = "data-gsi-popup-layout-applied";
        var RENDER_DEBOUNCE_MS = 100;
        var renderTimer = null;

        function getText(element) {
            return element ?
                String(element.textContent || "").replace(/\s+/g, " ").trim() :
                "";
        }

        function createMeta(item, distanceElement, infoBlock, directionsHref) {
            if (!distanceElement || !infoBlock) {
                return;
            }

            var distance = getText(distanceElement).replace(
                /\bmiles?\b/i,
                "mi"
            );

            var phoneElement = infoBlock.querySelector(
                ".gsi-school-locator__results-item-telephone"
            );

            var phone = getText(phoneElement);
            var phoneHref = phoneElement ?
                phoneElement.getAttribute("href") :
                "";

            var infoClone = infoBlock.cloneNode(true);

            Array.prototype.forEach.call(
                infoClone.querySelectorAll(".sr-only"),
                function(element) {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            );

            var parts = String(infoClone.textContent || "")
                .replace(/\s+/g, " ")
                .trim()
                .split("•")
                .map(function(part) {
                    return part.trim();
                })
                .filter(Boolean);

            var address = parts.length ?
                parts[0] :
                "";

            var hours = parts.length > 1 ?
                parts[parts.length - 1] :
                "";

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
                meta.appendChild(
                    document.createTextNode(" • ")
                );
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

                addressElement.className =
                    "gsi-popup-exp-card__address";

                addressElement.textContent = address;

                meta.appendChild(addressElement);
            }

            if (hours) {
                var hoursElement = document.createElement("div");

                hoursElement.className =
                    "gsi-popup-exp-card__hours";

                hoursElement.textContent =
                    "M-F " + hours;

                meta.appendChild(hoursElement);
            }

            if (phone && phoneHref) {
                var phoneLink = document.createElement("a");

                phoneLink.className =
                    "gsi-popup-exp-card__phone";

                phoneLink.href = phoneHref;
                phoneLink.textContent = phone;

                meta.appendChild(phoneLink);
            }

            /*
             * Keep the new information inside the existing left column.
             * This leaves Google Reviews exactly where production rendered them.
             */
            var heading = item.querySelector(
                ".gsi-school-locator__results-item-heading"
            );

            var leftColumn = heading;

            while (
                leftColumn &&
                !leftColumn.classList.contains("col")
            ) {
                leftColumn = leftColumn.parentElement;
            }

            if (leftColumn) {
                leftColumn.classList.add("gsi-popup-exp-card__content-col");
                leftColumn.appendChild(meta);
            }

            /*
             * Remove only the original distance and information blocks
             * now that their information has been repositioned.
             */
            if (distanceElement.parentNode) {
                distanceElement.parentNode.removeChild(distanceElement);
            }

            if (infoBlock.parentNode) {
                infoBlock.parentNode.removeChild(infoBlock);
            }
        }

        function applyPopupCard(item) {
            if (item.getAttribute(APPLIED_ATTR) === "true") {
                return;
            }

            /*
             * Never touch the regular locator results list.
             */
            if (item.closest("#searchNearYouResultsList")) {
                return;
            }

            var heading = item.querySelector(
                ".gsi-school-locator__results-item-heading"
            );

            if (!heading) {
                return;
            }

            item.classList.add("gsi-popup-exp-card");

            var links = item.querySelectorAll(
                ".gsi-school-locator__results-item-link"
            );

            var websiteLink = null;
            var directionsLink = null;

            Array.prototype.forEach.call(
                links,
                function(link) {
                    var href = link.getAttribute("href") || "";

                    if (
                        !websiteLink &&
                        href.indexOf("/schools/") === 0
                    ) {
                        websiteLink = link;
                    }

                    if (
                        !directionsLink &&
                        href.indexOf("google.com/maps") > -1
                    ) {
                        directionsLink = link;
                    }
                }
            );

            var directionsHref = directionsLink ?
                directionsLink.getAttribute("href") :
                "";

            /*
             * Mark the existing Website control.
             * Its icon, color and label are preserved.
             */
            if (websiteLink) {
                var websiteGroup = websiteLink.parentElement;

                if (websiteGroup) {
                    websiteGroup.classList.add(
                        "gsi-popup-exp-card__website"
                    );

                    if (websiteGroup.parentElement) {
                        websiteGroup.parentElement.classList.add(
                            "gsi-popup-exp-card__actions"
                        );
                    }
                }
            }

            /*
             * Remove only the Directions control and its label.
             */
            if (directionsLink) {
                var directionsGroup =
                    directionsLink.parentElement;

                if (
                    directionsGroup &&
                    directionsGroup.parentNode
                ) {
                    directionsGroup.parentNode.removeChild(
                        directionsGroup
                    );
                }
            }

            /*
             * Find the actual distance element specifically,
             * rather than assuming the first x-small element.
             */
            var distanceElement = null;

            var smallElements = item.querySelectorAll(
                ".gsi-font-size-xsmall"
            );

            Array.prototype.forEach.call(
                smallElements,
                function(element) {
                    if (
                        !distanceElement &&
                        /\bmiles?\b/i.test(getText(element))
                    ) {
                        distanceElement = element;
                    }
                }
            );

            /*
             * Locate the production address / phone / hours block.
             */
            var infoBlock = null;

            var telephone = item.querySelector(
                ".gsi-school-locator__results-item-telephone"
            );

            if (telephone) {
                var current = telephone.parentElement;

                while (
                    current &&
                    current !== item
                ) {
                    if (
                        current.classList.contains(
                            "gsi-font-size-xsmall"
                        ) ||
                        current.classList.contains(
                            "gsi-font-size-small"
                        )
                    ) {
                        infoBlock = current;
                        break;
                    }

                    current = current.parentElement;
                }
            }

            createMeta(
                item,
                distanceElement,
                infoBlock,
                directionsHref
            );

            item.setAttribute(
                APPLIED_ATTR,
                "true"
            );
        }

        function renderPopupCards() {
            var items = document.querySelectorAll(
                ".mapboxgl-popup-content .gsi-school-locator__results-item"
            );

            Array.prototype.forEach.call(
                items,
                function(item) {
                    applyPopupCard(item);
                }
            );
        }

        function scheduleRender() {
            window.clearTimeout(renderTimer);

            renderTimer = window.setTimeout(
                renderPopupCards,
                RENDER_DEBOUNCE_MS
            );
        }

        function init() {
            renderPopupCards();

            if (!window.MutationObserver || !document.body) {
                return;
            }

            var observer = new MutationObserver(
                function(mutations) {
                    var shouldRender = false;

                    Array.prototype.forEach.call(
                        mutations,
                        function(mutation) {
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

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
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
