<script>
(function () {
    var LINK_CLASS = 'gsi-target-classroom-explore-link';

    var CLASSROOMS = {
        infant: {
            label: 'Infant',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/infant-classroom'
        },
        toddler: {
            label: 'Toddler',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/toddler-classroom'
        },
        twos: {
            label: 'Twos',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/twos-classroom'
        },
        bridge: {
            label: 'Bridge',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/bridge-classroom'
        },
        preschool: {
            label: 'Preschool',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/bridge-classroom'
        },
        'pre-k': {
            label: 'Pre-K',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/bridge-classroom'
        },
        kindergarten: {
            label: 'Kindergarten',
            url: 'https://www.goddardschool.com/the-goddard-difference/classrooms/kindergarten-classroom'
        }
    };

    function getClassroomData(title) {
        var normalized = (title || '').toLowerCase().trim();

        if (normalized.indexOf('infant') === 0) {
            return CLASSROOMS.infant;
        }

        if (normalized.indexOf('toddler') === 0) {
            return CLASSROOMS.toddler;
        }

        if (normalized.indexOf('twos') === 0) {
            return CLASSROOMS.twos;
        }

        if (normalized.indexOf('bridge') === 0) {
            return CLASSROOMS.bridge;
        }

        if (normalized.indexOf('preschool') === 0) {
            return CLASSROOMS.preschool;
        }

        if (
            normalized.indexOf('pre-k') === 0 ||
            normalized.indexOf('pre–k') === 0 ||
            normalized.indexOf('pre-k') === 0
        ) {
            return CLASSROOMS['pre-k'];
        }

        if (normalized.indexOf('kindergarten') === 0) {
            return CLASSROOMS.kindergarten;
        }

        return null;
    }

    function createExploreLink(data) {
        var link = document.createElement('a');

        link.className = LINK_CLASS;
        link.href = data.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        link.style.setProperty('display', 'inline-flex', 'important');
        link.style.setProperty('align-items', 'center', 'important');
        link.style.setProperty('gap', '8px', 'important');
        link.style.setProperty('margin-top', '12px', 'important');
        link.style.setProperty('color', '#002856', 'important');
        link.style.setProperty('font-weight', '700', 'important');
        link.style.setProperty('text-decoration', 'underline', 'important');
        link.style.setProperty('width', 'fit-content', 'important');

        var text = document.createElement('span');
        text.textContent = 'Explore ' + data.label + ' Classrooms';

        var svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        svg.setAttribute('class', 'gsi-btn__icon');
        svg.setAttribute('aria-hidden', 'true');

        svg.style.setProperty('width', '16px', 'important');
        svg.style.setProperty('height', '16px', 'important');
        svg.style.setProperty('flex-shrink', '0', 'important');

        var use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use'
        );

        use.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            '#iconArrowRight'
        );

        use.setAttribute('href', '#iconArrowRight');

        svg.appendChild(use);

        link.appendChild(text);
        link.appendChild(svg);

        return link;
    }

    function updateAccordionItem(item) {
        if (!item) {
            return;
        }

        var button = item.querySelector(
            ':scope > .cmp-accordion__header .cmp-accordion__button'
        );

        var title = item.querySelector(
            ':scope > .cmp-accordion__header .cmp-accordion__title'
        );

        var panel = item.querySelector(
            ':scope > .cmp-accordion__panel'
        );

        if (!button || !title || !panel) {
            return;
        }

        var classroomData = getClassroomData(title.textContent);

        if (!classroomData) {
            return;
        }

        var existingLink = panel.querySelector('.' + LINK_CLASS);
        var isExpanded = button.getAttribute('aria-expanded') === 'true';

        /* Remove the link whenever this classroom is collapsed */
        if (!isExpanded) {
            if (existingLink) {
                existingLink.remove();
            }

            return;
        }

        /* Prevent duplicate insertion */
        if (existingLink) {
            return;
        }

        /*
         * Find the classroom description paragraph.
         * The supplied markup places it inside .cmp-text.
         */
        var paragraphs = panel.querySelectorAll('.cmp-text p');

        if (!paragraphs.length) {
            return;
        }

        /*
         * Add after the final paragraph in the classroom text block.
         */
        var paragraph = paragraphs[paragraphs.length - 1];

        paragraph.insertAdjacentElement(
            'afterend',
            createExploreLink(classroomData)
        );
    }

    function updateAllItems() {
        document
            .querySelectorAll('.cmp-accordion__item')
            .forEach(function (item) {
                updateAccordionItem(item);
            });
    }

    /*
     * Initial load.
     * This also handles a classroom that is already expanded
     * when Target executes.
     */
    updateAllItems();

    /*
     * Watch the accordion buttons for aria-expanded changes.
     * This means the Explore link appears when opened
     * and is removed when closed.
     */
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'aria-expanded' &&
                mutation.target.classList.contains('cmp-accordion__button')
            ) {
                var item = mutation.target.closest('.cmp-accordion__item');

                updateAccordionItem(item);
            }
        });
    });

    document
        .querySelectorAll('.cmp-accordion__button')
        .forEach(function (button) {
            observer.observe(button, {
                attributes: true,
                attributeFilter: ['aria-expanded']
            });
        });

})();
</script>
