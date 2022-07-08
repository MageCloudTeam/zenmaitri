/**
 THIS FILE CONTAINS ES6+ AND WILL NOT RUN ON OLD BROWSERS.
 PLEASE COMPILE USING BABEL (https://babeljs.io/repl)
 THEN MOVE THE MINIFIED VERSION INTO product.min.js
 */

(function () {
    /*
        Utils
     */
    // Wait for a variable to be defined before running a callback
    function waitForVar (variable, callback) {
        if (typeof window[variable] !== "undefined"){
            if (typeof callback === 'function') setTimeout(function () {
                callback();
            }, 500);
        } else{
            setTimeout(function () {
                waitForVar(variable, callback)
            }, 250);
        }
    }

    /*
        Product reviews
     */
    var reviewsTriggerEl = '.product-single__review-link';
    var reviewsEl = '[aria-controls="Reviews-5951648530631"]';
    var reviewsContainer = '#shopify-product-reviews';
    var mobileReviewsContainer = '#shopify-product-reviews-mobile';
    var mobileReviewTrigger = '.product-content-mobile .product-reviews';

    var onReviewsClick = function (e) {
        e.preventDefault && e.preventDefault();
        var el = document.querySelector(reviewsEl);
        el?.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
        });
        !el?.classList.contains('is-open') ? el.click() : null;
    }

    var copyMobileReviews = function () {
        $(mobileReviewsContainer)
            .empty();
        $(reviewsContainer)
            .clone(true)
            .appendTo(mobileReviewsContainer);
    }

    document.querySelectorAll(reviewsTriggerEl)
        .forEach(function (el) {
            el.addEventListener('click', onReviewsClick);
        });

    document.querySelector(mobileReviewTrigger)
        .addEventListener('click', copyMobileReviews);

    /*
        ReCharge extends
     */
    var rechargeWidgetCustom = '.rc-widget-custom';
    var selectedRechargeOption = '.rc_widget__option--active';
    var paymentFormSelector = '.product__payment';
    var rechargeOptions = '.rc_widget__option';
    var productForm = '.product-single__form';

    function initRecharge () {
        modifyRecharge();
        addRechargeEvents();
        document.querySelector(productForm).classList.remove('form--loading');
    }

    function modifyRecharge (e) {
        // use jQuery to clone listeners too
        var customWidget = document.querySelector(rechargeWidgetCustom);
        var selected = $(selectedRechargeOption);
        var paymentForm = $(paymentFormSelector);
        var unselectedOptionTarget = e?.target.closest(rechargeOptions);

        if (selected.length && (!e || !e.target.closest(selectedRechargeOption))) {
            paymentForm.clone(true).appendTo(e ? $(unselectedOptionTarget) : selected);
            paymentForm.remove();

            document.querySelectorAll('.js-qty__wrapper').forEach(function (el) {
                new theme.QtySelector(el, {
                    namespace: '.product'
                });
            });

            if (customWidget) customWidget.outerHTML = null;
        }
    }

    function addRechargeEvents () {
        document.querySelectorAll(rechargeOptions)
            .forEach(function (el) {
                el.addEventListener('click', modifyRecharge)
            });
    }

    waitForVar('ReChargeWidget', initRecharge);

    /*
      Sesami
     */
    var sesamiSelector = '.sesami__button';
    var sesamiQuestions = '#sesami-questions';
    var sesamiModal = '#sesami-questions-modal-wrap';
    var sesamiAdd = '.rc-widget-custom .add-to-cart';
    var sesamiSubmit = '.js-sesami-submit';
    var productForm = '.product-single__form';

    function formatID (label) {
        return label
            .trim()
            .replace(/ /g, '-')
            .replace(/\?/g, '')
            .replace(/\*/g, '')
            .replace(/\./g, '')
            .replace(/&/g, '')
            .replace(/'/g, '')
            .replace(/"/g, '')
            .replace(/!/g, '')
            .replace(/,/g, '')
    }

    function initSesami () {
        var sesami = document.querySelector(sesamiSelector);

        if (sesami) {
            // init q's
            var questions = document.querySelector(sesamiQuestions);
            var modal = document.querySelector(sesamiModal);
            var json = JSON.parse(questions.innerHTML);

            if (json && modal) {
                for (var q of json) {
                    modal.innerHTML += renderInput(q);
                }
            }

            SesamiShopify.questionModal = new theme.Modals('SesamiModal', 'sesami-modal', {});
            SesamiShopify.questions = json;

            document.querySelector(sesamiAdd)
                .addEventListener('click', onAddToCart);
            document.querySelector(sesamiSubmit)
                .addEventListener('click', onSubmit);
        }
    }

    function onAddToCart (e) {
        if (!SesamiShopify.questionModal.modalIsOpen) {
            if (e && e.preventDefault) e.preventDefault();
            SesamiShopify.questionModal.open();
        }
    }

    function onSubmit () {
        document.querySelectorAll(sesamiModal + ' .error')
            .forEach(function (el) {
                el.outerHTML = null;
            });

        var errors = SesamiShopify.questions.filter(function (q) {
            if (q.type === 'text-note') return false;
            var val;
            if (q.settings.required) {
                if (q.type === 'checkbox') {
                    val = document.querySelector(sesamiModal + ' #' + formatID(q.settings.label)).checked;
                    if (val) val = val.toString();
                } else if (q.type !== 'radio') {
                    val = document.querySelector(sesamiModal + ' #' + formatID(q.settings.label)).value;
                } else {
                    val = document.querySelector(sesamiModal + ' [name="' + formatID(q.settings.label) + '"]:checked');
                }
                return !val || val === '';
            }
            return false;
        });

        if (errors.length) {
            for (let error of errors) {
                document.querySelector(sesamiModal + ' #' + formatID(error.settings.label))
                    .parentElement.innerHTML += '<div class="error">' + error.settings.label + ' is required.</div>'
            }
        } else {
            var results = SesamiShopify.questions.map(function (q) {
                if (q.type === 'text-note') return false;
                var value;

                if (q.type === 'checkbox') {
                    value = document.querySelector(sesamiModal + ' #' + formatID(q.settings.label)).checked;
                    if (value) value = value.toString();
                } else if (q.type !== 'radio') {
                    value = document.querySelector(sesamiModal + ' #' + formatID(q.settings.label)).value;
                } else {
                    value = document.querySelector(sesamiModal + ' [name="' + formatID(q.settings.label) + '"]:checked');
                    value = value.value;
                }

                return { label: q.settings.label, value }
            });

            for (var result of results) {
                if (!result) continue;
                var form = document.querySelector(productForm);
                form.innerHTML += '<input type="hidden" name="attributes[' + result.label + ']" value="' + result.value + '" />';
            }

            document.querySelector('button[type=submit].add-to-cart').click();
        }
    }

    function renderInput (q) {
        switch (q.type) {
            case 'text':
                return renderText('text', q.settings);
            case 'checkbox':
                return renderText('checkbox', q.settings);
            case 'radio':
                return renderRadio(q.settings);
            case 'select':
                return renderSelect(q.settings);
            case 'text-note':
                return renderNote(q.settings);
            default:
                return null;
        }
    }

    function renderNote (settings) {
        if (settings.note && settings.note !== '') {
            return '<div class="form-note">' + settings.note + '</div>';
        }
    }

    function renderText (type = 'text', settings) {
        var required = settings.required ? ' <span>*</span>' : '';
        var className = type === 'text' ? '' : 'flex';
        return '<div class="' + className + '">' +
            '  <label for="' + formatID(settings.label)  + '">' +
                settings.label +
                required
            + '</label>' +
            '  <input ' +
            '    type="' + type +'" ' +
            '    value="" ' +
            '    id="' + formatID(settings.label) + '" ' +
            '    name="' + settings.label + '" ' +
            '    placeholder="' + settings.placeholder + '"' +
            '  />' +
            '</div>'
    }

    function renderRadio (settings) {
        var radios = settings.options.split('\n');
        var required = settings.required ? ' <span>*</span>' : '';
        return '<div>' +
            '  <label for="' + formatID(settings.label) + '">' +
                    settings.label +
                    required
            + '</label>' +
            '  <div>' +
            '    ' + radios.map(function (radioLabel) {
                        return '<div class="flex"><input ' +
                            'type="radio" ' +
                            'id="' + formatID(radioLabel) + '" ' +
                            'name="' + formatID(settings.label) + '" ' +
                            'value="' + radioLabel.trim() + '"' +
                            '/> <label for="' + formatID(radioLabel) + '">' + radioLabel + '</label></div>'
                    }).join('') +
            '  </div>' +
            '</div>'
    }

    function renderSelect (settings) {
        var options = settings.options.split('\n');
        var required = settings.required ? ' <span>*</span>' : '';
        return '<div>' +
            '  <label for="' + settings.label  + '">' +
                    settings.label +
                    required
            + '</label>' +
            '  <select id="' + formatID(settings.label) + '">' +
            '    ' + options.map(function (optionLabel) {
                return '<option ' +
                    'id="' + formatID(optionLabel) + '" ' +
                    'value="' + optionLabel.trim() + '"' +
                    '>' + optionLabel.trim() +'</option>'
            }) +
            '  </select>' +
            '</div>'
    }

    waitForVar('SesamiShopify', initSesami);
})();

/**
 THIS FILE CONTAINS ES6+ AND WILL NOT RUN ON OLD BROWSERS.
 PLEASE COMPILE USING BABEL (https://babeljs.io/repl)
 THEN MOVE THE MINIFIED VERSION INTO theme.min.js
 */
