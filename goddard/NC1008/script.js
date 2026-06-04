<script id="gsi-branded-search-personalization" type="text/javascript">
(function() {
    /* =========================================================
       1. NUCLEAR BFCACHE / BACK-BUTTON GUARD

       If the personalized Homepage is restored through browser
       back/forward, force a full fresh reload directly back into
       the personalized URL.

       Important:
       Do NOT first reload to a clean URL without target_audience.
       If Target only serves this code when target_audience exists,
       the code will never get another chance to re-add the param.
    ========================================================= */

    var STYLE_ID = 'gsi-branded-search-style';

    function getNavigationType() {
        var navEntries = performance.getEntriesByType &&
            performance.getEntriesByType('navigation');

        if (navEntries && navEntries.length) {
            return navEntries[0].type;
        }

        if (performance.navigation) {
            if (performance.navigation.type === 1) return 'reload';
            if (performance.navigation.type === 2) return 'back_forward';
        }

        return 'navigate';
    }

    function getFreshPersonalizedUrl() {
        var params = new URLSearchParams(window.location.search);

        params.set('target_audience', 'branded_search');
        params.set('gsi_force_refresh', String(Date.now()));

        return (
            window.location.origin +
            window.location.pathname +
            '?' + params.toString() +
            window.location.hash
        );
    }

    function hardWipeDom(reason) {
        console.log('[branded_search personalization] Hard wipe:', reason || 'unknown');

        var style = document.getElementById(STYLE_ID);
        if (style) style.remove();

        var heroSearch = document.querySelector('.gsi-school-search--hero');
        if (heroSearch) heroSearch.remove();

        var heroForm = document.getElementById('gsiSchoolLocatorWidgetFormHero');
        if (heroForm && heroForm.closest('.gsi-school-search--hero')) {
            heroForm.closest('.gsi-school-search--hero').remove();
        }

        if (document.body) {
            document.body.classList.remove(
                'gsi-branded-search-active',
                'gsi-hide-nav-search-once',
                'gsi-nav-search-hidden',
                'gsi-nav-search-visible'
            );
        }

        window.__gsiBrandedSearchPersonalizationLoaded = false;
        window.__gsiBrandedSearchStickyNavLoaded = false;
    }

    function forceFreshPersonalizedReload(reason) {
        console.log('[branded_search personalization] Forcing fresh personalized reload:', reason || 'unknown');

        hardWipeDom(reason);

        window.location.replace(getFreshPersonalizedUrl());
    }

    /*
      Handles browsers that do a normal page load on back/forward.
    */
    if (getNavigationType() === 'back_forward') {
        forceFreshPersonalizedReload('navigation type back_forward');
        return;
    }

    /*
      Handles browsers that restore the page from bfcache.
    */
    window.addEventListener('pageshow', function(event) {
        if (event.persisted || getNavigationType() === 'back_forward') {
            forceFreshPersonalizedReload('pageshow browser history restore');
        }
    });

    /*
      Before the browser snapshots the page into bfcache, wipe the injected
      personalization. This reduces the chance of returning to dirty DOM.
    */
    window.addEventListener('pagehide', function() {
        hardWipeDom('pagehide before browser cache snapshot');
    });

    /* =========================================================
       2. ELIGIBILITY GUARD

       Nothing changes on the page unless target_audience=branded_search
       is present in the URL.
    ========================================================= */

    var params = new URLSearchParams(window.location.search);
    var targetAudience = params.get('target_audience');

    if (targetAudience !== 'branded_search') {
        console.log('[branded_search personalization] Not eligible:', targetAudience);
        return;
    }

    console.log('[branded_search personalization] Eligible. Running.');

    /* =========================================================
       3. SINGLE-RUN GUARD
       Prevents duplicate insertion if Target/custom code runs twice.
    ========================================================= */

    if (window.__gsiBrandedSearchPersonalizationLoaded) {
        console.log('[branded_search personalization] Already loaded. Skipping.');
        return;
    }

    window.__gsiBrandedSearchPersonalizationLoaded = true;

    if (document.body) {
        document.body.classList.add('gsi-branded-search-active');
    }

    /* =========================================================
       4. CSS
       Injected only after eligibility passes.

       Important:
       The original code globally hid .gsi-nav-search on desktop.
       That selector matches the production nav search element involved
       in this bug.

       This version still hides the nav, but only while the
       personalization is actively running.
    ========================================================= */

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.type = 'text/css';

        style.textContent =
            '.gsi-branded-search-active.gsi-nav-search-hidden #gsiNavSearchForm { ' +
            'opacity: 0 !important; ' +
            'visibility: hidden !important; ' +
            'pointer-events: none !important; ' +
            '} ' +

            '.gsi-branded-search-active.gsi-nav-search-visible #gsiNavSearchForm { ' +
            'opacity: 1 !important; ' +
            'visibility: visible !important; ' +
            'pointer-events: auto !important; ' +
            '} ' +

            '@media only screen and (min-width: 767.98px) { ' +
            '.gsi-branded-search-active .gsi-nav-search { ' +
            'display: none !important; ' +
            '} ' +
            '} ' +

            '.gsi-branded-search-active .gsi-school-search--hero { ' +
            'padding-left: 0 !important; ' +
            '} ' +

            '.gsi-branded-search-active .gsi-school-search__form-group-hero { ' +
            'max-width: 33rem !important; ' +
            '} ' +

            '.gsi-branded-search-active .hero-search-label { ' +
            'margin-bottom: 0; ' +
            '} ' +

            '.gsi-branded-search-active .gsi-school-search__current-location-hero { ' +
            'color: #FFF !important; ' +
            '} ' +

            '.gsi-branded-search-active .gsi-school-search__form-hero { ' +
            'align-items: baseline; ' +
            '} ' +

            '.gsi-branded-search-active .hero-search-bottom-text { ' +
            'margin-top: 10px; ' +
            '} ' +

            '@media only screen and (max-width: 550px) { ' +
            '.gsi-branded-search-active .hero-search-label { ' +
            'display: none; ' +
            '} ' +
            '}';

        document.head.appendChild(style);
    }

    injectStyles();

    /* =========================================================
       5. SHARED WAITFOR HELPER
    ========================================================= */

    function waitFor(selector, cb, timeout) {
        timeout = timeout || 8000;
        var start = Date.now();

        function check() {
            var el = document.querySelector(selector);

            if (el) return cb(el);

            if (Date.now() - start > timeout) {
                console.warn('[branded_search personalization] Timed out waiting for:', selector);
                return;
            }

            requestAnimationFrame(check);
        }

        check();
    }

    /* =========================================================
       6. HERO FORM INSERTION + FUNCTIONALITY
    ========================================================= */

    function insertAndInitHeroForm() {
        var MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29kZGFyZHN5c3RlbXMiLCJhIjoiY2txMTVzMDRrMGJtOTJvcWw1eHR3YjJmeCJ9.8K10lWLOj0X6wtHVCHIMlw';

        var headerSearch = `
<div class="gsi-school-search gsi-school-search--hero">
    <form class="gsi-school-search__form-hero" id="gsiSchoolLocatorWidgetFormHero" novalidate>
        <div class="form-group gsi-school-search__form-group gsi-school-search__form-group-hero">
            <div class="gsi-search-suggestions">
                <label for="gsiSchoolLocatorWidgetInputHero" class="sr-only">
                    Enter address, city, state or zip
                </label>

                <input
                    type="search"
                    id="gsiSchoolLocatorWidgetInputHero"
                    class="form-control gsi-school-search__input gsi-search-suggestions__input"
                    autocomplete="off"
                    required
                    placeholder="Enter address, city, state or zip"
                >

                <button
                    type="submit"
                    id="gsiSchoolLocatorWidgetButtonHero"
                    class="cmp-button cmp-button--cotton-candy gsi-school-search__submit"
                    aria-label="Search"
                >
                    <span class="hero-search-label">Find a Goddard School</span>
                    <svg class="cmp-button__icon">
                        <use xlink:href="#iconSearch" href="#iconSearch"></use>
                    </svg>
                </button>

                <ul
                    class="dropdown-menu gsi-school-search__autocomplete gsi-search-suggestions__list"
                    id="gsiSchoolLocatorWidgetAutocompleteHero"
                    style="display:none;"
                ></ul>

                <div class="gsi-form__feedback-container" aria-live="assertive">
                    <div class="invalid-feedback">
                        Please enter a valid search location
                    </div>
                </div>
            </div>
        </div>

        <div class="hero-search-bottom-text">
            <button
                type="button"
                class="cmp-button cmp-button--link gsi-school-search__current-location gsi-school-search__current-location-hero"
            >
                <svg class="cmp-button__icon hero-search-icon">
                    <use xlink:href="#iconLocation" href="#iconLocation"></use>
                </svg>
                <span class="cmp-button__text hero-search-location-label">
                    Use Current Location
                </span>
            </button>
        </div>
    </form>

    <div class="gsi-spinner d-none">
        <div class="gsi-spinner__icon gsi-spinner__icon--cogs"></div>
    </div>
</div>
`;

        waitFor('.cmp-teaser__description', function(teaserDescription) {
            if (document.querySelector('.gsi-school-search--hero')) {
                console.log('[branded_search personalization] Hero form already exists. Skipping insert.');
                return;
            }

            teaserDescription.insertAdjacentHTML('afterend', headerSearch);
            console.log('[branded_search personalization] Hero form inserted.');

            initHeroForm();
            initStickyNav();
        });

        function initHeroForm() {
            var heroForm = document.getElementById('gsiSchoolLocatorWidgetFormHero');
            var heroInput = document.getElementById('gsiSchoolLocatorWidgetInputHero');
            var heroDropdown = document.getElementById('gsiSchoolLocatorWidgetAutocompleteHero');

            if (!heroForm || !heroInput || !heroDropdown) {
                console.warn('[branded_search personalization] Hero form elements missing.');
                return;
            }

            var heroLocationBtn = heroForm.querySelector('.gsi-school-search__current-location');

            var debounceTimer;
            var activeIndex = -1;
            var currentSuggestions = [];
            var abortController = null;

            heroInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);

                var value = heroInput.value.trim();

                if (value.length < 3) {
                    hideDropdown();
                    return;
                }

                debounceTimer = setTimeout(function() {
                    fetchSuggestions(value);
                }, 200);
            });

            heroInput.addEventListener('keydown', function(e) {
                if (heroDropdown.style.display === 'none') return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    activeIndex = Math.min(activeIndex + 1, currentSuggestions.length - 1);
                    updateActive();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    activeIndex = Math.max(activeIndex - 1, 0);
                    updateActive();
                } else if (e.key === 'Enter' && activeIndex >= 0) {
                    e.preventDefault();
                    selectSuggestion(currentSuggestions[activeIndex]);
                } else if (e.key === 'Escape') {
                    hideDropdown();
                }
            });

            document.addEventListener('click', function(e) {
                if (!heroForm.contains(e.target)) hideDropdown();
            });

            heroForm.addEventListener('submit', function(e) {
                e.preventDefault();

                if (currentSuggestions.length > 0) {
                    selectSuggestion(currentSuggestions[activeIndex >= 0 ? activeIndex : 0]);
                }
            });

            if (heroLocationBtn) {
                heroLocationBtn.addEventListener('click', function() {
                    if (!navigator.geolocation) return;

                    navigator.geolocation.getCurrentPosition(
                        function(pos) {
                            hardWipeDom('before hero current location navigation');

                            window.location.href =
                                '/school-locator?lat=' + pos.coords.latitude +
                                '&lng=' + pos.coords.longitude +
                                '&term=' + encodeURIComponent('Current Location');
                        },
                        function(err) {
                            console.warn('[branded_search personalization] Geolocation failed:', err);
                        }
                    );
                });
            }

            function fetchSuggestions(query) {
                if (abortController) abortController.abort();

                abortController = new AbortController();

                var url =
                    'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                    encodeURIComponent(query) +
                    '.json?country=US&limit=5&access_token=' +
                    MAPBOX_TOKEN;

                fetch(url, {
                    signal: abortController.signal
                })
                    .then(function(res) {
                        return res.json();
                    })
                    .then(function(data) {
                        if (!data.features || data.features.length === 0) {
                            hideDropdown();
                            return;
                        }

                        currentSuggestions = data.features;
                        renderDropdown(data.features);
                    })
                    .catch(function(err) {
                        if (err.name !== 'AbortError') {
                            console.warn('[branded_search personalization] Mapbox error:', err);
                        }
                    });
            }

            function renderDropdown(features) {
                var html = '';

                for (var i = 0; i < features.length; i++) {
                    html +=
                        '<li class="gsi-search-suggestions__item" data-index="' + i + '">' +
                        '<a href="#" class="dropdown-item">' + features[i].place_name + '</a>' +
                        '</li>';
                }

                heroDropdown.innerHTML = html;
                heroDropdown.style.display = 'block';
                activeIndex = -1;

                var items = heroDropdown.querySelectorAll('li');

                for (var j = 0; j < items.length; j++) {
                    (function(li) {
                        li.addEventListener('mousedown', function(e) {
                            e.preventDefault();

                            var idx = parseInt(li.dataset.index, 10);
                            selectSuggestion(currentSuggestions[idx]);
                        });
                    })(items[j]);
                }
            }

            function updateActive() {
                var items = heroDropdown.querySelectorAll('li');

                for (var i = 0; i < items.length; i++) {
                    items[i].classList.toggle('active', i === activeIndex);
                }
            }

            function hideDropdown() {
                heroDropdown.style.display = 'none';
                currentSuggestions = [];
                activeIndex = -1;
            }

            function selectSuggestion(feature) {
                if (!feature) return;

                var lng = feature.center[0];
                var lat = feature.center[1];

                hardWipeDom('before hero selected suggestion navigation');

                var url =
                    '/school-locator?lat=' + lat +
                    '&lng=' + lng +
                    '&term=' + encodeURIComponent(feature.place_name);

                window.location.href = url;
            }

            console.log('[branded_search personalization] Hero form initialized.');
        }
    }

    /* =========================================================
       7. STICKY NAV BEHAVIOR
    ========================================================= */

    function initStickyNav() {
        waitFor('#gsiSchoolLocatorWidgetFormHero', function(heroForm) {
            var navForm = document.getElementById('gsiNavSearchForm');

            if (!navForm) {
                console.warn('[branded_search personalization] Nav form not found.');
                return;
            }

            if (window.__gsiBrandedSearchStickyNavLoaded) {
                console.log('[branded_search personalization] Sticky nav already initialized. Skipping.');
                return;
            }

            window.__gsiBrandedSearchStickyNavLoaded = true;

            var root = document.body;
            var lastScrollY = window.pageYOffset;

            function setHidden() {
                root.classList.add('gsi-nav-search-hidden');
                root.classList.remove('gsi-nav-search-visible');
            }

            function setVisible() {
                root.classList.remove('gsi-nav-search-hidden');
                root.classList.add('gsi-nav-search-visible');
            }

            function update() {
                var currentY = window.pageYOffset;
                var rect = heroForm.getBoundingClientRect();
                var scrolledPast = rect.bottom <= 0;

                var delta = currentY - lastScrollY;
                var scrollingUp = delta < -2;
                var scrollingDown = delta > 2;

                if (!scrolledPast) {
                    setHidden();
                } else if (scrollingUp) {
                    setVisible();
                } else if (scrollingDown) {
                    setHidden();
                }

                lastScrollY = currentY;
            }

            var ticking = false;

            function onScroll() {
                if (!ticking) {
                    window.requestAnimationFrame(function() {
                        update();
                        ticking = false;
                    });

                    ticking = true;
                }
            }

            update();

            window.addEventListener('scroll', onScroll, {
                passive: true
            });

            window.addEventListener('resize', onScroll, {
                passive: true
            });

            console.log('[branded_search personalization] Sticky nav initialized.');
        });
    }

    /* =========================================================
       8. START EXPERIENCE
    ========================================================= */

    insertAndInitHeroForm();

})();
</script>
