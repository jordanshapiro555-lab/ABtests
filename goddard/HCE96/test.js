<script type="text/javascript">
    (function() {
        "use strict";

        var LOCATOR_MAX_WAIT_MS = 15000;
        var RENDER_DEBOUNCE_MS = 100;
        var APPLIED_ATTR = "data-gsi-experiment-applied";
        var GLOBE_ICON = "/etc.clientlibs/gsi/clientlibs/clientlib-site/resources/images/icon-web-link-dark-blue.svg";

        var startedAt = Date.now();
        var renderTimer = null;
        var observer = null;

        function text(el) {
            return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : "";
        }

        function esc(s) {
            return String(s == null ? "" : s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        function extractCard(item) {
            var data = {};

            var numberEl = item.querySelector(".gsi-school-locator__results-item-number");
            data.number = text(numberEl).replace(/\.$/, "");

            var headingEl = item.querySelector(".gsi-school-locator__results-item-heading");
            data.name = text(headingEl);
            data.schoolHref = headingEl ? headingEl.getAttribute("href") : null;

            var comingSoonEl = item.querySelector(".gsi-school-locator__results-item-coming-soon");
            data.comingSoon = text(comingSoonEl);

            // distance: the small bold line
            var distanceEl = item.querySelector(".gsi-font-size-xsmall");
            data.distance = text(distanceEl).replace(/\bmiles?\b/i, "mi");

            // website link: first results-item-link that points at the school (not maps)
            var websiteEl = null;
            var links = item.querySelectorAll(".gsi-school-locator__results-item-link");
            Array.prototype.forEach.call(links, function(a) {
                var href = a.getAttribute("href") || "";
                if (!websiteEl && href.indexOf("/schools/") === 0) websiteEl = a;
            });
            data.websiteHref = websiteEl ? websiteEl.getAttribute("href") : data.schoolHref;

            // directions (maps) link
            var dirEl = null;
            Array.prototype.forEach.call(links, function(a) {
                var href = a.getAttribute("href") || "";
                if (!dirEl && href.indexOf("google.com/maps") > -1) dirEl = a;
            });
            data.directionsHref = dirEl ? dirEl.getAttribute("href") : null;

            // address / phone / hours live in the small line block
            var infoBlock = item.querySelector(".gsi-font-size-small");
            var phoneEl = infoBlock ? infoBlock.querySelector(".gsi-school-locator__results-item-telephone") : null;
            data.phone = text(phoneEl);
            data.phoneHref = phoneEl ? phoneEl.getAttribute("href") : null;

            if (infoBlock) {
                // Strip sr-only spans, then parse the "address • phone • hours" text
                var clone = infoBlock.cloneNode(true);
                Array.prototype.forEach.call(clone.querySelectorAll(".sr-only"), function(n) {
                    n.parentNode.removeChild(n);
                });
                var raw = String(clone.textContent || "").replace(/\s+/g, " ").trim();
                var parts = raw.split("•").map(function(p) {
                    return p.trim();
                }).filter(Boolean);
                // parts[0] = address, last = hours, phone was the middle (already have it)
                data.address = parts.length ? parts[0] : "";
                data.hours = parts.length > 1 ? parts[parts.length - 1] : "";
            }

            // tour button: the cmp-button link (…/our-school/goddard-form)
            var tourEl = item.querySelector("a.cmp-button, a[href*='/our-school/goddard-form']");
            data.tourHref = tourEl ? tourEl.getAttribute("href") : null;

            return data;
        }

        function buildCardHtml(d) {
            var html = "";

            var phoneIcon = '<svg class="gsi-exp-card__phone-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                '<path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.18z"/>' +
                '</svg>';

            // globe corner
            if (d.websiteHref) {
                html += '<a class="gsi-exp-card__globe" href="' + esc(d.websiteHref) + '" aria-label="Visit school website">';
                html += '<img src="' + esc(GLOBE_ICON) + '" alt="">';
                html += '</a>';
            }
            // top: badge + name
            html += '<div class="gsi-exp-card__top">';
            if (d.number) html += '<span class="gsi-exp-card__badge">' + esc(d.number) + '</span>';
            if (d.schoolHref) {
                html += '<a class="gsi-exp-card__name" href="' + esc(d.schoolHref) + '">' + esc(d.name) + '</a>';
            } else {
                html += '<span class="gsi-exp-card__name">' + esc(d.name) + '</span>';
            }
            html += '</div>';
            if (d.comingSoon) {
                html += '<div class="gsi-exp-card__coming-soon">' + esc(d.comingSoon) + '</div>';
            }
            // meta: distance • address (underlined), hours, phone text link
            html += '<div class="gsi-exp-card__meta">';
            if (d.distance) html += '<span class="gsi-exp-card__distance">' + esc(d.distance) + '</span>';
            if (d.distance && d.address) html += ' • ';
            if (d.address) {
                if (d.directionsHref) {
                    html += '<a class="gsi-exp-card__address" href="' + esc(d.directionsHref) + '" target="_blank" rel="noopener noreferrer">' + esc(d.address) + '</a>';
                } else {
                    html += '<span class="gsi-exp-card__address">' + esc(d.address) + '</span>';
                }
            }
            if (d.hours) html +=
                '<div class="gsi-exp-card__hours">' + 'M-F ' + esc(d.hours) + '</div>';
            if (d.phone && d.phoneHref) {
                html += '<a class="gsi-exp-card__phone-link" href="' + esc(d.phoneHref) + '">' + phoneIcon + esc(d.phone) + '</a>';
            }
            html += '</div>';
            // actions
            html += '<div class="gsi-exp-card__actions">';
            if (d.tourHref) {
                html += '<a class="gsi-exp-card__btn gsi-exp-card__btn--primary" href="' + esc(d.tourHref) + '">Book A Tour</a>';
            }
            if (d.phone && d.phoneHref) {
                html += '<a class="gsi-exp-card__btn gsi-exp-card__btn--phone" href="' + esc(d.phoneHref) + '">' + phoneIcon + esc(d.phone) + '</a>';
            }
            html += '</div>';

            return html;
        }

        function applyToItem(item) {
            if (item.getAttribute(APPLIED_ATTR) === "true") return;

            var data = extractCard(item);
            if (!data.name) return; // not a real result row yet

            item.innerHTML = buildCardHtml(data);
            item.classList.add("gsi-exp-card");
            item.setAttribute(APPLIED_ATTR, "true");
        }

        function renderLocatorCards() {
            var items = document.querySelectorAll(".gsi-school-locator__results-item");
            if (!items.length) return false;

            var appliedAny = false;
            Array.prototype.forEach.call(items, function(item) {
                if (item.getAttribute(APPLIED_ATTR) !== "true") {
                    applyToItem(item);
                    appliedAny = true;
                }
            });
            return appliedAny;
        }

        function scheduleRender() {
            window.clearTimeout(renderTimer);
            renderTimer = window.setTimeout(renderLocatorCards, RENDER_DEBOUNCE_MS);
        }

        function init() {
            renderLocatorCards();

            if (window.MutationObserver && document.body) {
                observer = new MutationObserver(function() {
                    scheduleRender();
                    if (Date.now() - startedAt > LOCATOR_MAX_WAIT_MS) {
                        // keep observing beyond the window only if list can re-render on search;
                        // the locator does, so we intentionally do NOT disconnect here.
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }
    })();
</script>
