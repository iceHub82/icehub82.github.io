/**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.3): util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
/**
 * Class definition
 */

class Config {
    // Getters
    static get Default() {
        return {};
    }

    static get DefaultType() {
        return {};
    }

    static get NAME() {
        throw new Error('You have to implement the static method "NAME", for each component!');
    }

    _getConfig(config) {
        config = this._mergeConfigObj(config);
        config = this._configAfterMerge(config);

        this._typeCheckConfig(config);

        return config;
    }

    _configAfterMerge(config) {
        return config;
    }

    _mergeConfigObj(config, element) {
        const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

        return {
            ...this.constructor.Default,
            ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
            ...(isElement$1(element) ? Manipulator.getDataAttributes(element) : {}),
            ...(typeof config === 'object' ? config : {})
        };
    }

    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
        for (const property of Object.keys(configTypes)) {
            const expectedTypes = configTypes[property];
            const value = config[property];
            const valueType = isElement$1(value) ? 'element' : toType(value);

            if (!new RegExp(expectedTypes).test(valueType)) {
                throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
            }
        }
    }

}


/**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.3): base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
/**
 * Constants
 */

const VERSION = '5.2.3';
/**
 * Class definition
 */

class BaseComponent extends Config {
    constructor(element, config) {
        super();
        element = getElement(element);

        if (!element) {
            return;
        }

        this._element = element;
        this._config = this._getConfig(config);
        Data.set(this._element, this.constructor.DATA_KEY, this);
    } // Public


    dispose() {
        Data.remove(this._element, this.constructor.DATA_KEY);
        EventHandler.off(this._element, this.constructor.EVENT_KEY);

        for (const propertyName of Object.getOwnPropertyNames(this)) {
            this[propertyName] = null;
        }
    }

    _queueCallback(callback, element, isAnimated = true) {
        executeAfterTransition(callback, element, isAnimated);
    }

    _getConfig(config) {
        config = this._mergeConfigObj(config, this._element);
        config = this._configAfterMerge(config);

        this._typeCheckConfig(config);

        return config;
    } // Static


    static getInstance(element) {
        return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
        return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

    static get VERSION() {
        return VERSION;
    }

    static get DATA_KEY() {
        return `bs.${this.NAME}`;
    }

    static get EVENT_KEY() {
        return `.${this.DATA_KEY}`;
    }

    static eventName(name) {
        return `${name}${this.EVENT_KEY}`;
    }

}

/**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.3): collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
/**
 * Constants
 */

const NAME$b = 'collapse';
const DATA_KEY$7 = 'bs.collapse';
const EVENT_KEY$7 = `.${DATA_KEY$7}`;
const DATA_API_KEY$4 = '.data-api';
const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
const CLASS_NAME_SHOW$7 = 'show';
const CLASS_NAME_COLLAPSE = 'collapse';
const CLASS_NAME_COLLAPSING = 'collapsing';
const CLASS_NAME_COLLAPSED = 'collapsed';
const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
const WIDTH = 'width';
const HEIGHT = 'height';
const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
const Default$a = {
    parent: null,
    toggle: true
};
const DefaultType$a = {
    parent: '(null|element)',
    toggle: 'boolean'
};
/**
 * Class definition
 */

class Collapse extends BaseComponent {
    constructor(element, config) {
        super(element, config);
        this._isTransitioning = false;
        this._triggerArray = [];
        const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);

        for (const elem of toggleList) {
            const selector = getSelectorFromElement(elem);
            const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);

            if (selector !== null && filterElement.length) {
                this._triggerArray.push(elem);
            }
        }

        this._initializeChildren();

        if (!this._config.parent) {
            this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
        }

