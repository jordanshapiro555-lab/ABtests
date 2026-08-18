<script type="text/javascript">
    (function() {
        "use strict";

        /* ============================================================
           SHARED CONSTANTS + UTILITIES
           ============================================================ */

        var MODULE_ID = "gsi-target-hero-availability";
        var HERO_MAX_WAIT_MS = 15000;
        var RENDER_DEBOUNCE_MS = 75;
        var TARGET_MAX_WAIT_MS = 5000;
        var TARGET_CHECK_INTERVAL_MS = 250;
        var FS_INTERVAL_MS = 300;

        var startedAt = Date.now();

        var CONFIG = {
            minimumVisibleItems: 3,

            heroRowSelector: ".gsi-school-hero__row",
            heroColOneSelector: ".gsi-school-hero__col-1",
            heroDefaultInsertAfterSelector: ".gsi-school-hero__programs-and-recognitions",

            cardSelector: ".gsi-image-card",
            cardContentSelector: ".gsi-image-card__content",
            cardTitleSelector: "h6",
            availabilitySelector: ".gsi-school-classroom-cards__availability",

            statusPriority: {
                available: 3,
                limited: 2,
                upcoming: 1
            },

            statusLabels: {
                available: "Available",
                limited: "Limited",
                upcoming: "Upcoming"
            }
        };

        function normalizeText(value) {
            return String(value || "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();
        }

        /* ============================================================
           1. HERO AVAILABILITY MODULE
           ============================================================ */

        var renderTimer = null;
        var observer = null;
        var pollTimer = null;

        function getDisplayProgram(programName) {
            var n = normalizeText(programName);

            if (n === "infant") {
                return {
                    key: "infant",
                    label: "Infant",
                    order: 1
                };
            }

            if (
                n === "first steps" ||
                n === "first-steps" ||
                n === "firststeps"
            ) {
                return {
                    key: "first-steps",
                    label: "First Steps",
                    order: 2
                };
            }

            if (
                n === "toddlers" ||
                n === "toddler"
            ) {
                return {
                    key: "toddlers",
                    label: "Toddlers",
                    order: 3
                };
            }

            if (
                n === "twos" ||
                n === "two"
            ) {
                return {
                    key: "twos",
                    label: "Twos",
                    order: 4
                };
            }

            if (n === "bridge") {
                return {
                    key: "bridge",
                    label: "Bridge",
                    order: 5
                };
            }

            if (n === "preschool") {
                return {
                    key: "preschool",
                    label: "Preschool",
                    order: 6
                };
            }

            if (
                n === "pre-k" ||
                n === "pre k" ||
                n === "prek"
            ) {
                return {
                    key: "pre-k",
                    label: "Pre-K",
                    order: 7
                };
            }

            if (
                n === "summer at goddard" ||
                n === "summer-at-goddard"
            ) {
                return {
                    key: "summer-at-goddard",
                    label: "Summer at Goddard",
                    order: 8
                };
            }

            if (
                n === "before and after school" ||
                n === "before & after school" ||
                n === "before-and-after-school"
            ) {
                return {
                    key: "before-and-after-school",
                    label: "Before and After School",
                    order: 9
                };
            }

            if (
                n === "school-age support" ||
                n === "school age support" ||
                n === "school-age-support"
            ) {
                return {
                    key: "school-age-support",
                    label: "School-Age Support",
                    order: 10
                };
            }

            return null;
        }

        function getAvailabilityKey(availabilityEl) {
            if (!availabilityEl) return null;

            if (
                availabilityEl.classList &&
                availabilityEl.classList.contains("available")
            ) {
                return "available";
            }

            if (
                availabilityEl.classList &&
                availabilityEl.classList.contains("limited")
            ) {
                return "limited";
            }

            if (
                availabilityEl.classList &&
                availabilityEl.classList.contains("upcoming")
            ) {
                return "upcoming";
            }

            var text = normalizeText(
                availabilityEl.textContent
            );

            if (text === "available") {
                return "available";
            }

            if (text === "limited") {
                return "limited";
            }

            if (text === "upcoming") {
                return "upcoming";
            }

            return null;
        }

        function collectAvailabilityItems() {
            var selector = [
                ".gsi-school-classroom-cards__availability.available",
                ".gsi-school-classroom-cards__availability.limited",
                ".gsi-school-classroom-cards__availability.upcoming"
            ].join(",");

            var flags =
                document.querySelectorAll(selector);

            var grouped = {};

            Array.prototype.forEach.call(
                flags,
                function(availabilityEl) {
                    var content = null;

                    if (
                        availabilityEl.closest &&
                        typeof availabilityEl.closest === "function"
                    ) {
                        content =
                            availabilityEl.closest(
                                CONFIG.cardContentSelector
                            );
                    }

                    if (!content) {
                        var node = availabilityEl.parentNode;

                        while (
                            node &&
                            node !== document.body
                        ) {
                            if (
                                node.classList &&
                                node.classList.contains(
                                    "gsi-image-card__content"
                                )
                            ) {
                                content = node;
                                break;
                            }

                            node = node.parentNode;
                        }
                    }

                    if (!content) return;

                    var titleEl =
                        content.querySelector(
                            CONFIG.cardTitleSelector
                        );

                    if (!titleEl) return;

                    var rawProgramName =
                        String(
                            titleEl.textContent || ""
                        )
                            .replace(/\s+/g, " ")
                            .trim();

                    if (!rawProgramName) return;

                    var displayProgram =
                        getDisplayProgram(
                            rawProgramName
                        );

                    if (
                        !displayProgram ||
                        !displayProgram.key ||
                        !displayProgram.label
                    ) {
                        return;
                    }

                    var statusKey =
                        getAvailabilityKey(
                            availabilityEl
                        );

                    if (!statusKey) return;

                    var priority =
                        CONFIG.statusPriority[
                            statusKey
                        ] || 0;

                    if (
                        !grouped[
                            displayProgram.key
                        ] ||
                        priority >
                            grouped[
                                displayProgram.key
                            ].priority
                    ) {
                        grouped[
                            displayProgram.key
                        ] = {
                            key:
                                displayProgram.key,

                            programName:
                                displayProgram.label,

                            statusKey:
                                statusKey,

                            statusLabel:
                                CONFIG.statusLabels[
                                    statusKey
                                ],

                            order:
                                displayProgram.order,

                            priority:
                                priority
                        };
                    }
                }
            );

            return Object.keys(grouped)
                .map(function(key) {
                    return grouped[key];
                })
                .sort(function(a, b) {
                    return a.order - b.order;
                });
        }

        function getSignature(items) {
            return items
                .map(function(item) {
                    return (
                        item.key +
                        ":" +
                        item.statusKey
                    );
                })
                .join("|");
        }

        function getFormUrl() {
            var segments =
                window.location.pathname
                    .split("/")
                    .filter(Boolean);

            var schoolsIdx =
                segments.indexOf("schools");

            if (
                schoolsIdx > -1 &&
                segments.length >=
                    schoolsIdx + 4
            ) {
                var base =
                    "/" +
                    segments
                        .slice(
                            schoolsIdx,
                            schoolsIdx + 4
                        )
                        .join("/");

                return (
                    base +
                    "/our-school/goddard-form"
                );
            }

            var links =
                document.querySelectorAll(
                    'a[href*="/schools/"]'
                );

            for (
                var i = 0;
                i < links.length;
                i++
            ) {
                var path =
                    links[i].getAttribute(
                        "href"
                    ) || "";

                path =
                    path.replace(
                        /^https?:\/\/[^/]+/,
                        ""
                    );

                var parts =
                    path
                        .split("/")
                        .filter(Boolean);

                var idx =
                    parts.indexOf(
                        "schools"
                    );

                if (
                    idx > -1 &&
                    parts.length >=
                        idx + 4
                ) {
                    return (
                        "/" +
                        parts
                            .slice(
                                idx,
                                idx + 4
                            )
                            .join("/") +
                        "/our-school/goddard-form"
                    );
                }
            }

            return null;
        }

        function createAvailabilityModule(items) {
            var root =
                document.createElement(
                    "section"
                );

            root.id = MODULE_ID;

            root.setAttribute(
                "aria-label",
                "Availability by program"
            );

            root.setAttribute(
                "data-gsi-availability-signature",
                getSignature(items)
            );

            var eyebrow =
                document.createElement(
                    "div"
                );

            eyebrow.className =
                "gsi-avail__eyebrow";

            var eyebrowText =
                document.createElement(
                    "p"
                );

            eyebrowText.textContent =
                "Availability by Program";

            eyebrow.appendChild(
                eyebrowText
            );

            var list =
                document.createElement(
                    "div"
                );

            list.className =
                "gsi-avail__list";

            list.setAttribute(
                "role",
                "list"
            );

            list.setAttribute(
                "data-gsi-availability-list",
                "true"
            );

            items.forEach(
                function(item) {
                    var row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "gsi-avail__item";

                    row.setAttribute(
                        "role",
                        "listitem"
                    );

                    row.setAttribute(
                        "data-gsi-availability-item",
                        "true"
                    );

                    var program =
                        document.createElement(
                            "span"
                        );

                    program.className =
                        "gsi-avail__program";

                    program.textContent =
                        item.programName;

                    var badge =
                        document.createElement(
                            "span"
                        );

                    badge.className =
                        "gsi-avail__badge " +
                        "gsi-avail__badge--" +
                        item.statusKey;

                    badge.textContent =
                        item.statusLabel;

                    row.appendChild(
                        program
                    );

                    row.appendChild(
                        badge
                    );

                    list.appendChild(
                        row
                    );
                }
            );

            var disclaimer =
                document.createElement(
                    "div"
                );

            disclaimer.className =
                "disclaimer-section";

            var formUrl =
                getFormUrl();

            var linkHtml =
                formUrl
                    ?
                        '<a href="' +
                        formUrl +
                        '" class="gsi-school-navigation__button">' +
                            '<span class="gsi-school-navigation__button-text">' +
                                'Informations & Tours' +
                            '</span>' +
                        '</a>'
                    :
                        "";

            disclaimer.innerHTML =
                '<p class="disclaimer-text">' +
                    'Let’s find the right fit together! Reach out or schedule a tour to chat about classroom options.' +
                '</p>' +
                linkHtml;

            root.appendChild(
                eyebrow
            );

            root.appendChild(
                list
            );

            root.appendChild(
                disclaimer
            );

            return root;
        }

        /* ============================================================
           HERO PLACEMENT
           ============================================================ */

        function placeModule(root) {
            if (!root) return false;

            var viewportWidth =
                window.innerWidth ||
                document.documentElement
                    .clientWidth;

            var heroRow =
                document.querySelector(
                    CONFIG.heroRowSelector
                );

            var heroColOne =
                document.querySelector(
                    CONFIG.heroColOneSelector
                );

            var programsAndRecognitions =
                document.querySelector(
                    CONFIG.heroDefaultInsertAfterSelector
                );

            var heroDetails =
                document.querySelector(
                    ".gsi-school-hero__details"
                );

            var hero =
                document.querySelector(
                    ".gsi-school-hero"
                );

            if (
                viewportWidth >= 1185 &&
                viewportWidth <= 1297 &&
                heroRow &&
                heroRow.parentNode
            ) {
                heroRow.parentNode.insertBefore(
                    root,
                    heroRow.nextSibling
                );

                root.setAttribute(
                    "data-gsi-placement",
                    "below-row"
                );

                return true;
            }

            if (
                viewportWidth >= 840 &&
                viewportWidth <= 1184 &&
                heroColOne
            ) {
                heroColOne.appendChild(
                    root
                );

                root.setAttribute(
                    "data-gsi-placement",
                    "right-of-col-one"
                );

                return true;
            }

            if (
                programsAndRecognitions &&
                programsAndRecognitions.parentNode
            ) {
                programsAndRecognitions
                    .parentNode
                    .insertBefore(
                        root,
                        programsAndRecognitions
                            .nextSibling
                    );

                root.setAttribute(
                    "data-gsi-placement",
                    "default"
                );

                return true;
            }

            if (
                heroDetails &&
                heroDetails.parentNode
            ) {
                heroDetails.parentNode
                    .insertBefore(
                        root,
                        heroDetails.nextSibling
                    );

                root.setAttribute(
                    "data-gsi-placement",
                    "after-details"
                );

                return true;
            }

            if (heroColOne) {
                heroColOne.appendChild(
                    root
                );

                root.setAttribute(
                    "data-gsi-placement",
                    "hero-col-one-fallback"
                );

                return true;
            }

            if (hero) {
                hero.appendChild(
                    root
                );

                root.setAttribute(
                    "data-gsi-placement",
                    "hero-fallback"
                );

                return true;
            }

            return false;
        }

        /* ============================================================
           RENDER HERO MODULE
           ============================================================ */

        function renderAvailabilityModule() {
            var items =
                collectAvailabilityItems();

            var existing =
                document.getElementById(
                    MODULE_ID
                );

            if (
                items.length <
                CONFIG.minimumVisibleItems
            ) {
                if (
                    existing &&
                    existing.parentNode
                ) {
                    existing.parentNode
                        .removeChild(
                            existing
                        );
                }

                return false;
            }

            var signature =
                getSignature(items);

            if (
                existing &&
                existing.getAttribute(
                    "data-gsi-availability-signature"
                ) === signature
            ) {
                placeModule(
                    existing
                );

                return true;
            }

            var module =
                createAvailabilityModule(
                    items
                );

            if (
                existing &&
                existing.parentNode
            ) {
                existing.parentNode
                    .removeChild(
                        existing
                    );
            }

            return placeModule(
                module
            );
        }

        function scheduleRender() {
            window.clearTimeout(
                renderTimer
            );

            renderTimer =
                window.setTimeout(
                    renderAvailabilityModule,
                    RENDER_DEBOUNCE_MS
                );
        }

        function initHeroModule() {
            renderAvailabilityModule();

            pollTimer =
                window.setInterval(
                    function() {
                        renderAvailabilityModule();

                        if (
                            Date.now() -
                                startedAt >
                            HERO_MAX_WAIT_MS
                        ) {
                            window.clearInterval(
                                pollTimer
                            );
                        }
                    },
                    300
                );

            if (
                window.MutationObserver &&
                document.body
            ) {
                observer =
                    new MutationObserver(
                        function() {
                            if (
                                Date.now() -
                                    startedAt <=
                                    HERO_MAX_WAIT_MS ||
                                document.getElementById(
                                    MODULE_ID
                                )
                            ) {
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

                window.setTimeout(
                    function() {
                        if (observer) {
                            observer.disconnect();
                        }
                    },
                    HERO_MAX_WAIT_MS
                );
            }

            window.addEventListener(
                "resize",
                function() {
                    window.clearTimeout(
                        renderTimer
                    );

                    renderTimer =
                        window.setTimeout(
                            function() {
                                var root =
                                    document.getElementById(
                                        MODULE_ID
                                    );

                                if (root) {
                                    placeModule(
                                        root
                                    );
                                }
                            },
                            100
                        );
                }
            );
        }

        /* ============================================================
           2. ADOBE TARGET FLAG DETECTOR
           ============================================================ */

        var HAS_SENT = false;
        var targetStartedAt = null;

        function getAvailabilityStatusData() {
            var selector = [
                ".gsi-school-classroom-cards__availability.available",
                ".gsi-school-classroom-cards__availability.limited",
                ".gsi-school-classroom-cards__availability.upcoming"
            ].join(",");

            var flags =
                Array.prototype.slice.call(
                    document.querySelectorAll(
                        selector
                    )
                );

            var data = {
                flagsFound:
                    flags.length,

                hasAvailable:
                    false,

                hasLimited:
                    false,

                hasUpcoming:
                    false,

                statuses:
                    []
            };

            flags.forEach(
                function(flag) {
                    if (
                        flag.classList.contains(
                            "available"
                        )
                    ) {
                        data.hasAvailable =
                            true;
                    }

                    if (
                        flag.classList.contains(
                            "limited"
                        )
                    ) {
                        data.hasLimited =
                            true;
                    }

                    if (
                        flag.classList.contains(
                            "upcoming"
                        )
                    ) {
                        data.hasUpcoming =
                            true;
                    }
                }
            );

            if (
                data.hasAvailable
            ) {
                data.statuses.push(
                    "available"
                );
            }

            if (
                data.hasLimited
            ) {
                data.statuses.push(
                    "limited"
                );
            }

            if (
                data.hasUpcoming
            ) {
                data.statuses.push(
                    "upcoming"
                );
            }

            return data;
        }

        function sendToTarget(data) {
            if (HAS_SENT) return;

            if (
                !window.adobe ||
                !adobe.target ||
                typeof adobe.target
                    .trackEvent !==
                    "function"
            ) {
                return;
            }

            if (
                !data.statuses.length
            ) {
                return;
            }

            var params = {
                "profile.gsiHasAvailabilityFlag":
                    "true"
            };

            if (
                data.hasAvailable
            ) {
                params[
                    "profile.gsiAvailabilityHasAvailable"
                ] = "true";
            }

            if (
                data.hasLimited
            ) {
                params[
                    "profile.gsiAvailabilityHasLimited"
                ] = "true";
            }

            if (
                data.hasUpcoming
            ) {
                params[
                    "profile.gsiAvailabilityHasUpcoming"
                ] = "true";
            }

            HAS_SENT = true;

            adobe.target.trackEvent({
                mbox:
                    "gsiAvailabilityFlagDetector",

                params:
                    params
            });
        }

        function checkForFlags() {
            if (HAS_SENT) return;

            if (
                targetStartedAt ===
                null
            ) {
                targetStartedAt =
                    Date.now();
            }

            var data =
                getAvailabilityStatusData();

            if (
                data.statuses.length
            ) {
                sendToTarget(
                    data
                );

                return;
            }

            if (
                Date.now() -
                    targetStartedAt <
                TARGET_MAX_WAIT_MS
            ) {
                window.setTimeout(
                    checkForFlags,
                    TARGET_CHECK_INTERVAL_MS
                );
            }
        }

        /* ============================================================
           3. FULLSTORY PAGE VARS
           ============================================================ */

        function initFullStory() {
            var fsInterval =
                window.setInterval(
                    function() {
                        if (
                            window.FS &&
                            typeof FS.setVars ===
                                "function"
                        ) {
                            FS.setVars(
                                "page",
                                {
                                    ab_test_name:
                                        "Schools_LP_Classroom_Availability_Flags",

                                    ab_variant:
                                        "Variation_Schools_LP_Classroom_Availability_Flags_In_Hero"
                                }
                            );

                            window.clearInterval(
                                fsInterval
                            );
                        }
                    },
                    FS_INTERVAL_MS
                );
        }

        /* ============================================================
           BOOTSTRAP
           ============================================================ */

        function init() {
            initHeroModule();
            checkForFlags();
            initFullStory();
        }

        if (
            document.readyState ===
            "loading"
        ) {
            document.addEventListener(
                "DOMContentLoaded",
                init
            );
        } else {
            init();
        }

    })();
</script>