        if (this._config.toggle) {
            this.toggle();
        }
    } // Getters


    static get Default() {
        return Default$a;
    }

    static get DefaultType() {
        return DefaultType$a;
    }

    static get NAME() {
        return NAME$b;
    } // Public


    toggle() {
        if (this._isShown()) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        if (this._isTransitioning || this._isShown()) {
            return;
        }

        let activeChildren = []; // find active children

        if (this._config.parent) {
            activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
                toggle: false
            }));
        }

        if (activeChildren.length && activeChildren[0]._isTransitioning) {
            return;
        }

        const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);

        if (startEvent.defaultPrevented) {
            return;
        }

        for (const activeInstance of activeChildren) {
            activeInstance.hide();
        }

        const dimension = this._getDimension();

        this._element.classList.remove(CLASS_NAME_COLLAPSE);

        this._element.classList.add(CLASS_NAME_COLLAPSING);

        this._element.style[dimension] = 0;

        this._addAriaAndCollapsedClass(this._triggerArray, true);

        this._isTransitioning = true;

        const complete = () => {
            this._isTransitioning = false;

            this._element.classList.remove(CLASS_NAME_COLLAPSING);

            this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

            this._element.style[dimension] = '';
            EventHandler.trigger(this._element, EVENT_SHOWN$6);
        };

        const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
        const scrollSize = `scroll${capitalizedDimension}`;

        this._queueCallback(complete, this._element, true);

        this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }

    hide() {
        if (this._isTransitioning || !this._isShown()) {
            return;
        }

        const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);

        if (startEvent.defaultPrevented) {
            return;
        }

        const dimension = this._getDimension();

        this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
        reflow(this._element);

        this._element.classList.add(CLASS_NAME_COLLAPSING);

        this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

        for (const trigger of this._triggerArray) {
            const element = getElementFromSelector(trigger);

            if (element && !this._isShown(element)) {
                this._addAriaAndCollapsedClass([trigger], false);
            }
        }

        this._isTransitioning = true;

        const complete = () => {
            this._isTransitioning = false;

            this._element.classList.remove(CLASS_NAME_COLLAPSING);

            this._element.classList.add(CLASS_NAME_COLLAPSE);

            EventHandler.trigger(this._element, EVENT_HIDDEN$6);
        };

        this._element.style[dimension] = '';

        this._queueCallback(complete, this._element, true);
    }

    _isShown(element = this._element) {
        return element.classList.contains(CLASS_NAME_SHOW$7);
    } // Private


    _configAfterMerge(config) {
        config.toggle = Boolean(config.toggle); // Coerce string values

        config.parent = getElement(config.parent);
        return config;
    }

    _getDimension() {
        return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }

    _initializeChildren() {
        if (!this._config.parent) {
            return;
        }

        const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);

        for (const element of children) {
            const selected = getElementFromSelector(element);

            if (selected) {
                this._addAriaAndCollapsedClass([element], this._isShown(selected));
            }
        }
    }

    _getFirstLevelChildren(selector) {
        const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent); // remove children if greater depth

        return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
    }

    _addAriaAndCollapsedClass(triggerArray, isOpen) {
        if (!triggerArray.length) {
            return;
        }

        for (const element of triggerArray) {
            element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
            element.setAttribute('aria-expanded', isOpen);
        }
    } // Static


    static jQueryInterface(config) {
        const _config = {};

        if (typeof config === 'string' && /show|hide/.test(config)) {
            _config.toggle = false;
        }

        return this.each(function () {
            const data = Collapse.getOrCreateInstance(this, _config);

            if (typeof config === 'string') {
                if (typeof data[config] === 'undefined') {
                    throw new TypeError(`No method named "${config}"`);
                }

                data[config]();
            }
        });
    }

}

/**
* --------------------------------------------------------------------------
* Bootstrap (v5.2.3): button.js
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
 * Constants
 */

const NAME$e = 'button';
const DATA_KEY$9 = 'bs.button';
const EVENT_KEY$a = `.${DATA_KEY$9}`;
const DATA_API_KEY$6 = '.data-api';
const CLASS_NAME_ACTIVE$3 = 'active';
const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
/**
 * Class definition
 */

class Button extends BaseComponent {
    // Getters
    static get NAME() {
        return NAME$e;
    } // Public


    toggle() {
        // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
        this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    } // Static


    static jQueryInterface(config) {
        return this.each(function () {
            const data = Button.getOrCreateInstance(this);

            if (config === 'toggle') {
                data[config]();
            }
        });
    }

}