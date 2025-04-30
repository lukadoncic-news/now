/* proxy-compat-disable */

Object.setPrototypeOf = Object.setPrototypeOf || function(o, p) { o.__proto__ = p; return o; }
Object.definePropertyNative = Object.defineProperty;
Object.definePropertiesNative = Object.defineProperties;
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// THIS POLYFILL HAS BEEN MODIFIED FROM THE SOURCE
// https://github.com/eligrey/classList.js

if ("document" in self) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (
           !("classList" in document.createElement("_"))
        || document.createElementNS
        && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))
    ) {

    (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
          classListProp = "classList"
        , protoProp = "prototype"
        , elemCtrProto = view.Element[protoProp]
        , objCtr = Object
        , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
        }
        , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var
                  i = 0
                , len = this.length
            ;
            for (; i < len; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        // Vendors: please allow content code to instantiate DOMExceptions
        , DOMEx = function (type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
        }
        , checkTokenAndGetIndex = function (classList, token) {
            if (token === "") {
                throw new DOMEx(
                      "SYNTAX_ERR"
                    , "The token must not be empty."
                );
            }
            if (/\s/.test(token)) {
                throw new DOMEx(
                      "INVALID_CHARACTER_ERR"
                    , "The token must not contain space characters."
                );
            }
            return arrIndexOf.call(classList, token);
        }
        , ClassList = function (elem) {
            var
                  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                , i = 0
                , len = classes.length
            ;
            for (; i < len; i++) {
                this.push(classes[i]);
            }
            this._updateClassName = function () {
                elem.setAttribute("class", this.toString());
            };
        }
        , classListProto = ClassList[protoProp] = []
        , classListGetter = function () {
            return new ClassList(this);
        }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
        return this[i] || null;
    };
    classListProto.contains = function (token) {
        return checkTokenAndGetIndex(this, token + "") !== -1;
    };
    classListProto.add = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
        ;
        do {
            token = tokens[i] + "";
            if (checkTokenAndGetIndex(this, token) === -1) {
                this.push(token);
                updated = true;
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.remove = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
            , index
        ;
        do {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while (index !== -1) {
                this.splice(index, 1);
                updated = true;
                index = checkTokenAndGetIndex(this, token);
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.toggle = function (token, force) {
        var
              result = this.contains(token)
            , method = result ?
                force !== true && "remove"
            :
                force !== false && "add"
        ;

        if (method) {
            this[method](token);
        }

        if (force === true || force === false) {
            return force;
        } else {
            return !result;
        }
    };
    classListProto.replace = function (token, replacement_token) {
        var index = checkTokenAndGetIndex(token + "");
        if (index !== -1) {
            this.splice(index, 1, replacement_token);
            this._updateClassName();
        }
    }
    classListProto.toString = function () {
        return this.join(" ");
    };

    if (objCtr.defineProperty) {
        var classListPropDesc = {
              get: classListGetter
            , enumerable: true
            , configurable: true
        };
        try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
            // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
            // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
            if (ex.number === undefined || ex.number === -0x7FF5EC54) {
                classListPropDesc.enumerable = false;
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
        }
    } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(self));

    }

    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
        "use strict";

        var testElement = document.createElement("_");

        testElement.classList.add("c1", "c2");

        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
            var createMethod = function(method) {
                var original = DOMTokenList.prototype[method];

                DOMTokenList.prototype[method] = function(token) {
                    var i, len = arguments.length;

                    for (i = 0; i < len; i++) {
                        token = arguments[i];
                        original.call(this, token);
                    }
                };
            };
            createMethod('add');
            createMethod('remove');
        }

        testElement.classList.toggle("c3", false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
            var _toggle = DOMTokenList.prototype.toggle;

            DOMTokenList.prototype.toggle = function(token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };

        }

        // replace() polyfill
        if (!("replace" in document.createElement("_").classList)) {
            DOMTokenList.prototype.replace = function (token, replacement_token) {
                var
                      tokens = this.toString().split(" ")
                    , index = tokens.indexOf(token + "")
                ;
                if (index !== -1) {
                    tokens = tokens.slice(index);
                    this.remove.apply(this, tokens);
                    this.add(replacement_token);
                    this.add.apply(this, tokens.slice(1));
                }
            }
        }

        testElement = null;
    }());

    }
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
(function() {
    "use strict";

    var create = Object.create;
    var defineProperty = Object.defineProperty;

    var defaultPreventedDescriptor = {
        get: function () { return true; }
    };

    var preventDefault = function () {
        if (this.defaultPrevented === true || this.cancelable !== true) {
            return;
        }

        defineProperty(this, "defaultPrevented", defaultPreventedDescriptor);
    }

    if (typeof CustomEvent !== 'function') {
        window.CustomEvent = function CustomEvent(type, eventInitDict) {
            if (!type) {
                throw Error('TypeError: Failed to construct "CustomEvent": An event name must be provided.');
            }

            var event;
            eventInitDict = eventInitDict || { bubbles: false, cancelable: false, detail: null };

            if ('createEvent' in document) {
                try {
                    event = document.createEvent('CustomEvent');
                    event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
                } catch (error) {
                    // for browsers which don't support CustomEvent at all, we use a regular event instead
                    event = document.createEvent('Event');
                    event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
                    event.detail = eventInitDict.detail;
                }
            } else {

                // IE8
                event = new Event(type, eventInitDict);
                event.detail = eventInitDict && eventInitDict.detail || null;
            }

            // We attach the preventDefault to the instance instead of the prototype:
            //  - We don't want to mutate the Event.prototype.
            //  - Adding an indirection (adding a new level of inheritance) would slow down all the access to the Event properties.
            event.preventDefault = preventDefault;

            // Warning we can't add anything to the CustomEvent prototype because we are returning an event, instead of the this object.
            return event;
        };

        // We also assign Event.prototype to CustomEvent.prototype to ensure that consumer can use the following form
        // CustomEvent.prototype.[method]
        CustomEvent.prototype = Event.prototype;
    }
}());
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
(function () {
	var unlistenableWindowEvents = {
		click: 1,
		dblclick: 1,
		keyup: 1,
		keypress: 1,
		keydown: 1,
		mousedown: 1,
		mouseup: 1,
		mousemove: 1,
		mouseover: 1,
		mouseenter: 1,
		mouseleave: 1,
		mouseout: 1,
		storage: 1,
		storagecommit: 1,
		textinput: 1
	};

	function indexOf(array, element) {
		var
		index = -1,
		length = array.length;

		while (++index < length) {
			if (index in array && array[index] === element) {
				return index;
			}
		}

		return -1;
	}

	var existingProto = (window.Event && window.Event.prototype) || null;
	window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
		if (!type) {
			throw new Error('Not enough arguments');
		}

		// Shortcut if browser supports createEvent
		if ('createEvent' in document) {
			var event = document.createEvent('Event');
			var bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
			var cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

			event.initEvent(type, bubbles, cancelable);

			return event;
		}

		var event = document.createEventObject();

		event.type = type;
		event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
		event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

		return event;
	};
	if (existingProto) {
		Object.defineProperty(window.Event, 'prototype', {
			configurable: false,
			enumerable: false,
			writable: true,
			value: existingProto
		});
	}

	if (!('createEvent' in document)) {
		window.addEventListener = Window.prototype.addEventListener = Document.prototype.addEventListener = Element.prototype.addEventListener = function addEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1];

			if (element === window && type in unlistenableWindowEvents) {
				throw new Error('In IE8 the event: ' + type + ' is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.');
			}

			if (!element._events) {
				element._events = {};
			}

			if (!element._events[type]) {
				element._events[type] = function (event) {
					var
					list = element._events[event.type].list,
					events = list.slice(),
					index = -1,
					length = events.length,
					eventElement;

					event.preventDefault = function preventDefault() {
						if (event.cancelable !== false) {
							event.returnValue = false;
						}
					};

					event.stopPropagation = function stopPropagation() {
						event.cancelBubble = true;
					};

					event.stopImmediatePropagation = function stopImmediatePropagation() {
						event.cancelBubble = true;
						event.cancelImmediate = true;
					};

					event.currentTarget = element;
					event.relatedTarget = event.fromElement || null;
					event.target = event.target || event.srcElement || element;
					event.timeStamp = new Date().getTime();

					if (event.clientX) {
						event.pageX = event.clientX + document.documentElement.scrollLeft;
						event.pageY = event.clientY + document.documentElement.scrollTop;
					}

					while (++index < length && !event.cancelImmediate) {
						if (index in events) {
							eventElement = events[index];

							if (indexOf(list, eventElement) !== -1 && typeof eventElement === 'function') {
								eventElement.call(element, event);
							}
						}
					}
				};

				element._events[type].list = [];

				if (element.attachEvent) {
					element.attachEvent('on' + type, element._events[type]);
				}
			}

			element._events[type].list.push(listener);
		};

		window.removeEventListener = Window.prototype.removeEventListener = Document.prototype.removeEventListener = Element.prototype.removeEventListener = function removeEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1],
			index;

			if (element._events && element._events[type] && element._events[type].list) {
				index = indexOf(element._events[type].list, listener);

				if (index !== -1) {
					element._events[type].list.splice(index, 1);

					if (!element._events[type].list.length) {
						if (element.detachEvent) {
							element.detachEvent('on' + type, element._events[type]);
						}
						delete element._events[type];
					}
				}
			}
		};

		window.dispatchEvent = Window.prototype.dispatchEvent = Document.prototype.dispatchEvent = Element.prototype.dispatchEvent = function dispatchEvent(event) {
			if (!arguments.length) {
				throw new Error('Not enough arguments');
			}

			if (!event || typeof event.type !== 'string') {
				throw new Error('DOM Events Exception 0');
			}

			var element = this, type = event.type;

			try {
				if (!event.bubbles) {
					event.cancelBubble = true;

					var cancelBubbleEvent = function (event) {
						event.cancelBubble = true;

						(element || window).detachEvent('on' + type, cancelBubbleEvent);
					};

					this.attachEvent('on' + type, cancelBubbleEvent);
				}

				this.fireEvent('on' + type, event);
			} catch (error) {
				event.target = element;

				do {
					event.currentTarget = element;

					if ('_events' in element && typeof element._events[type] === 'function') {
						element._events[type].call(element, event);
					}

					if (typeof element['on' + type] === 'function') {
						element['on' + type].call(element, event);
					}

					element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
				} while (element && !event.cancelBubble);
			}

			return true;
		};

		// Add the DOMContentLoaded Event
		document.attachEvent('onreadystatechange', function() {
			if (document.readyState === 'complete') {
				document.dispatchEvent(new Event('DOMContentLoaded', {
					bubbles: true
				}));
			}
		});
	}
}());

(function() {
    var exports, module, define = undefined;
    /* proxy-compat-disable */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Proxy = factory());
}(this, (function () { 'use strict';

    function __extends(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    var _a = Object, getOwnPropertyNames = _a.getOwnPropertyNames, create = _a.create, keys = _a.keys, getOwnPropertyDescriptor = _a.getOwnPropertyDescriptor, preventExtensions = _a.preventExtensions, defineProperty = _a.defineProperty, hasOwnProperty = _a.hasOwnProperty, isExtensible = _a.isExtensible, getPrototypeOf = _a.getPrototypeOf, setPrototypeOf = _a.setPrototypeOf;
    var _b = Array.prototype, ArraySlice = _b.slice, ArrayShift = _b.shift, ArrayUnshift = _b.unshift, ArrayConcat = _b.concat;
    var isArray = Array.isArray;

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function isUndefined(value) {
        return value === undefined;
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function getOwnPropertyDescriptor$1(replicaOrAny, key) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.getOwnPropertyDescriptor(key);
        }
        return getOwnPropertyDescriptor(replicaOrAny, key);
    }
    function getOwnPropertyNames$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.ownKeys().filter(function (key) { return key.constructor !== Symbol; }); // TODO: only strings
        }
        return getOwnPropertyNames(replicaOrAny);
    }
    // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys
    function OwnPropertyKeys(O) {
        return ArrayConcat.call(Object.getOwnPropertyNames(O), Object.getOwnPropertySymbols(O));
    }
    function assign(replicaOrAny) {
        if (replicaOrAny == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(replicaOrAny);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource != null) { // Skip over if undefined or null
                var objectKeys = OwnPropertyKeys(nextSource);
                // tslint:disable-next-line:prefer-for-of
                for (var i = 0; i < objectKeys.length; i += 1) {
                    var nextKey = objectKeys[i];
                    var descriptor = getOwnPropertyDescriptor$1(nextSource, nextKey);
                    if (descriptor !== undefined && descriptor.enumerable === true) {
                        setKey(to, nextKey, getKey(nextSource, nextKey));
                    }
                }
            }
        }
        return to;
    }
    function hasOwnProperty$1(key) {
        if (isCompatProxy(this)) {
            var descriptor = this.getOwnPropertyDescriptor(key);
            return !isUndefined(descriptor);
        }
        else {
            return hasOwnProperty.call(this, key);
        }
    }
    function keys$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push(prop);
                }
            }
            return result;
        }
        else {
            return keys(replicaOrAny);
        }
    }
    function values(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push(getKey(replicaOrAny, prop));
                }
            }
            return result;
        }
        else {
            // Calling `Object.values` instead of dereferencing the method during the module evaluation
            // since `Object.values` gets polyfilled at the module evaluation.
            return Object.values(replicaOrAny);
        }
    }
    function entries(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push([
                        prop,
                        getKey(replicaOrAny, prop)
                    ]);
                }
            }
            return result;
        }
        else {
            // Calling `Object.entries` instead of dereferencing the method during the module evaluation
            // since `Object.entries` gets polyfilled at the module evaluation.
            return Object.entries(replicaOrAny);
        }
    }
    function defineProperty$1(replicaOrAny, prop, descriptor) {
        if (isCompatProxy(replicaOrAny)) {
            replicaOrAny.defineProperty(prop, descriptor);
            return replicaOrAny;
        }
        else {
            return defineProperty(replicaOrAny, prop, descriptor);
        }
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    var ProxyTypeObject = 1;
    var ProxyTypeArray = 2;
    // Proto chain check might be needed because of usage of a limited polyfill
    // https://github.com/es-shims/get-own-property-symbols
    // In this case, because this polyfill is assing all the stuff to Object.prototype to keep
    // all the other invariants of Symbols, we need to do some manual checks here for the slow patch.
    var isNotNativeSymbol;
    var inOperator = function inOperatorCompat(obj, key) {
        if (isNotNativeSymbol === undefined) {
            if (typeof Symbol === 'undefined') {
                throw new Error('Symbol is not available. Make sure to apply symbol polyfill before calling inOperator');
            }
            isNotNativeSymbol = typeof Symbol() === 'object';
        }
        if (isNotNativeSymbol) {
            var getOwnPropertySymbols = Object.getOwnPropertySymbols;
            if (key && key.constructor === Symbol) {
                while (obj) {
                    if (getOwnPropertySymbols(obj).indexOf(key) !== -1) {
                        return true;
                    }
                    obj = getPrototypeOf(obj);
                }
                return false;
            }
            return key in obj;
        }
        return key in obj;
    };
    var defaultHandlerTraps = {
        get: function (target, key) {
            return target[key];
        },
        set: function (target, key, newValue) {
            target[key] = newValue;
            return true;
        },
        apply: function (targetFn, thisArg, argumentsList) {
            return targetFn.apply(thisArg, argumentsList);
        },
        construct: function (targetFn, argumentsList, newTarget) {
            return new (targetFn.bind.apply(targetFn, __spreadArray([void 0], argumentsList)))();
        },
        defineProperty: function (target, property, descriptor) {
            defineProperty(target, property, descriptor);
            return true;
        },
        deleteProperty: function (target, property) {
            return delete target[property];
        },
        ownKeys: function (target) {
            return OwnPropertyKeys(target);
        },
        has: function (target, propertyKey) {
            return inOperator(target, propertyKey);
        },
        preventExtensions: function (target) {
            preventExtensions(target);
            return true;
        },
        getOwnPropertyDescriptor: getOwnPropertyDescriptor,
        getPrototypeOf: getPrototypeOf,
        isExtensible: isExtensible,
        setPrototypeOf: setPrototypeOf,
    };
    var lastRevokeFn;
    var proxyTrapFalsyErrors = {
        set: function (target, key) {
            throw new TypeError("'set' on proxy: trap returned falsish for property '" + key + "'");
        },
        deleteProperty: function (target, key) {
            throw new TypeError("'deleteProperty' on proxy: trap returned falsish for property '" + key + "'");
        },
        setPrototypeOf: function (target, proto) {
            throw new TypeError("'setPrototypeOf' on proxy: trap returned falsish");
        },
        preventExtensions: function (target, proto) {
            throw new TypeError("'preventExtensions' on proxy: trap returned falsish");
        },
        defineProperty: function (target, key, descriptor) {
            throw new TypeError("'defineProperty' on proxy: trap returned falsish for property '" + key + "'");
        }
    };
    function proxifyProperty(proxy, key, descriptor) {
        var enumerable = descriptor.enumerable, configurable = descriptor.configurable;
        defineProperty(proxy, key, {
            enumerable: enumerable,
            configurable: configurable,
            get: function () {
                return proxy.get(key);
            },
            set: function (value) {
                proxy.set(key, value);
            },
        });
    }
    var XProxy = /** @class */ (function () {
        function XProxy(target, handler) {
            var targetIsFunction = typeof target === 'function';
            var targetIsArray = isArray(target);
            if ((typeof target !== 'object' || target === null) && !targetIsFunction) {
                throw new Error("Cannot create proxy with a non-object as target");
            }
            if (typeof handler !== 'object' || handler === null) {
                throw new Error("new XProxy() expects the second argument to an object");
            }
            // Construct revoke function, and set lastRevokeFn so that Proxy.revocable can steal it.
            // The caller might get the wrong revoke function if a user replaces or wraps XProxy
            // to call itself, but that seems unlikely especially when using the polyfill.
            var throwRevoked = false;
            lastRevokeFn = function () {
                throwRevoked = true;
            };
            // Define proxy as Object, or Function (if either it's callable, or apply is set).
            // tslint:disable-next-line:no-this-assignment
            var proxy = this; // reusing the already created object, eventually the prototype will be resetted
            if (targetIsFunction) {
                proxy = function Proxy() {
                    var usingNew = (this && this.constructor === proxy);
                    var args = ArraySlice.call(arguments);
                    if (usingNew) {
                        return proxy.construct(args, this);
                    }
                    else {
                        return proxy.apply(this, args);
                    }
                };
            }
            var _loop_1 = function (trapName) {
                defineProperty(proxy, trapName, {
                    value: function () {
                        if (throwRevoked) {
                            throw new TypeError("Cannot perform '" + trapName + "' on a proxy that has been revoked");
                        }
                        var args = ArraySlice.call(arguments);
                        ArrayUnshift.call(args, target);
                        var h = handler[trapName] ? handler : defaultHandlerTraps;
                        var value = h[trapName].apply(h, args);
                        if (proxyTrapFalsyErrors[trapName] && value === false) {
                            proxyTrapFalsyErrors[trapName].apply(proxyTrapFalsyErrors, args);
                        }
                        return value;
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false,
                });
            };
            // tslint:disable-next-line:forin
            for (var trapName in defaultHandlerTraps) {
                _loop_1(trapName);
            }
            var proxyDefaultHasInstance;
            var SymbolHasInstance = Symbol.hasInstance;
            var FunctionPrototypeSymbolHasInstance = Function.prototype[SymbolHasInstance];
            defineProperty(proxy, SymbolHasInstance, {
                get: function () {
                    var hasInstance = proxy.get(SymbolHasInstance);
                    // We do not want to deal with any Symbol.hasInstance here
                    // because we need to do special things to check prototypes.
                    // Symbol polyfill adds Symbol.hasInstance to the function prototype
                    // so if we have that here, we need to return our own.
                    // If the value we get from this function is different, that means
                    // user has supplied custom function so we need to respect that.
                    if (hasInstance === FunctionPrototypeSymbolHasInstance) {
                        return proxyDefaultHasInstance || (proxyDefaultHasInstance = function (inst) {
                            return defaultHasInstance(inst, proxy);
                        });
                    }
                    return hasInstance;
                },
                configurable: false,
                enumerable: false
            });
            defineProperty(proxy, '_ES5ProxyType', {
                value: targetIsArray ? ProxyTypeArray : ProxyTypeObject,
                configurable: false,
                enumerable: false,
                writable: true,
            });
            defineProperty(proxy, 'forIn', {
                value: function () {
                    return proxy.ownKeys().reduce(function (o, key) {
                        o[key] = void 0;
                        return o;
                    }, create(null));
                },
                configurable: false,
                enumerable: false,
                writable: false,
            });
            var SymbolIterator = Symbol.iterator;
            defineProperty(proxy, SymbolIterator, {
                enumerable: false,
                configurable: true,
                get: function () {
                    return this.get(SymbolIterator);
                },
                set: function (value) {
                    this.set(SymbolIterator, value);
                },
            });
            if (targetIsArray) {
                var trackedLength_1 = 0;
                var adjustArrayIndex_1 = function (newLength) {
                    // removing old indexes from proxy when needed
                    while (trackedLength_1 > newLength) {
                        delete proxy[--trackedLength_1];
                    }
                    // add new indexes to proxy when needed
                    for (var i = trackedLength_1; i < newLength; i += 1) {
                        proxifyProperty(proxy, i, {
                            enumerable: true,
                            configurable: true,
                        });
                    }
                    trackedLength_1 = newLength;
                };
                defineProperty(proxy, 'length', {
                    enumerable: false,
                    configurable: true,
                    get: function () {
                        var proxyLength = proxy.get('length');
                        // check if the trackedLength matches the length of the proxy
                        if (proxyLength !== trackedLength_1) {
                            adjustArrayIndex_1(proxyLength);
                        }
                        return proxyLength;
                    },
                    set: function (value) {
                        proxy.set('length', value);
                    },
                });
                // building the initial index. this is observable by the proxy
                // because we access the length property during the construction
                // of the proxy, but it should be fine...
                adjustArrayIndex_1(proxy.get('length'));
            }
            return proxy;
        }
        // tslint:disable-next-line:member-ordering
        XProxy.revocable = function (target, handler) {
            var p = new XProxy(target, handler);
            return {
                proxy: p,
                revoke: lastRevokeFn,
            };
        };
        XProxy.prototype.push = function () {
            var push$1 = this.get('push');
            if (push$1 === Array.prototype.push) {
                push$1 = push;
            }
            return push$1.apply(this, arguments);
        };
        XProxy.prototype.pop = function () {
            var pop$1 = this.get('pop');
            if (pop$1 === Array.prototype.pop) {
                pop$1 = pop;
            }
            return pop$1.apply(this, arguments);
        };
        XProxy.prototype.concat = function () {
            var concat = this.get('concat');
            if (concat === Array.prototype.concat) {
                concat = concat$1;
            }
            return concat.apply(this, arguments);
        };
        XProxy.prototype.splice = function () {
            var splice$1 = this.get('splice');
            if (splice$1 === Array.prototype.splice) {
                splice$1 = splice;
            }
            return splice$1.apply(this, arguments);
        };
        XProxy.prototype.shift = function () {
            var shift$1 = this.get('shift');
            if (shift$1 === Array.prototype.shift) {
                shift$1 = shift;
            }
            return shift$1.apply(this, arguments);
        };
        XProxy.prototype.unshift = function () {
            var unshift$1 = this.get('unshift');
            if (unshift$1 === Array.prototype.unshift) {
                unshift$1 = unshift;
            }
            return unshift$1.apply(this, arguments);
        };
        XProxy.prototype.toJSON = function () {
            if (this._ES5ProxyType === ProxyTypeArray) {
                var unwrappedArray = [];
                var length = this.get('length');
                for (var i = 0; i < length; i++) {
                    unwrappedArray[i] = this.get(i);
                }
                return unwrappedArray;
            }
            else {
                var toJSON = this.get('toJSON');
                if (toJSON !== undefined && typeof toJSON === 'function') {
                    return toJSON.apply(this, arguments);
                }
                var keys = this.ownKeys();
                var unwrappedObject = {};
                // tslint:disable-next-line:prefer-for-of
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var enumerable = this.getOwnPropertyDescriptor(key).enumerable;
                    if (enumerable) {
                        unwrappedObject[key] = this.get(key);
                    }
                }
                return unwrappedObject;
            }
        };
        return XProxy;
    }());

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function defaultHasInstance(instance, Type) {
        // We have to grab getPrototypeOf here
        // because caching it at the module level is too early.
        // We need our shimmed version.
        var getPrototypeOf = Object.getPrototypeOf;
        var instanceProto = getPrototypeOf(instance);
        var TypeProto = getKey(Type, 'prototype');
        while (instanceProto !== null) {
            if (instanceProto === TypeProto) {
                return true;
            }
            instanceProto = getPrototypeOf(instanceProto);
        }
        return false;
    }
    // NOTE: For performance reasons, the "_ES5ProxyType" key should be checked without
    // using this function, unless `replicaOrAny._ES5ProxyType` might throw unexpectedly.
    function isCompatProxy(replicaOrAny) {
        return replicaOrAny && replicaOrAny._ES5ProxyType;
    }
    var getKey = function (replicaOrAny, k1) {
        return replicaOrAny._ES5ProxyType ?
            replicaOrAny.get(k1) :
            replicaOrAny[k1];
    };
    var getKeys2 = function (replicaOrAny, k1, k2) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        return replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
    };
    var getKeys3 = function (replicaOrAny, k1, k2, k3) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        var replicaOrAny2 = replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
        return replicaOrAny2._ES5ProxyType ? replicaOrAny2.get(k3) : replicaOrAny2[k3];
    };
    var getKeys4 = function (replicaOrAny, k1, k2, k3, k4) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        var replicaOrAny2 = replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
        var replicaOrAny3 = replicaOrAny2._ES5ProxyType ? replicaOrAny2.get(k3) : replicaOrAny2[k3];
        return replicaOrAny3._ES5ProxyType ? replicaOrAny3.get(k4) : replicaOrAny3[k4];
    };
    var getKeys = function (replicaOrAny) {
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            var key = arguments[i];
            replicaOrAny = replicaOrAny._ES5ProxyType ? replicaOrAny.get(key) : replicaOrAny[key];
        }
        return replicaOrAny;
    };
    var callKey0 = function (replicaOrAny, key) {
        return getKey(replicaOrAny, key).call(replicaOrAny);
    };
    var callKey1 = function (replicaOrAny, key, a1) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1);
    };
    var callKey2 = function (replicaOrAny, key, a1, a2) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2);
    };
    var callKey3 = function (replicaOrAny, key, a1, a2, a3) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2, a3);
    };
    var callKey4 = function (replicaOrAny, key, a1, a2, a3, a4) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2, a3, a4);
    };
    var callKey = function (replicaOrAny, key) {
        var fn = getKey(replicaOrAny, key);
        var l = arguments.length;
        var args = [];
        for (var i = 2; i < l; i++) {
            args[i - 2] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    };
    var setKey = function (replicaOrAny, key, newValue) {
        return replicaOrAny._ES5ProxyType ?
            replicaOrAny.set(key, newValue) :
            replicaOrAny[key] = newValue;
    };
    var setKeyPostfixIncrement = function (replicaOrAny, key) {
        var originalValue = getKey(replicaOrAny, key);
        setKey(replicaOrAny, key, originalValue + 1);
        return originalValue;
    };
    var setKeyPostfixDecrement = function (replicaOrAny, key) {
        var originalValue = getKey(replicaOrAny, key);
        setKey(replicaOrAny, key, originalValue - 1);
        return originalValue;
    };
    var deleteKey = function (replicaOrAny, key) {
        if (replicaOrAny._ES5ProxyType) {
            return replicaOrAny.deleteProperty(key);
        }
        delete replicaOrAny[key];
    };
    var inKey = function (replicaOrAny, key) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.has(key);
        }
        return inOperator(replicaOrAny, key);
    };
    var iterableKey = function (replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.forIn();
        }
        return replicaOrAny;
    };
    function instanceOfKey(instance, Type) {
        var instanceIsCompatProxy = isCompatProxy(instance);
        if (!isCompatProxy(Type) && !instanceIsCompatProxy) {
            return instance instanceof Type;
        }
        // TODO: Once polyfills are transpiled to compat
        // We can probably remove the below check
        if (instanceIsCompatProxy) {
            return defaultHasInstance(instance, Type);
        }
        return Type[Symbol.hasInstance](instance);
    }
    function concat(replicaOrAny) {
        var fn = getKey(replicaOrAny, 'concat');
        if (fn === Array.prototype.concat) {
            fn = concat$1;
        }
        var args = [];
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            args[i - 1] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    }
    function hasOwnProperty$2(replicaOrAny) {
        var fn = getKey(replicaOrAny, 'hasOwnProperty');
        if (fn === hasOwnProperty) {
            fn = hasOwnProperty$1;
        }
        var args = [];
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            args[i - 1] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    // https://tc39.github.io/ecma262/#sec-array.isarray
    // Important: The Array.isArray method is not dereferenced. This way it calls the polyfilled
    // version of it, even if the polyfill is applied after the proxy-compat evaluation.
    function isArray$1(replicaOrAny) {
        return isCompatProxy(replicaOrAny) ?
            replicaOrAny._ES5ProxyType === ProxyTypeArray :
            Array.isArray(replicaOrAny);
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.pop
    function pop() {
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. If len is zero, then
        if (len === 0) {
            // a. Perform ? Set(O, "length", 0, true). noop
            // b. Return undefined.
            return undefined;
            // 4. Else len > 0,
        }
        else if (len > 0) {
            // a. Let newLen be len-1.
            var newLen = len - 1;
            // b. Let index be ! ToString(newLen).
            var index = newLen;
            // c. Let element be ? Get(O, index).
            var element = getKey(O, index);
            // d. Perform ? DeletePropertyOrThrow(O, index).
            deleteKey(O, index);
            // e. Perform ? Set(O, "length", newLen, true).
            setKey(O, 'length', newLen);
            // f. Return element.
            return element;
        }
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.push
    function push() {
        var O = Object(this);
        var n = O.length;
        var items = ArraySlice.call(arguments);
        while (items.length) {
            var E = ArrayShift.call(items);
            setKey(O, n, E);
            n += 1;
        }
        setKey(O, 'length', n);
        return O.length;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.concat
    function concat$1() {
        var O = Object(this);
        var A = [];
        var N = 0;
        var items = ArraySlice.call(arguments);
        ArrayUnshift.call(items, O);
        while (items.length) {
            var E = ArrayShift.call(items);
            if (isArray$1(E)) {
                var k = 0;
                var length = E.length;
                for (k; k < length; k += 1, N += 1) {
                    var subElement = getKey(E, k);
                    A[N] = subElement;
                }
            }
            else {
                A[N] = E;
                N += 1;
            }
        }
        return A;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.shift
    function shift() {
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. If len is zero, then
        if (len === 0) {
            // a. Perform ? Set(O, "length", 0, true). noop
            // b. Return undefined.
            return undefined;
        }
        // 4. Let first be ? Get(O, "0").
        var first = getKey(O, 0);
        // 5. Let k be 1.
        var k = 1;
        // 6. Repeat, while k < len
        while (k < len) {
            // a. Let from be ! ToString(k).
            var from = k;
            // b. Let to be ! ToString(k-1).
            var to = k - 1;
            // c. Let fromPresent be ? HasProperty(O, from).
            var fromPresent = hasOwnProperty$1.call(O, from);
            // d. If fromPresent is true, then
            if (fromPresent) {
                // i. Let fromVal be ? Get(O, from).
                var fromVal = getKey(O, from);
                // ii. Perform ? Set(O, to, fromVal, true).
                setKey(O, to, fromVal);
            }
            else { // e. Else fromPresent is false,
                // i. Perform ? DeletePropertyOrThrow(O, to).
                deleteKey(O, to);
            }
            // f. Increase k by 1.
            k += 1;
        }
        // 7. Perform ? DeletePropertyOrThrow(O, ! ToString(len-1)).
        deleteKey(O, len - 1);
        // 8. Perform ? Set(O, "length", len-1, true).
        setKey(O, 'length', len - 1);
        // 9. Return first.
        return first;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.unshift
    function unshift() {
        var O = Object(this);
        var len = O.length;
        var argCount = arguments.length;
        var k = len;
        while (k > 0) {
            var from = k - 1;
            var to = k + argCount - 1;
            var fromPresent = hasOwnProperty$1.call(O, from);
            if (fromPresent) {
                var fromValue = O[from];
                setKey(O, to, fromValue);
            }
            else {
                deleteKey(O, to);
            }
            k -= 1;
        }
        var j = 0;
        var items = ArraySlice.call(arguments);
        while (items.length) {
            var E = ArrayShift.call(items);
            setKey(O, j, E);
            j += 1;
        }
        O.length = len + argCount;
        return O.length;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.splice
    function splice(start, deleteCount) {
        var argLength = arguments.length;
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. Let relativeStart be ? ToInteger(start).
        var relativeStart = start;
        // 4. If relativeStart < 0, let actualStart be max((len + relativeStart), 0);
        // else let actualStart be min(relativeStart, len).
        var actualStart = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
        var actualDeleteCount;
        // 5. If the number of actual arguments is 0, then
        if (argLength === 0) {
            // a. Let insertCount be 0.
            // insertCount = 0 // not needed
            // b. Let actualDeleteCount be 0.
            actualDeleteCount = 0;
        }
        else if (argLength === 1) {
            // 6. Else if the number of actual arguments is 1, then
            // a. Let insertCount be 0.
            // insertCount = 0 // not needed
            // b. Let actualDeleteCount be len - actualStart.
            actualDeleteCount = len - actualStart;
        }
        else {
            // 7. Else,
            // a. Let insertCount be the number of actual arguments minus 2.
            // insertCount = argLength - 2; //not neede
            // b. Let dc be ? ToInteger(deleteCount).
            var dc = deleteCount;
            // c. Let actualDeleteCount be min(max(dc, 0), len - actualStart).
            actualDeleteCount = Math.min(Math.max(dc, 0), len - actualStart);
        }
        // 8. If len+insertCount-actualDeleteCount > 2^53-1, throw a TypeError exception
        // (noop)
        // 9. Let A be ? ArraySpeciesCreate(O, actualDeleteCount).
        var A = [];
        // 10. Let k be 0.
        var k = 0;
        // 11. Repeat, while k < actualDeleteCount
        while (k < actualDeleteCount) {
            // a. Let from be ! ToString(actualStart+k).
            var from = actualStart + k;
            // b. Let fromPresent be ? HasProperty(O, from).
            var fromPresent = hasOwnProperty$1.call(O, from);
            // c. If fromPresent is true, then
            if (fromPresent) {
                // i. Let fromValue be ? Get(O, from).
                var fromValue = O[from];
                // ii. Perform ? CreateDataPropertyOrThrow(A, ! ToString(k), fromValue).
                A[k] = fromValue;
            }
            // d. Increment k by 1.
            k++;
        }
        // 12. Perform ? Set(A, "length", actualDeleteCount, true).
        // A.length = actualDeleteCount;
        // 13. Let items be a List whose elements are, in left to right order, the portion of the actual argument
        //     list starting with the third argument. The list is empty if fewer than three arguments were passed.
        var items = ArraySlice.call(arguments, 2) || [];
        // 14. Let itemCount be the number of elements in items.
        var itemCount = items.length;
        // 15. If itemCount < actualDeleteCount, then
        if (itemCount < actualDeleteCount) {
            // a. Let k be actualStart.
            k = actualStart;
            // b. Repeat, while k < (len - actualDeleteCount)
            while (k < len - actualDeleteCount) {
                // i. Let from be ! ToString(k+actualDeleteCount).
                var from = k + actualDeleteCount;
                // ii. Let to be ! ToString(k+itemCount).
                var to = k + itemCount;
                // iii. Let fromPresent be ? HasProperty(O, from).
                var fromPresent = hasOwnProperty$1.call(O, from);
                // iv. If fromPresent is true, then
                if (fromPresent) {
                    // 1. Let fromValue be ? Get(O, from).
                    var fromValue = O[from];
                    // 2. Perform ? Set(O, to, fromValue, true).
                    setKey(O, to, fromValue);
                }
                else {
                    // v. Else fromPresent is false,
                    // 1. Perform ? DeletePropertyOrThrow(O, to).
                    deleteKey(O, to);
                }
                // vi. Increase k by 1.
                k++;
            }
            // c. Let k be len.
            k = len;
            // d. Repeat, while k > (len - actualDeleteCount + itemCount)
            while (k > len - actualDeleteCount + itemCount) {
                // i. Perform ? DeletePropertyOrThrow(O, ! ToString(k-1)).
                deleteKey(O, k - 1);
                // ii. Decrease k by 1.
                k--;
            }
        }
        else if (itemCount > actualDeleteCount) {
            // 16. Else if itemCount > actualDeleteCount, then
            // a. Let k be (len - actualDeleteCount).
            k = len - actualDeleteCount;
            // b. Repeat, while k > actualStart
            while (k > actualStart) {
                // i. Let from be ! ToString(k + actualDeleteCount - 1).
                var from = k + actualDeleteCount - 1;
                // ii. Let to be ! ToString(k + itemCount - 1).
                var to = k + itemCount - 1;
                // iii. Let fromPresent be ? HasProperty(O, from).
                var fromPresent = hasOwnProperty$1.call(O, from);
                // iv. If fromPresent is true, then
                if (fromPresent) {
                    // 1. Let fromValue be ? Get(O, from).
                    var fromValue = O[from];
                    // 2. Perform ? Set(O, to, fromValue, true).
                    setKey(O, to, fromValue);
                }
                else {
                    // v. Else fromPresent is false,
                    // 1. Perform ? DeletePropertyOrThrow(O, to).
                    deleteKey(O, to);
                }
                // vi. Decrease k by 1.
                k--;
            }
        }
        // 17. Let k be actualStart.
        k = actualStart;
        // 18. Repeat, while items is not empty
        while (items.length) {
            // a. Remove the first element from items and let E be the value of that element.
            var E = items.shift();
            // b. Perform ? Set(O, ! ToString(k), E, true).
            setKey(O, k, E);
            // c. Increase k by 1.
            k++;
        }
        // 19. Perform ? Set(O, "length", len - actualDeleteCount + itemCount, true).
        setKey(O, 'length', len - actualDeleteCount + itemCount);
        // 20. Return A.
        return A;
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function getPrototypeOf$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.getPrototypeOf();
        }
        return getPrototypeOf(replicaOrAny);
    }
    function setPrototypeOf$1(replicaOrAny, proto) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.setPrototypeOf(proto);
        }
        return setPrototypeOf(replicaOrAny, proto);
    }
    function preventExtensions$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.preventExtensions();
        }
        return preventExtensions(replicaOrAny);
    }
    function isExtensible$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.isExtensible();
        }
        return isExtensible(replicaOrAny);
    }
    // Object patches
    // TODO: Instead of monkey patching, move all of these to be compatInstrinsicMethods
    // like the ones right below.
    Object.preventExtensions = preventExtensions$1;
    Object.getOwnPropertyNames = getOwnPropertyNames$1;
    Object.isExtensible = isExtensible$1;
    Object.setPrototypeOf = setPrototypeOf$1;
    Object.getPrototypeOf = getPrototypeOf$1;
    // We need to ensure that added compat methods are not-enumerable to avoid leaking
    // when using for ... in without guarding via Object.hasOwnProperty.
    Object.defineProperties(Object, {
        compatKeys: { value: keys$1, enumerable: false },
        compatValues: { value: values, enumerable: false },
        compatEntries: { value: entries, enumerable: false },
        compatDefineProperty: { value: defineProperty$1, enumerable: false },
        compatAssign: { value: assign, enumerable: false },
        compatGetOwnPropertyDescriptor: { value: getOwnPropertyDescriptor$1, enumerable: false }
    });
    Object.defineProperties(Object.prototype, {
        compatHasOwnProperty: { value: hasOwnProperty$1, enumerable: false }
    });
    // Array patches
    Object.defineProperties(Array, {
        compatIsArray: { value: isArray$1, enumerable: false }
    });
    Object.defineProperties(Array.prototype, {
        compatUnshift: { value: unshift, enumerable: false },
        compatConcat: { value: concat$1, enumerable: false },
        compatPush: { value: push, enumerable: false },
    });
    function overrideProxy() {
        return Proxy.__COMPAT__;
    }
    function makeGlobal(obj) {
        var global = (function () { return this; })() || Function('return this')();
        global.Proxy = obj;
    }
    // At this point Proxy can be the real Proxy (function) a noop-proxy (object with noop-keys) or undefined
    var FinalProxy = typeof Proxy !== 'undefined' ? Proxy : {};
    if (typeof FinalProxy !== 'function' || overrideProxy()) {
        FinalProxy = /** @class */ (function (_super) {
            __extends(Proxy, _super);
            function Proxy() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Proxy;
        }(XProxy));
    }
    FinalProxy.isCompat = true;
    FinalProxy.getKey = getKey;
    FinalProxy.getKeys = getKeys;
    FinalProxy.getKeys2 = getKeys2;
    FinalProxy.getKeys3 = getKeys3;
    FinalProxy.getKeys4 = getKeys4;
    FinalProxy.callKey = callKey;
    FinalProxy.callKey0 = callKey0;
    FinalProxy.callKey1 = callKey1;
    FinalProxy.callKey2 = callKey2;
    FinalProxy.callKey3 = callKey3;
    FinalProxy.callKey4 = callKey4;
    FinalProxy.setKey = setKey;
    FinalProxy.setKeyPostfixIncrement = setKeyPostfixIncrement;
    FinalProxy.setKeyPostfixDecrement = setKeyPostfixDecrement;
    FinalProxy.deleteKey = deleteKey;
    FinalProxy.inKey = inKey;
    FinalProxy.iterableKey = iterableKey;
    FinalProxy.instanceOfKey = instanceOfKey;
    FinalProxy.concat = concat;
    FinalProxy.hasOwnProperty = hasOwnProperty$2;
    if (typeof Proxy === 'undefined') {
        makeGlobal(FinalProxy);
    }
    var FinalProxy$1 = FinalProxy;

    return FinalProxy$1;

})));

}());

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 75);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var core = __webpack_require__(14);
var hide = __webpack_require__(11);
var redefine = __webpack_require__(8);
var ctx = __webpack_require__(12);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(54)('wks');
var uid = __webpack_require__(20);
var Symbol = __webpack_require__(2).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(4)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(7);
var IE8_DOM_DEFINE = __webpack_require__(49);
var toPrimitive = __webpack_require__(18);
var dP = Object.defineProperty;

exports.f = __webpack_require__(5) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var hide = __webpack_require__(11);
var has = __webpack_require__(9);
var SRC = __webpack_require__(20)('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(14).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6);
var createDesc = __webpack_require__(33);
module.exports = __webpack_require__(5) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(21);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(34);
var defined = __webpack_require__(13);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(19);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(3);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(13);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(6).f;
var has = __webpack_require__(9);
var TAG = __webpack_require__(1)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(12);
var IObject = __webpack_require__(34);
var toObject = __webpack_require__(22);
var toLength = __webpack_require__(16);
var asc = __webpack_require__(110);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var dP = __webpack_require__(6);
var DESCRIPTORS = __webpack_require__(5);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(12);
var call = __webpack_require__(121);
var isArrayIter = __webpack_require__(122);
var anObject = __webpack_require__(7);
var toLength = __webpack_require__(16);
var getIterFn = __webpack_require__(123);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(8);
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(20)('meta');
var isObject = __webpack_require__(3);
var has = __webpack_require__(9);
var setDesc = __webpack_require__(6).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(4)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(8);
var redefineAll = __webpack_require__(29);
var meta = __webpack_require__(30);
var forOf = __webpack_require__(28);
var anInstance = __webpack_require__(27);
var isObject = __webpack_require__(3);
var fails = __webpack_require__(4);
var $iterDetect = __webpack_require__(71);
var setToStringTag = __webpack_require__(24);
var inheritIfRequired = __webpack_require__(39);

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = $iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var document = __webpack_require__(2).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(10);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(54)('keys');
var uid = __webpack_require__(20);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(55);
var createDesc = __webpack_require__(33);
var toIObject = __webpack_require__(15);
var toPrimitive = __webpack_require__(18);
var has = __webpack_require__(9);
var IE8_DOM_DEFINE = __webpack_require__(49);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(5) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var setPrototypeOf = __webpack_require__(84).set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var defined = __webpack_require__(13);
var fails = __webpack_require__(4);
var spaces = __webpack_require__(41);
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(7);
var dPs = __webpack_require__(50);
var enumBugKeys = __webpack_require__(37);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(32)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(58).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// helper for String#{startsWith, endsWith, includes}
var isRegExp = __webpack_require__(64);
var defined = __webpack_require__(13);

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var MATCH = __webpack_require__(1)('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(36);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(8);
var hide = __webpack_require__(11);
var Iterators = __webpack_require__(23);
var $iterCreate = __webpack_require__(107);
var setToStringTag = __webpack_require__(24);
var getPrototypeOf = __webpack_require__(56);
var ITERATOR = __webpack_require__(1)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(1)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(11)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 21.2.5.3 get RegExp.prototype.flags
var anObject = __webpack_require__(7);
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hide = __webpack_require__(11);
var redefine = __webpack_require__(8);
var fails = __webpack_require__(4);
var defined = __webpack_require__(13);
var wks = __webpack_require__(1);

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(5) && !__webpack_require__(4)(function () {
  return Object.defineProperty(__webpack_require__(32)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6);
var anObject = __webpack_require__(7);
var getKeys = __webpack_require__(51);

module.exports = __webpack_require__(5) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(52);
var enumBugKeys = __webpack_require__(37);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(9);
var toIObject = __webpack_require__(15);
var arrayIndexOf = __webpack_require__(78)(false);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(19);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(14);
var global = __webpack_require__(2);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(36) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 55 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(9);
var toObject = __webpack_require__(22);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(52);
var hiddenKeys = __webpack_require__(37).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(2).document;
module.exports = document && document.documentElement;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toInteger = __webpack_require__(19);
var defined = __webpack_require__(13);

module.exports = function repeat(count) {
  var str = String(defined(this));
  var res = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.3 Number.isInteger(number)
var isObject = __webpack_require__(3);
var floor = Math.floor;
module.exports = function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var $parseFloat = __webpack_require__(2).parseFloat;
var $trim = __webpack_require__(40).trim;

module.exports = 1 / $parseFloat(__webpack_require__(41) + '-0') !== -Infinity ? function parseFloat(str) {
  var string = $trim(String(str), 3);
  var result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var $parseInt = __webpack_require__(2).parseInt;
var $trim = __webpack_require__(40).trim;
var ws = __webpack_require__(41);
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(19);
var defined = __webpack_require__(13);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__(3);
var cof = __webpack_require__(10);
var MATCH = __webpack_require__(1)('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(10);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// 21.2.5.3 get RegExp.prototype.flags()
if (__webpack_require__(5) && /./g.flags != 'g') __webpack_require__(6).f(RegExp.prototype, 'flags', {
  configurable: true,
  get: __webpack_require__(47)
});


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(10);
var TAG = __webpack_require__(1)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(12);
var invoke = __webpack_require__(125);
var html = __webpack_require__(58);
var cel = __webpack_require__(32);
var global = __webpack_require__(2);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(10)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(21);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(1)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(51);
var gOPS = __webpack_require__(131);
var pIE = __webpack_require__(55);
var toObject = __webpack_require__(22);
var IObject = __webpack_require__(34);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(4)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var redefineAll = __webpack_require__(29);
var getWeak = __webpack_require__(30).getWeak;
var anObject = __webpack_require__(7);
var isObject = __webpack_require__(3);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var createArrayMethod = __webpack_require__(25);
var $has = __webpack_require__(9);
var validate = __webpack_require__(17);
var arrayFind = createArrayMethod(5);
var arrayFindIndex = createArrayMethod(6);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};
var UncaughtFrozenStore = function () {
  this.a = [];
};
var findUncaughtFrozen = function (store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function (key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;      // collection type
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME))['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME)).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var data = getWeak(anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP = __webpack_require__(6).f;
var create = __webpack_require__(42);
var redefineAll = __webpack_require__(29);
var ctx = __webpack_require__(12);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var $iterDefine = __webpack_require__(45);
var step = __webpack_require__(66);
var setSpecies = __webpack_require__(26);
var DESCRIPTORS = __webpack_require__(5);
var fastKey = __webpack_require__(30).fastKey;
var validate = __webpack_require__(17);
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(76);
__webpack_require__(77);
__webpack_require__(79);
__webpack_require__(81);
__webpack_require__(82);
__webpack_require__(83);
__webpack_require__(85);
__webpack_require__(87);
__webpack_require__(88);
__webpack_require__(89);
__webpack_require__(90);
__webpack_require__(91);
__webpack_require__(92);
__webpack_require__(93);
__webpack_require__(94);
__webpack_require__(95);
__webpack_require__(96);
__webpack_require__(97);
__webpack_require__(98);
__webpack_require__(99);
__webpack_require__(100);
__webpack_require__(101);
__webpack_require__(102);
__webpack_require__(103);
__webpack_require__(104);
__webpack_require__(105);
__webpack_require__(106);
__webpack_require__(108);
__webpack_require__(109);
__webpack_require__(112);
__webpack_require__(113);
__webpack_require__(114);
__webpack_require__(115);
__webpack_require__(116);
__webpack_require__(67);
__webpack_require__(117);
__webpack_require__(118);
__webpack_require__(119);
__webpack_require__(120);
__webpack_require__(130);
__webpack_require__(132);
__webpack_require__(133);
__webpack_require__(134);
__webpack_require__(136);
__webpack_require__(137);
__webpack_require__(139);
__webpack_require__(140);
__webpack_require__(141);
module.exports = __webpack_require__(142);


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(5), 'Object', { defineProperty: __webpack_require__(6).f });


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !__webpack_require__(5), 'Object', { defineProperties: __webpack_require__(50) });


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(15);
var toLength = __webpack_require__(16);
var toAbsoluteIndex = __webpack_require__(53);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(15);
var $getOwnPropertyDescriptor = __webpack_require__(38).f;

__webpack_require__(80)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(0);
var core = __webpack_require__(14);
var fails = __webpack_require__(4);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6).f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || __webpack_require__(5) && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isObject = __webpack_require__(3);
var getPrototypeOf = __webpack_require__(56);
var HAS_INSTANCE = __webpack_require__(1)('hasInstance');
var FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if (!(HAS_INSTANCE in FunctionProto)) __webpack_require__(6).f(FunctionProto, HAS_INSTANCE, { value: function (O) {
  if (typeof this != 'function' || !isObject(O)) return false;
  if (!isObject(this.prototype)) return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while (O = getPrototypeOf(O)) if (this.prototype === O) return true;
  return false;
} });


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var has = __webpack_require__(9);
var cof = __webpack_require__(10);
var inheritIfRequired = __webpack_require__(39);
var toPrimitive = __webpack_require__(18);
var fails = __webpack_require__(4);
var gOPN = __webpack_require__(57).f;
var gOPD = __webpack_require__(38).f;
var dP = __webpack_require__(6).f;
var $trim = __webpack_require__(40).trim;
var NUMBER = 'Number';
var $Number = global[NUMBER];
var Base = $Number;
var proto = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = cof(__webpack_require__(42)(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function () { proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = __webpack_require__(5) ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(Base, key = keys[j]) && !has($Number, key)) {
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  __webpack_require__(8)(global, NUMBER, $Number);
}


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__(3);
var anObject = __webpack_require__(7);
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__(12)(Function.call, __webpack_require__(38).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var toInteger = __webpack_require__(19);
var aNumberValue = __webpack_require__(86);
var repeat = __webpack_require__(59);
var $toFixed = 1.0.toFixed;
var floor = Math.floor;
var data = [0, 0, 0, 0, 0, 0];
var ERROR = 'Number.toFixed: incorrect invocation!';
var ZERO = '0';

var multiply = function (n, c) {
  var i = -1;
  var c2 = c;
  while (++i < 6) {
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function (n) {
  var i = 6;
  var c = 0;
  while (--i >= 0) {
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function () {
  var i = 6;
  var s = '';
  while (--i >= 0) {
    if (s !== '' || i === 0 || data[i] !== 0) {
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function (x) {
  var n = 0;
  var x2 = x;
  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }
  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !__webpack_require__(4)(function () {
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits) {
    var x = aNumberValue(this, ERROR);
    var f = toInteger(fractionDigits);
    var s = '';
    var m = ZERO;
    var e, z, j, k;
    if (f < 0 || f > 20) throw RangeError(ERROR);
    // eslint-disable-next-line no-self-compare
    if (x != x) return 'NaN';
    if (x <= -1e21 || x >= 1e21) return String(x);
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x > 1e-21) {
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(0, z);
        j = f;
        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if (f > 0) {
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

var cof = __webpack_require__(10);
module.exports = function (it, msg) {
  if (typeof it != 'number' && cof(it) != 'Number') throw TypeError(msg);
  return +it;
};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.1 Number.EPSILON
var $export = __webpack_require__(0);

$export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.2 Number.isFinite(number)
var $export = __webpack_require__(0);
var _isFinite = __webpack_require__(2).isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.3 Number.isInteger(number)
var $export = __webpack_require__(0);

$export($export.S, 'Number', { isInteger: __webpack_require__(60) });


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.4 Number.isNaN(number)
var $export = __webpack_require__(0);

$export($export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.5 Number.isSafeInteger(number)
var $export = __webpack_require__(0);
var isInteger = __webpack_require__(60);
var abs = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = __webpack_require__(0);

$export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = __webpack_require__(0);

$export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseFloat = __webpack_require__(61);
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', { parseFloat: $parseFloat });


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseInt = __webpack_require__(62);
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', { parseInt: $parseInt });


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseInt = __webpack_require__(62);
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseFloat = __webpack_require__(61);
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), { parseFloat: $parseFloat });


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

// 20.2.2.34 Math.trunc(x)
var $export = __webpack_require__(0);

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var toAbsoluteIndex = __webpack_require__(53);
var fromCharCode = String.fromCharCode;
var $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var res = [];
    var aLen = arguments.length;
    var i = 0;
    var code;
    while (aLen > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var toIObject = __webpack_require__(15);
var toLength = __webpack_require__(16);

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = toIObject(callSite.raw);
    var len = toLength(tpl.length);
    var aLen = arguments.length;
    var res = [];
    var i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < aLen) res.push(String(arguments[i]));
    } return res.join('');
  }
});


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $at = __webpack_require__(63)(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])

var $export = __webpack_require__(0);
var toLength = __webpack_require__(16);
var context = __webpack_require__(43);
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * __webpack_require__(44)(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.7 String.prototype.includes(searchString, position = 0)

var $export = __webpack_require__(0);
var context = __webpack_require__(43);
var INCLUDES = 'includes';

$export($export.P + $export.F * __webpack_require__(44)(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: __webpack_require__(59)
});


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])

var $export = __webpack_require__(0);
var toLength = __webpack_require__(16);
var context = __webpack_require__(43);
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * __webpack_require__(44)(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(63)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(45)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(42);
var descriptor = __webpack_require__(33);
var setToStringTag = __webpack_require__(24);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(11)(IteratorPrototype, __webpack_require__(1)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = __webpack_require__(0);

$export($export.S, 'Array', { isArray: __webpack_require__(65) });


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(25)(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(46)(KEY);


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(111);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var isArray = __webpack_require__(65);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(25)(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(46)(KEY);


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(46);
var step = __webpack_require__(66);
var Iterators = __webpack_require__(23);
var toIObject = __webpack_require__(15);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(45)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26)('Array');


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var inheritIfRequired = __webpack_require__(39);
var dP = __webpack_require__(6).f;
var gOPN = __webpack_require__(57).f;
var isRegExp = __webpack_require__(64);
var $flags = __webpack_require__(47);
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (__webpack_require__(5) && (!CORRECT_NEW || __webpack_require__(4)(function () {
  re2[__webpack_require__(1)('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  __webpack_require__(8)(global, 'RegExp', $RegExp);
}

__webpack_require__(26)('RegExp');


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(67);
var anObject = __webpack_require__(7);
var $flags = __webpack_require__(47);
var DESCRIPTORS = __webpack_require__(5);
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  __webpack_require__(8)(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (__webpack_require__(4)(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

// @@match logic
__webpack_require__(48)('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

// @@replace logic
__webpack_require__(48)('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    'use strict';
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

// @@search logic
__webpack_require__(48)('search', 1, function (defined, SEARCH, $search) {
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(36);
var global = __webpack_require__(2);
var ctx = __webpack_require__(12);
var classof = __webpack_require__(68);
var $export = __webpack_require__(0);
var isObject = __webpack_require__(3);
var aFunction = __webpack_require__(21);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var speciesConstructor = __webpack_require__(124);
var task = __webpack_require__(69).set;
var microtask = __webpack_require__(126)();
var newPromiseCapabilityModule = __webpack_require__(70);
var perform = __webpack_require__(127);
var userAgent = __webpack_require__(128);
var promiseResolve = __webpack_require__(129);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(1)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(29)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(24)($Promise, PROMISE);
__webpack_require__(26)(PROMISE);
Wrapper = __webpack_require__(14)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(71)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(7);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(23);
var ITERATOR = __webpack_require__(1)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(68);
var ITERATOR = __webpack_require__(1)('iterator');
var Iterators = __webpack_require__(23);
module.exports = __webpack_require__(14).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(7);
var aFunction = __webpack_require__(21);
var SPECIES = __webpack_require__(1)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 125 */
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var macrotask = __webpack_require__(69).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(10)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),
/* 127 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(7);
var isObject = __webpack_require__(3);
var newPromiseCapability = __webpack_require__(70);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(0);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(72) });


/***/ }),
/* 131 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = __webpack_require__(0);

$export($export.S, 'Date', { now: function () { return new Date().getTime(); } });


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var toObject = __webpack_require__(22);
var toPrimitive = __webpack_require__(18);

$export($export.P + $export.F * __webpack_require__(4)(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
}), 'Date', {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject(this);
    var pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = __webpack_require__(0);
var toISOString = __webpack_require__(135);

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (Date.prototype.toISOString !== toISOString), 'Date', {
  toISOString: toISOString
});


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var fails = __webpack_require__(4);
var getTime = Date.prototype.getTime;
var $toISOString = Date.prototype.toISOString;

var lz = function (num) {
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
module.exports = (fails(function () {
  return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails(function () {
  $toISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
  var d = this;
  var y = d.getUTCFullYear();
  var m = d.getUTCMilliseconds();
  var s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
} : $toISOString;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

var DateProto = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var $toString = DateProto[TO_STRING];
var getTime = DateProto.getTime;
if (new Date(NaN) + '' != INVALID_DATE) {
  __webpack_require__(8)(DateProto, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var TO_PRIMITIVE = __webpack_require__(1)('toPrimitive');
var proto = Date.prototype;

if (!(TO_PRIMITIVE in proto)) __webpack_require__(11)(proto, TO_PRIMITIVE, __webpack_require__(138));


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var anObject = __webpack_require__(7);
var toPrimitive = __webpack_require__(18);
var NUMBER = 'number';

module.exports = function (hint) {
  if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var each = __webpack_require__(25)(0);
var redefine = __webpack_require__(8);
var meta = __webpack_require__(30);
var assign = __webpack_require__(72);
var weak = __webpack_require__(73);
var isObject = __webpack_require__(3);
var fails = __webpack_require__(4);
var validate = __webpack_require__(17);
var WEAK_MAP = 'WeakMap';
var getWeak = meta.getWeak;
var isExtensible = Object.isExtensible;
var uncaughtFrozenStore = weak.ufstore;
var tmp = {};
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (isObject(key)) {
      var data = getWeak(key);
      if (data === true) return uncaughtFrozenStore(validate(this, WEAK_MAP)).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return weak.def(validate(this, WEAK_MAP), key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = __webpack_require__(31)(WEAK_MAP, wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
  InternalMap = weak.getConstructor(wrapper, WEAK_MAP);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        if (!this._f) this._f = new InternalMap();
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var weak = __webpack_require__(73);
var validate = __webpack_require__(17);
var WEAK_SET = 'WeakSet';

// 23.4 WeakSet Objects
__webpack_require__(31)(WEAK_SET, function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return weak.def(validate(this, WEAK_SET), value, true);
  }
}, weak, false, true);


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(74);
var validate = __webpack_require__(17);
var MAP = 'Map';

// 23.1 Map Objects
module.exports = __webpack_require__(31)(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(74);
var validate = __webpack_require__(17);
var SET = 'Set';

// 23.2 Set Objects
module.exports = __webpack_require__(31)(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);


/***/ })
/******/ ]);/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ../proxy-compat/setKey.js
/* harmony default export */ var setKey = (Proxy.setKey);
// CONCATENATED MODULE: ../proxy-compat/callKey4.js
/* harmony default export */ var callKey4 = (Proxy.callKey4);
// CONCATENATED MODULE: ../proxy-compat/callKey2.js
/* harmony default export */ var callKey2 = (Proxy.callKey2);
// CONCATENATED MODULE: ../proxy-compat/callKey1.js
/* harmony default export */ var callKey1 = (Proxy.callKey1);
// CONCATENATED MODULE: ../proxy-compat/iterableKey.js
/* harmony default export */ var iterableKey = (Proxy.iterableKey);
// CONCATENATED MODULE: ../proxy-compat/callKey3.js
/* harmony default export */ var callKey3 = (Proxy.callKey3);
// CONCATENATED MODULE: ../proxy-compat/inKey.js
/* harmony default export */ var inKey = (Proxy.inKey);
// CONCATENATED MODULE: ../proxy-compat/concat.js
/* harmony default export */ var concat = (Proxy.concat);
// CONCATENATED MODULE: ../proxy-compat/deleteKey.js
/* harmony default export */ var deleteKey = (Proxy.deleteKey);
// CONCATENATED MODULE: ../proxy-compat/callKey0.js
/* harmony default export */ var callKey0 = (Proxy.callKey0);
// CONCATENATED MODULE: ../proxy-compat/instanceOfKey.js
/* harmony default export */ var instanceOfKey = (Proxy.instanceOfKey);
// CONCATENATED MODULE: ./dist/ecma-polyfills.compat.js












/******/
(function (modules) {
  // webpackBootstrap

  /******/
  // The module cache

  /******/
  var installedModules = {};
  /******/

  /******/
  // The require function

  /******/

  function __webpack_require__(moduleId) {
    /******/

    /******/
    // Check if module is in cache

    /******/
    if (installedModules._ES5ProxyType ? installedModules.get(moduleId) : installedModules[moduleId]) {
      var _moduleId, _exports;

      /******/
      return _moduleId = installedModules._ES5ProxyType ? installedModules.get(moduleId) : installedModules[moduleId], _exports = _moduleId._ES5ProxyType ? _moduleId.get("exports") : _moduleId.exports;
      /******/
    }
    /******/
    // Create a new module (and put it into the cache)

    /******/


    var module = setKey(installedModules, moduleId, {
      /******/
      i: moduleId,

      /******/
      l: false,

      /******/
      exports: {}
      /******/

    });
    /******/

    /******/
    // Execute the module function

    /******/


    callKey4(modules._ES5ProxyType ? modules.get(moduleId) : modules[moduleId], "call", module._ES5ProxyType ? module.get("exports") : module.exports, module, module._ES5ProxyType ? module.get("exports") : module.exports, __webpack_require__);
    /******/

    /******/
    // Flag the module as loaded

    /******/


    setKey(module, "l", true);
    /******/

    /******/
    // Return the exports of the module

    /******/


    return module._ES5ProxyType ? module.get("exports") : module.exports;
    /******/
  }
  /******/

  /******/

  /******/
  // expose the modules object (__webpack_modules__)

  /******/


  setKey(__webpack_require__, "m", modules);
  /******/

  /******/
  // expose the module cache

  /******/


  setKey(__webpack_require__, "c", installedModules);
  /******/

  /******/
  // define getter function for harmony exports

  /******/


  setKey(__webpack_require__, "d", function (exports, name, getter) {
    /******/
    if (!callKey2(__webpack_require__, "o", exports, name)) {
      /******/
      Object.compatDefineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
      /******/
    }
    /******/

  });
  /******/

  /******/
  // define __esModule on exports

  /******/


  setKey(__webpack_require__, "r", function (exports) {
    /******/
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/
      Object.compatDefineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
      /******/
    }
    /******/


    Object.compatDefineProperty(exports, '__esModule', {
      value: true
    });
    /******/
  });
  /******/

  /******/
  // create a fake namespace object

  /******/
  // mode & 1: value is a module id, require it

  /******/
  // mode & 2: merge all properties of value into the ns

  /******/
  // mode & 4: return value when already ns object

  /******/
  // mode & 8|1: behave like require

  /******/


  setKey(__webpack_require__, "t", function (value, mode) {
    /******/
    if (mode & 1) value = __webpack_require__(value);
    /******/

    if (mode & 8) return value;
    /******/

    if (mode & 4 && typeof value === 'object' && value && (value._ES5ProxyType ? value.get("__esModule") : value.__esModule)) return value;
    /******/

    var ns = Object.create(null);
    /******/

    callKey1(__webpack_require__, "r", ns);
    /******/


    Object.compatDefineProperty(ns, 'default', {
      enumerable: true,
      value: value
    });
    /******/

    if (mode & 2 && typeof value != 'string') for (var key in iterableKey(value)) callKey3(__webpack_require__, "d", ns, key, callKey2(function (key) {
      return value._ES5ProxyType ? value.get(key) : value[key];
    }, "bind", null, key));
    /******/

    return ns;
    /******/
  });
  /******/

  /******/
  // getDefaultExport function for compatibility with non-harmony modules

  /******/


  setKey(__webpack_require__, "n", function (module) {
    /******/
    var getter = module && (module._ES5ProxyType ? module.get("__esModule") : module.__esModule) ?
    /******/
    function getDefault() {
      return module._ES5ProxyType ? module.get('default') : module['default'];
    } :
    /******/
    function getModuleExports() {
      return module;
    };
    /******/

    callKey3(__webpack_require__, "d", getter, 'a', getter);
    /******/


    return getter;
    /******/
  });
  /******/

  /******/
  // Object.prototype.hasOwnProperty.call

  /******/


  setKey(__webpack_require__, "o", function (object, property) {
    return callKey2(Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty, "call", object, property);
  });
  /******/

  /******/
  // __webpack_public_path__

  /******/


  setKey(__webpack_require__, "p", "");
  /******/

  /******/

  /******/
  // Load entry module and return exports

  /******/


  return __webpack_require__(setKey(__webpack_require__, "s", 44));
  /******/
}
/************************************************************************/

/******/
)([
/* 0 */

/***/
function (module, exports, __webpack_require__) {
  var global = __webpack_require__(2);

  var core = __webpack_require__(10);

  var hide = __webpack_require__(15);

  var redefine = __webpack_require__(33);

  var ctx = __webpack_require__(34);

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var _ref, _PROTOTYPE;

    var IS_FORCED = type & ($export._ES5ProxyType ? $export.get("F") : $export.F);
    var IS_GLOBAL = type & ($export._ES5ProxyType ? $export.get("G") : $export.G);
    var IS_STATIC = type & ($export._ES5ProxyType ? $export.get("S") : $export.S);
    var IS_PROTO = type & ($export._ES5ProxyType ? $export.get("P") : $export.P);
    var IS_BIND = type & ($export._ES5ProxyType ? $export.get("B") : $export.B);
    var target = IS_GLOBAL ? global : IS_STATIC ? (global._ES5ProxyType ? global.get(name) : global[name]) || setKey(global, name, {}) : (_ref = (global._ES5ProxyType ? global.get(name) : global[name]) || {}, _PROTOTYPE = _ref._ES5ProxyType ? _ref.get(PROTOTYPE) : _ref[PROTOTYPE]);
    var exports = IS_GLOBAL ? core : (core._ES5ProxyType ? core.get(name) : core[name]) || setKey(core, name, {});

    var expProto = (exports._ES5ProxyType ? exports.get(PROTOTYPE) : exports[PROTOTYPE]) || setKey(exports, PROTOTYPE, {});

    var key, own, out, exp;
    if (IS_GLOBAL) source = name;

    for (key in iterableKey(source)) {
      var _ref2, _key;

      // contains in native
      own = !IS_FORCED && target && (target._ES5ProxyType ? target.get(key) : target[key]) !== undefined; // export native or passed

      out = (_ref2 = own ? target : source, _key = _ref2._ES5ProxyType ? _ref2.get(key) : _ref2[key]); // bind timers to global for call from export context

      exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out; // extend global

      if (target) redefine(target, key, out, type & ($export._ES5ProxyType ? $export.get("U") : $export.U)); // export

      if ((exports._ES5ProxyType ? exports.get(key) : exports[key]) != out) hide(exports, key, exp);
      if (IS_PROTO && (expProto._ES5ProxyType ? expProto.get(key) : expProto[key]) != out) setKey(expProto, key, out);
    }
  };

  setKey(global, "core", core); // type bitmap


  setKey($export, "F", 1); // forced


  setKey($export, "G", 2); // global


  setKey($export, "S", 4); // static


  setKey($export, "P", 8); // proto


  setKey($export, "B", 16); // bind


  setKey($export, "W", 32); // wrap


  setKey($export, "U", 64); // safe


  setKey($export, "R", 128); // real proto method for `library`


  setKey(module, "exports", $export);
  /***/

},
/* 1 */

/***/
function (module, exports) {
  setKey(module, "exports", function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  });
  /***/

},
/* 2 */

/***/
function (module, exports) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = setKey(module, "exports", typeof window != 'undefined' && (window._ES5ProxyType ? window.get("Math") : window.Math) == Math ? window : typeof self != 'undefined' && (self._ES5ProxyType ? self.get("Math") : self.Math) == Math ? self // eslint-disable-next-line no-new-func
  : Function('return this')());

  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

  /***/
},
/* 3 */

/***/
function (module, exports, __webpack_require__) {
  // most Object methods by ES6 should accept primitives
  var $export = __webpack_require__(0);

  var core = __webpack_require__(10);

  var fails = __webpack_require__(9);

  setKey(module, "exports", function (KEY, exec) {
    var _ref3, _KEY;

    var fn = (_ref3 = (core._ES5ProxyType ? core.get("Object") : core.Object) || {}, _KEY = _ref3._ES5ProxyType ? _ref3.get(KEY) : _ref3[KEY]) || Object[KEY];
    var exp = {};

    setKey(exp, KEY, exec(fn));

    $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * fails(function () {
      fn(1);
    }), 'Object', exp);
  });
  /***/

},
/* 4 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__, _Symbol;

  var store = __webpack_require__(21)('wks');

  var uid = __webpack_require__(13);

  var Symbol = (_webpack_require__ = __webpack_require__(2), _Symbol = _webpack_require__._ES5ProxyType ? _webpack_require__.get("Symbol") : _webpack_require__.Symbol);
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = setKey(module, "exports", function (name) {
    return (store._ES5ProxyType ? store.get(name) : store[name]) || setKey(store, name, USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
  });

  setKey($exports, "store", store);
  /***/

},
/* 5 */

/***/
function (module, exports) {
  var _ref4, _compatHasOwnProperty;

  var hasOwnProperty = (_ref4 = {}, _compatHasOwnProperty = _ref4._ES5ProxyType ? _ref4.get("compatHasOwnProperty") : _ref4.compatHasOwnProperty);

  setKey(module, "exports", function (it, key) {
    return callKey2(hasOwnProperty, "call", it, key);
  });
  /***/

},
/* 6 */

/***/
function (module, exports, __webpack_require__) {
  var anObject = __webpack_require__(11);

  var IE8_DOM_DEFINE = __webpack_require__(31);

  var toPrimitive = __webpack_require__(20);

  var dP = Object.compatDefineProperty;

  setKey(exports, "f", __webpack_require__(8) ? Object.compatDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (IE8_DOM_DEFINE) try {
      return dP(O, P, Attributes);
    } catch (e) {
      /* empty */
    }
    if (inKey(Attributes, 'get') || inKey(Attributes, 'set')) throw TypeError('Accessors not supported!');
    if (inKey(Attributes, 'value')) setKey(O, P, Attributes._ES5ProxyType ? Attributes.get("value") : Attributes.value);
    return O;
  });
  /***/

},
/* 7 */

/***/
function (module, exports, __webpack_require__) {
  // to indexed object, toObject with fallback for non-array-like ES3 strings
  var IObject = __webpack_require__(50);

  var defined = __webpack_require__(37);

  setKey(module, "exports", function (it) {
    return IObject(defined(it));
  });
  /***/

},
/* 8 */

/***/
function (module, exports, __webpack_require__) {
  // Thank's IE8 for his funny defineProperty
  setKey(module, "exports", !__webpack_require__(9)(function () {
    var _Object$compatDefineP, _a;

    return (_Object$compatDefineP = Object.compatDefineProperty({}, 'a', {
      get: function () {
        return 7;
      }
    }), _a = _Object$compatDefineP._ES5ProxyType ? _Object$compatDefineP.get("a") : _Object$compatDefineP.a) != 7;
  }));
  /***/

},
/* 9 */

/***/
function (module, exports) {
  setKey(module, "exports", function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  });
  /***/

},
/* 10 */

/***/
function (module, exports) {
  var core = setKey(module, "exports", {
    version: '2.5.7'
  });

  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

  /***/
},
/* 11 */

/***/
function (module, exports, __webpack_require__) {
  var isObject = __webpack_require__(1);

  setKey(module, "exports", function (it) {
    if (!isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  });
  /***/

},
/* 12 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.13 ToObject(argument)
  var defined = __webpack_require__(37);

  setKey(module, "exports", function (it) {
    return Object(defined(it));
  });
  /***/

},
/* 13 */

/***/
function (module, exports) {
  var id = 0;
  var px = Math.random();

  setKey(module, "exports", function (key) {
    return concat('Symbol(', key === undefined ? '' : key, ')_', callKey1(++id + px, "toString", 36));
  });
  /***/

},
/* 14 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  var $keys = __webpack_require__(36);

  var enumBugKeys = __webpack_require__(26);

  setKey(module, "exports", Object.compatKeys || function keys(O) {
    return $keys(O, enumBugKeys);
  });
  /***/

},
/* 15 */

/***/
function (module, exports, __webpack_require__) {
  var dP = __webpack_require__(6);

  var createDesc = __webpack_require__(16);

  setKey(module, "exports", __webpack_require__(8) ? function (object, key, value) {
    return callKey3(dP, "f", object, key, createDesc(1, value));
  } : function (object, key, value) {
    setKey(object, key, value);

    return object;
  });
  /***/

},
/* 16 */

/***/
function (module, exports) {
  setKey(module, "exports", function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  });
  /***/

},
/* 17 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__2, _f;

  var META = __webpack_require__(13)('meta');

  var isObject = __webpack_require__(1);

  var has = __webpack_require__(5);

  var setDesc = (_webpack_require__2 = __webpack_require__(6), _f = _webpack_require__2._ES5ProxyType ? _webpack_require__2.get("f") : _webpack_require__2.f);
  var id = 0;

  var isExtensible = Object.isExtensible || function () {
    return true;
  };

  var FREEZE = !__webpack_require__(9)(function () {
    return isExtensible(Object.preventExtensions({}));
  });

  var setMeta = function (it) {
    setDesc(it, META, {
      value: {
        i: 'O' + ++id,
        // object ID
        w: {} // weak collections IDs

      }
    });
  };

  var fastKey = function (it, create) {
    var _META, _i;

    // return primitive with prefix
    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

      if (!create) return 'E'; // add missing metadata

      setMeta(it); // return object ID
    }

    return _META = it._ES5ProxyType ? it.get(META) : it[META], _i = _META._ES5ProxyType ? _META.get("i") : _META.i;
  };

  var getWeak = function (it, create) {
    var _META2, _w;

    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true; // not necessary to add metadata

      if (!create) return false; // add missing metadata

      setMeta(it); // return hash weak collections IDs
    }

    return _META2 = it._ES5ProxyType ? it.get(META) : it[META], _w = _META2._ES5ProxyType ? _META2.get("w") : _META2.w;
  }; // add metadata on freeze-family methods calling


  var onFreeze = function (it) {
    if (FREEZE && (meta._ES5ProxyType ? meta.get("NEED") : meta.NEED) && isExtensible(it) && !has(it, META)) setMeta(it);
    return it;
  };

  var meta = setKey(module, "exports", {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  });
  /***/

},
/* 18 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.15 ToLength
  var toInteger = __webpack_require__(39);

  var min = Math.min;

  setKey(module, "exports", function (it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  });
  /***/

},
/* 19 */

/***/
function (module, exports) {
  var _ref5, _propertyIsEnumerable;

  setKey(exports, "f", (_ref5 = {}, _propertyIsEnumerable = _ref5._ES5ProxyType ? _ref5.get("propertyIsEnumerable") : _ref5.propertyIsEnumerable));
  /***/

},
/* 20 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.1 ToPrimitive(input [, PreferredType])
  var isObject = __webpack_require__(1); // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string


  setKey(module, "exports", function (it, S) {
    if (!isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it._ES5ProxyType ? it.get("toString") : it.toString) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    if (typeof (fn = it._ES5ProxyType ? it.get("valueOf") : it.valueOf) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    if (!S && typeof (fn = it._ES5ProxyType ? it.get("toString") : it.toString) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    throw TypeError("Can't convert object to primitive value");
  });
  /***/

},
/* 21 */

/***/
function (module, exports, __webpack_require__) {
  var core = __webpack_require__(10);

  var global = __webpack_require__(2);

  var SHARED = '__core-js_shared__';

  var store = (global._ES5ProxyType ? global.get(SHARED) : global[SHARED]) || setKey(global, SHARED, {});

  setKey(module, "exports", function (key, value) {
    return (store._ES5ProxyType ? store.get(key) : store[key]) || setKey(store, key, value !== undefined ? value : {});
  })('versions', []).push({
    version: core._ES5ProxyType ? core.get("version") : core.version,
    mode: __webpack_require__(22) ? 'pure' : 'global',
    copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
  });
  /***/

},
/* 22 */

/***/
function (module, exports) {
  setKey(module, "exports", false);
  /***/

},
/* 23 */

/***/
function (module, exports) {
  var _ref6, _toString;

  var toString = (_ref6 = {}, _toString = _ref6._ES5ProxyType ? _ref6.get("toString") : _ref6.toString);

  setKey(module, "exports", function (it) {
    return callKey2(callKey1(toString, "call", it), "slice", 8, -1);
  });
  /***/

},
/* 24 */

/***/
function (module, exports, __webpack_require__) {
  var toInteger = __webpack_require__(39);

  var max = Math.max;
  var min = Math.min;

  setKey(module, "exports", function (index, length) {
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  });
  /***/

},
/* 25 */

/***/
function (module, exports, __webpack_require__) {
  var shared = __webpack_require__(21)('keys');

  var uid = __webpack_require__(13);

  setKey(module, "exports", function (key) {
    return (shared._ES5ProxyType ? shared.get(key) : shared[key]) || setKey(shared, key, uid(key));
  });
  /***/

},
/* 26 */

/***/
function (module, exports) {
  // IE 8- don't enum bug keys
  setKey(module, "exports", callKey1('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf', "split", ','));
  /***/

},
/* 27 */

/***/
function (module, exports) {
  setKey(exports, "f", Object.getOwnPropertySymbols);
  /***/

},
/* 28 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  var $keys = __webpack_require__(36);

  var hiddenKeys = concat(__webpack_require__(26), 'length', 'prototype');

  setKey(exports, "f", Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return $keys(O, hiddenKeys);
  });
  /***/

},
/* 29 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var $defineProperty = __webpack_require__(6);

  var createDesc = __webpack_require__(16);

  setKey(module, "exports", function (object, index, value) {
    if (inKey(object, index)) callKey3($defineProperty, "f", object, index, createDesc(0, value));else setKey(object, index, value);
  });
  /***/

},
/* 30 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = __webpack_require__(4)('unscopables');

  var ArrayProto = Array.prototype;
  if ((ArrayProto._ES5ProxyType ? ArrayProto.get(UNSCOPABLES) : ArrayProto[UNSCOPABLES]) == undefined) __webpack_require__(15)(ArrayProto, UNSCOPABLES, {});

  setKey(module, "exports", function (key) {
    setKey(ArrayProto._ES5ProxyType ? ArrayProto.get(UNSCOPABLES) : ArrayProto[UNSCOPABLES], key, true);
  });
  /***/

},
/* 31 */

/***/
function (module, exports, __webpack_require__) {
  setKey(module, "exports", !__webpack_require__(8) && !__webpack_require__(9)(function () {
    var _Object$compatDefineP2, _a2;

    return (_Object$compatDefineP2 = Object.compatDefineProperty(__webpack_require__(32)('div'), 'a', {
      get: function () {
        return 7;
      }
    }), _a2 = _Object$compatDefineP2._ES5ProxyType ? _Object$compatDefineP2.get("a") : _Object$compatDefineP2.a) != 7;
  }));
  /***/

},
/* 32 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__3, _document;

  var isObject = __webpack_require__(1);

  var document = (_webpack_require__3 = __webpack_require__(2), _document = _webpack_require__3._ES5ProxyType ? _webpack_require__3.get("document") : _webpack_require__3.document); // typeof document.createElement is 'object' in old IE

  var is = isObject(document) && isObject(document._ES5ProxyType ? document.get("createElement") : document.createElement);

  setKey(module, "exports", function (it) {
    return is ? callKey1(document, "createElement", it) : {};
  });
  /***/

},
/* 33 */

/***/
function (module, exports, __webpack_require__) {
  var global = __webpack_require__(2);

  var hide = __webpack_require__(15);

  var has = __webpack_require__(5);

  var SRC = __webpack_require__(13)('src');

  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];

  var TPL = callKey1('' + $toString, "split", TO_STRING);

  setKey(__webpack_require__(10), "inspectSource", function (it) {
    return callKey1($toString, "call", it);
  });

  setKey(module, "exports", function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) has(val, 'name') || hide(val, 'name', key);
    if ((O._ES5ProxyType ? O.get(key) : O[key]) === val) return;
    if (isFunction) has(val, SRC) || hide(val, SRC, (O._ES5ProxyType ? O.get(key) : O[key]) ? '' + (O._ES5ProxyType ? O.get(key) : O[key]) : callKey1(TPL, "join", String(key)));

    if (O === global) {
      setKey(O, key, val);
    } else if (!safe) {
      deleteKey(O, key);

      hide(O, key, val);
    } else if (O._ES5ProxyType ? O.get(key) : O[key]) {
      setKey(O, key, val);
    } else {
      hide(O, key, val);
    } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && (this._ES5ProxyType ? this.get(SRC) : this[SRC]) || callKey1($toString, "call", this);
  });
  /***/

},
/* 34 */

/***/
function (module, exports, __webpack_require__) {
  // optional / simple context binding
  var aFunction = __webpack_require__(46);

  setKey(module, "exports", function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 1:
        return function (a) {
          return callKey2(fn, "call", that, a);
        };

      case 2:
        return function (a, b) {
          return callKey3(fn, "call", that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return callKey4(fn, "call", that, a, b, c);
        };
    }

    return function
      /* ...args */
    () {
      return callKey2(fn, "apply", that, arguments);
    };
  });
  /***/

},
/* 35 */

/***/
function (module, exports, __webpack_require__) {
  setKey(exports, "f", __webpack_require__(4));
  /***/

},
/* 36 */

/***/
function (module, exports, __webpack_require__) {
  var has = __webpack_require__(5);

  var toIObject = __webpack_require__(7);

  var arrayIndexOf = __webpack_require__(38)(false);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  setKey(module, "exports", function (object, names) {
    var O = toIObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in iterableKey(O)) if (key != IE_PROTO) has(O, key) && result.push(key); // Don't enum bug & hidden keys


    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i2, _i3;

      if (has(O, key = (_i2 = i++, _i3 = names._ES5ProxyType ? names.get(_i2) : names[_i2]))) {
        ~arrayIndexOf(result, key) || result.push(key);
      }
    }

    return result;
  });
  /***/

},
/* 37 */

/***/
function (module, exports) {
  // 7.2.1 RequireObjectCoercible(argument)
  setKey(module, "exports", function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  });
  /***/

},
/* 38 */

/***/
function (module, exports, __webpack_require__) {
  // false -> Array#indexOf
  // true  -> Array#includes
  var toIObject = __webpack_require__(7);

  var toLength = __webpack_require__(18);

  var toAbsoluteIndex = __webpack_require__(24);

  setKey(module, "exports", function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIObject($this);
      var length = toLength(O._ES5ProxyType ? O.get("length") : O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        var _index, _index2;

        value = (_index = index++, _index2 = O._ES5ProxyType ? O.get(_index) : O[_index]); // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) if (IS_INCLUDES || inKey(O, index)) {
        if ((O._ES5ProxyType ? O.get(index) : O[index]) === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  });
  /***/

},
/* 39 */

/***/
function (module, exports) {
  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;

  setKey(module, "exports", function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  });
  /***/

},
/* 40 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__4, _f2, _ref7, _toString2;

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  var toIObject = __webpack_require__(7);

  var gOPN = (_webpack_require__4 = __webpack_require__(28), _f2 = _webpack_require__4._ES5ProxyType ? _webpack_require__4.get("f") : _webpack_require__4.f);
  var toString = (_ref7 = {}, _toString2 = _ref7._ES5ProxyType ? _ref7.get("toString") : _ref7.toString);
  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN(it);
    } catch (e) {
      return callKey0(windowNames, "slice");
    }
  };

  setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "f", function getOwnPropertyNames(it) {
    return windowNames && callKey1(toString, "call", it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
  });
  /***/

},
/* 41 */

/***/
function (module, exports, __webpack_require__) {
  var pIE = __webpack_require__(19);

  var createDesc = __webpack_require__(16);

  var toIObject = __webpack_require__(7);

  var toPrimitive = __webpack_require__(20);

  var has = __webpack_require__(5);

  var IE8_DOM_DEFINE = __webpack_require__(31);

  var gOPD = Object.compatGetOwnPropertyDescriptor;

  setKey(exports, "f", __webpack_require__(8) ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = toIObject(O);
    P = toPrimitive(P, true);
    if (IE8_DOM_DEFINE) try {
      return gOPD(O, P);
    } catch (e) {
      /* empty */
    }
    if (has(O, P)) return createDesc(!callKey2(pIE._ES5ProxyType ? pIE.get("f") : pIE.f, "call", O, P), O._ES5ProxyType ? O.get(P) : O[P]);
  });
  /***/

},
/* 42 */

/***/
function (module, exports) {
  setKey(module, "exports", {});
  /***/

},
/* 43 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__5, _f3;

  var getKeys = __webpack_require__(14);

  var toIObject = __webpack_require__(7);

  var isEnum = (_webpack_require__5 = __webpack_require__(19), _f3 = _webpack_require__5._ES5ProxyType ? _webpack_require__5.get("f") : _webpack_require__5.f);

  setKey(module, "exports", function (isEntries) {
    return function (it) {
      var O = toIObject(it);
      var keys = getKeys(O);
      var length = keys._ES5ProxyType ? keys.get("length") : keys.length;
      var i = 0;
      var result = [];
      var key;

      while (length > i) {
        var _i4, _i5;

        if (callKey2(isEnum, "call", O, key = (_i4 = i++, _i5 = keys._ES5ProxyType ? keys.get(_i4) : keys[_i4]))) {
          result.push(isEntries ? [key, O._ES5ProxyType ? O.get(key) : O[key]] : O._ES5ProxyType ? O.get(key) : O[key]);
        }
      }

      return result;
    };
  });
  /***/

},
/* 44 */

/***/
function (module, exports, __webpack_require__) {
  __webpack_require__(45);

  __webpack_require__(55);

  __webpack_require__(57);

  __webpack_require__(58);

  __webpack_require__(59);

  __webpack_require__(60);

  __webpack_require__(61);

  __webpack_require__(62);

  __webpack_require__(63);

  __webpack_require__(64);

  __webpack_require__(65);

  __webpack_require__(67);

  __webpack_require__(73);

  __webpack_require__(74);

  __webpack_require__(76);

  __webpack_require__(78);

  __webpack_require__(79);

  __webpack_require__(81);

  setKey(module, "exports", __webpack_require__(82));
  /***/

},
/* 45 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // ECMAScript 6 symbols shim

  var _webpack_require__6, _KEY2, _ref8, _propertyIsEnumerable2, _PROTOTYPE2, _findChild, _PROTOTYPE3, _TO_PRIMITIVE, _PROTOTYPE4, _valueOf;

  var global = __webpack_require__(2);

  var has = __webpack_require__(5);

  var DESCRIPTORS = __webpack_require__(8);

  var $export = __webpack_require__(0);

  var redefine = __webpack_require__(33);

  var META = (_webpack_require__6 = __webpack_require__(17), _KEY2 = _webpack_require__6._ES5ProxyType ? _webpack_require__6.get("KEY") : _webpack_require__6.KEY);

  var $fails = __webpack_require__(9);

  var shared = __webpack_require__(21);

  var setToStringTag = __webpack_require__(47);

  var uid = __webpack_require__(13);

  var wks = __webpack_require__(4);

  var wksExt = __webpack_require__(35);

  var wksDefine = __webpack_require__(48);

  var enumKeys = __webpack_require__(49);

  var isArray = __webpack_require__(51);

  var anObject = __webpack_require__(11);

  var isObject = __webpack_require__(1);

  var toIObject = __webpack_require__(7);

  var toPrimitive = __webpack_require__(20);

  var createDesc = __webpack_require__(16);

  var _create = __webpack_require__(52);

  var gOPNExt = __webpack_require__(40);

  var $GOPD = __webpack_require__(41);

  var $DP = __webpack_require__(6);

  var $keys = __webpack_require__(14);

  var gOPD = $GOPD._ES5ProxyType ? $GOPD.get("f") : $GOPD.f;
  var dP = $DP._ES5ProxyType ? $DP.get("f") : $DP.f;
  var gOPN = gOPNExt._ES5ProxyType ? gOPNExt.get("f") : gOPNExt.f;
  var $Symbol = global._ES5ProxyType ? global.get("Symbol") : global.Symbol;
  var $JSON = global._ES5ProxyType ? global.get("JSON") : global.JSON;

  var _stringify = $JSON && ($JSON._ES5ProxyType ? $JSON.get("stringify") : $JSON.stringify);

  var PROTOTYPE = 'prototype';
  var HIDDEN = wks('_hidden');
  var TO_PRIMITIVE = wks('toPrimitive');
  var isEnum = (_ref8 = {}, _propertyIsEnumerable2 = _ref8._ES5ProxyType ? _ref8.get("propertyIsEnumerable") : _ref8.propertyIsEnumerable);
  var SymbolRegistry = shared('symbol-registry');
  var AllSymbols = shared('symbols');
  var OPSymbols = shared('op-symbols');
  var ObjectProto = Object[PROTOTYPE];
  var USE_NATIVE = typeof $Symbol == 'function';
  var QObject = global._ES5ProxyType ? global.get("QObject") : global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var setter = !QObject || !(QObject._ES5ProxyType ? QObject.get(PROTOTYPE) : QObject[PROTOTYPE]) || !(_PROTOTYPE2 = QObject._ES5ProxyType ? QObject.get(PROTOTYPE) : QObject[PROTOTYPE], _findChild = _PROTOTYPE2._ES5ProxyType ? _PROTOTYPE2.get("findChild") : _PROTOTYPE2.findChild); // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDesc = DESCRIPTORS && $fails(function () {
    var _create2, _a3;

    return (_create2 = _create(dP({}, 'a', {
      get: function () {
        var _dP, _a4;

        return _dP = dP(this, 'a', {
          value: 7
        }), _a4 = _dP._ES5ProxyType ? _dP.get("a") : _dP.a;
      }
    })), _a3 = _create2._ES5ProxyType ? _create2.get("a") : _create2.a) != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD(ObjectProto, key);
    if (protoDesc) deleteKey(ObjectProto, key);
    dP(it, key, D);
    if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
  } : dP;

  var wrap = function (tag) {
    var sym = setKey(AllSymbols, tag, _create($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE]));

    setKey(sym, "_k", tag);

    return sym;
  };

  var isSymbol = USE_NATIVE && typeof ($Symbol._ES5ProxyType ? $Symbol.get("iterator") : $Symbol.iterator) == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return instanceOfKey(it, $Symbol);
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
    anObject(it);
    key = toPrimitive(key, true);
    anObject(D);

    if (has(AllSymbols, key)) {
      if (!(D._ES5ProxyType ? D.get("enumerable") : D.enumerable)) {
        if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));

        setKey(it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], key, true);
      } else {
        var _HIDDEN, _key2;

        if (has(it, HIDDEN) && (_HIDDEN = it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], _key2 = _HIDDEN._ES5ProxyType ? _HIDDEN.get(key) : _HIDDEN[key])) setKey(it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], key, false);
        D = _create(D, {
          enumerable: createDesc(0, false)
        });
      }

      return setSymbolDesc(it, key, D);
    }

    return dP(it, key, D);
  };

  var $defineProperties = function defineProperties(it, P) {
    anObject(it);
    var keys = enumKeys(P = toIObject(P));
    var i = 0;
    var l = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var key;

    while (l > i) {
      var _i6, _i7;

      $defineProperty(it, key = (_i6 = i++, _i7 = keys._ES5ProxyType ? keys.get(_i6) : keys[_i6]), P._ES5ProxyType ? P.get(key) : P[key]);
    }

    return it;
  };

  var $create = function create(it, P) {
    return P === undefined ? _create(it) : $defineProperties(_create(it), P);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var _HIDDEN2, _key3;

    var E = callKey2(isEnum, "call", this, key = toPrimitive(key, true));

    if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && (_HIDDEN2 = this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], _key3 = _HIDDEN2._ES5ProxyType ? _HIDDEN2.get(key) : _HIDDEN2[key]) ? E : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    var _HIDDEN3, _key4;

    it = toIObject(it);
    key = toPrimitive(key, true);
    if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
    var D = gOPD(it, key);
    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && (_HIDDEN3 = it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], _key4 = _HIDDEN3._ES5ProxyType ? _HIDDEN3.get(key) : _HIDDEN3[key]))) setKey(D, "enumerable", true);
    return D;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN(toIObject(it));
    var result = [];
    var i = 0;
    var key;

    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i8, _i9;

      if (!has(AllSymbols, key = (_i8 = i++, _i9 = names._ES5ProxyType ? names.get(_i8) : names[_i8])) && key != HIDDEN && key != META) result.push(key);
    }

    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto;
    var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
    var result = [];
    var i = 0;
    var key;

    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i10, _i11;

      if (has(AllSymbols, key = (_i10 = i++, _i11 = names._ES5ProxyType ? names.get(_i10) : names[_i10])) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols._ES5ProxyType ? AllSymbols.get(key) : AllSymbols[key]);
    }

    return result;
  }; // 19.4.1.1 Symbol([description])


  if (!USE_NATIVE) {
    $Symbol = function Symbol() {
      if (instanceOfKey(this, $Symbol)) throw TypeError('Symbol is not a constructor!');
      var tag = uid(arguments.length > 0 ? arguments[0] : undefined);

      var $set = function (value) {
        if (this === ObjectProto) callKey2($set, "call", OPSymbols, value);
        if (has(this, HIDDEN) && has(this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], tag)) setKey(this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], tag, false);
        setSymbolDesc(this, tag, createDesc(1, value));
      };

      if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, {
        configurable: true,
        set: $set
      });
      return wrap(tag);
    };

    redefine($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], 'toString', function toString() {
      return this._ES5ProxyType ? this.get("_k") : this._k;
    });

    setKey($GOPD, "f", $getOwnPropertyDescriptor);

    setKey($DP, "f", $defineProperty);

    setKey(__webpack_require__(28), "f", setKey(gOPNExt, "f", $getOwnPropertyNames));

    setKey(__webpack_require__(19), "f", $propertyIsEnumerable);

    setKey(__webpack_require__(27), "f", $getOwnPropertySymbols);

    if (DESCRIPTORS && !__webpack_require__(22)) {
      redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    setKey(wksExt, "f", function (name) {
      return wrap(wks(name));
    });
  }

  $export(($export._ES5ProxyType ? $export.get("G") : $export.G) + ($export._ES5ProxyType ? $export.get("W") : $export.W) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, {
    Symbol: $Symbol
  });

  for (var es6Symbols = callKey1( // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables', "split", ','), j = 0; (es6Symbols._ES5ProxyType ? es6Symbols.get("length") : es6Symbols.length) > j;) {
    var _j, _j2;

    wks((_j = j++, _j2 = es6Symbols._ES5ProxyType ? es6Symbols.get(_j) : es6Symbols[_j]));
  }

  for (var wellKnownSymbols = $keys(wks._ES5ProxyType ? wks.get("store") : wks.store), k = 0; (wellKnownSymbols._ES5ProxyType ? wellKnownSymbols.get("length") : wellKnownSymbols.length) > k;) {
    var _k, _k2;

    wksDefine((_k = k++, _k2 = wellKnownSymbols._ES5ProxyType ? wellKnownSymbols.get(_k) : wellKnownSymbols[_k]));
  }

  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return has(SymbolRegistry, key += '') ? SymbolRegistry._ES5ProxyType ? SymbolRegistry.get(key) : SymbolRegistry[key] : setKey(SymbolRegistry, key, $Symbol(key));
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

      for (var key in iterableKey(SymbolRegistry)) if ((SymbolRegistry._ES5ProxyType ? SymbolRegistry.get(key) : SymbolRegistry[key]) === sym) return key;
    },
    useSetter: function () {
      setter = true;
    },
    useSimple: function () {
      setter = false;
    }
  });
  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // 24.3.2 JSON.stringify(value [, replacer [, space]])

  $JSON && $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * (!USE_NATIVE || $fails(function () {
    var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols

    return _stringify([S]) != '[null]' || _stringify({
      a: S
    }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;

      while (arguments.length > i) args.push(arguments[i++]);

      $replacer = replacer = args._ES5ProxyType ? args.get(1) : args[1];
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = callKey3($replacer, "call", this, key, value);
        if (!isSymbol(value)) return value;
      };

      setKey(args, 1, replacer);

      return callKey2(_stringify, "apply", $JSON, args);
    }
  }); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

  (_PROTOTYPE3 = $Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], _TO_PRIMITIVE = _PROTOTYPE3._ES5ProxyType ? _PROTOTYPE3.get(TO_PRIMITIVE) : _PROTOTYPE3[TO_PRIMITIVE]) || __webpack_require__(15)($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], TO_PRIMITIVE, (_PROTOTYPE4 = $Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], _valueOf = _PROTOTYPE4._ES5ProxyType ? _PROTOTYPE4.get("valueOf") : _PROTOTYPE4.valueOf)); // 19.4.3.5 Symbol.prototype[@@toStringTag]

  setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

  setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

  setToStringTag(global._ES5ProxyType ? global.get("JSON") : global.JSON, 'JSON', true);
  /***/
},
/* 46 */

/***/
function (module, exports) {
  setKey(module, "exports", function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  });
  /***/

},
/* 47 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__7, _f4;

  var def = (_webpack_require__7 = __webpack_require__(6), _f4 = _webpack_require__7._ES5ProxyType ? _webpack_require__7.get("f") : _webpack_require__7.f);

  var has = __webpack_require__(5);

  var TAG = __webpack_require__(4)('toStringTag');

  setKey(module, "exports", function (it, tag, stat) {
    if (it && !has(it = stat ? it : it._ES5ProxyType ? it.get("prototype") : it.prototype, TAG)) def(it, TAG, {
      configurable: true,
      value: tag
    });
  });
  /***/

},
/* 48 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__8, _f5;

  var global = __webpack_require__(2);

  var core = __webpack_require__(10);

  var LIBRARY = __webpack_require__(22);

  var wksExt = __webpack_require__(35);

  var defineProperty = (_webpack_require__8 = __webpack_require__(6), _f5 = _webpack_require__8._ES5ProxyType ? _webpack_require__8.get("f") : _webpack_require__8.f);

  setKey(module, "exports", function (name) {
    var $Symbol = (core._ES5ProxyType ? core.get("Symbol") : core.Symbol) || setKey(core, "Symbol", LIBRARY ? {} : (global._ES5ProxyType ? global.get("Symbol") : global.Symbol) || {});

    if (callKey1(name, "charAt", 0) != '_' && !inKey($Symbol, name)) defineProperty($Symbol, name, {
      value: callKey1(wksExt, "f", name)
    });
  });
  /***/

},
/* 49 */

/***/
function (module, exports, __webpack_require__) {
  // all enumerable object keys, includes symbols
  var getKeys = __webpack_require__(14);

  var gOPS = __webpack_require__(27);

  var pIE = __webpack_require__(19);

  setKey(module, "exports", function (it) {
    var result = getKeys(it);
    var getSymbols = gOPS._ES5ProxyType ? gOPS.get("f") : gOPS.f;

    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = pIE._ES5ProxyType ? pIE.get("f") : pIE.f;
      var i = 0;
      var key;

      while ((symbols._ES5ProxyType ? symbols.get("length") : symbols.length) > i) {
        var _i12, _i13;

        if (callKey2(isEnum, "call", it, key = (_i12 = i++, _i13 = symbols._ES5ProxyType ? symbols.get(_i12) : symbols[_i12]))) result.push(key);
      }
    }

    return result;
  });
  /***/

},
/* 50 */

/***/
function (module, exports, __webpack_require__) {
  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var cof = __webpack_require__(23); // eslint-disable-next-line no-prototype-builtins


  setKey(module, "exports", callKey1(Object('z'), "propertyIsEnumerable", 0) ? Object : function (it) {
    return cof(it) == 'String' ? callKey1(it, "split", '') : Object(it);
  });
  /***/

},
/* 51 */

/***/
function (module, exports, __webpack_require__) {
  // 7.2.2 IsArray(argument)
  var cof = __webpack_require__(23);

  setKey(module, "exports", Array.compatIsArray || function isArray(arg) {
    return cof(arg) == 'Array';
  });
  /***/

},
/* 52 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  var anObject = __webpack_require__(11);

  var dPs = __webpack_require__(53);

  var enumBugKeys = __webpack_require__(26);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  var Empty = function () {
    /* empty */
  };

  var PROTOTYPE = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

  var createDict = function () {
    var _contentWindow, _document2;

    // Thrash, waste and sodomy: IE GC bug
    var iframe = __webpack_require__(32)('iframe');

    var i = enumBugKeys._ES5ProxyType ? enumBugKeys.get("length") : enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;

    setKey(iframe._ES5ProxyType ? iframe.get("style") : iframe.style, "display", 'none');

    callKey1(__webpack_require__(54), "appendChild", iframe);

    setKey(iframe, "src", 'javascript:'); // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);


    iframeDocument = (_contentWindow = iframe._ES5ProxyType ? iframe.get("contentWindow") : iframe.contentWindow, _document2 = _contentWindow._ES5ProxyType ? _contentWindow.get("document") : _contentWindow.document);

    callKey0(iframeDocument, "open");

    callKey1(iframeDocument, "write", lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);

    callKey0(iframeDocument, "close");

    createDict = iframeDocument._ES5ProxyType ? iframeDocument.get("F") : iframeDocument.F;

    while (i--) deleteKey(createDict._ES5ProxyType ? createDict.get(PROTOTYPE) : createDict[PROTOTYPE], enumBugKeys._ES5ProxyType ? enumBugKeys.get(i) : enumBugKeys[i]);

    return createDict();
  };

  setKey(module, "exports", Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      setKey(Empty, PROTOTYPE, anObject(O));

      result = new Empty();

      setKey(Empty, PROTOTYPE, null); // add "__proto__" for Object.getPrototypeOf polyfill


      setKey(result, IE_PROTO, O);
    } else result = createDict();

    return Properties === undefined ? result : dPs(result, Properties);
  });
  /***/

},
/* 53 */

/***/
function (module, exports, __webpack_require__) {
  var dP = __webpack_require__(6);

  var anObject = __webpack_require__(11);

  var getKeys = __webpack_require__(14);

  setKey(module, "exports", __webpack_require__(8) ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = getKeys(Properties);
    var length = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var i = 0;
    var P;

    while (length > i) {
      var _i14, _i15;

      callKey3(dP, "f", O, P = (_i14 = i++, _i15 = keys._ES5ProxyType ? keys.get(_i14) : keys[_i14]), Properties._ES5ProxyType ? Properties.get(P) : Properties[P]);
    }

    return O;
  });
  /***/

},
/* 54 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__9, _document3;

  var document = (_webpack_require__9 = __webpack_require__(2), _document3 = _webpack_require__9._ES5ProxyType ? _webpack_require__9.get("document") : _webpack_require__9.document);

  setKey(module, "exports", document && (document._ES5ProxyType ? document.get("documentElement") : document.documentElement));
  /***/

},
/* 55 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.9 Object.getPrototypeOf(O)
  var toObject = __webpack_require__(12);

  var $getPrototypeOf = __webpack_require__(56);

  __webpack_require__(3)('getPrototypeOf', function () {
    return function getPrototypeOf(it) {
      return $getPrototypeOf(toObject(it));
    };
  });
  /***/

},
/* 56 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  var has = __webpack_require__(5);

  var toObject = __webpack_require__(12);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  var ObjectProto = Object.prototype;

  setKey(module, "exports", Object.getPrototypeOf || function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO)) return O._ES5ProxyType ? O.get(IE_PROTO) : O[IE_PROTO];

    if (typeof (O._ES5ProxyType ? O.get("constructor") : O.constructor) == 'function' && instanceOfKey(O, O._ES5ProxyType ? O.get("constructor") : O.constructor)) {
      var _constructor, _prototype;

      return _constructor = O._ES5ProxyType ? O.get("constructor") : O.constructor, _prototype = _constructor._ES5ProxyType ? _constructor.get("prototype") : _constructor.prototype;
    }

    return instanceOfKey(O, Object) ? ObjectProto : null;
  });
  /***/

},
/* 57 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.14 Object.keys(O)
  var toObject = __webpack_require__(12);

  var $keys = __webpack_require__(14);

  __webpack_require__(3)('keys', function () {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  /***/

},
/* 58 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  __webpack_require__(3)('getOwnPropertyNames', function () {
    var _webpack_require__10, _f6;

    return _webpack_require__10 = __webpack_require__(40), _f6 = _webpack_require__10._ES5ProxyType ? _webpack_require__10.get("f") : _webpack_require__10.f;
  });
  /***/

},
/* 59 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__11, _onFreeze;

  // 19.1.2.5 Object.freeze(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__11 = __webpack_require__(17), _onFreeze = _webpack_require__11._ES5ProxyType ? _webpack_require__11.get("onFreeze") : _webpack_require__11.onFreeze);

  __webpack_require__(3)('freeze', function ($freeze) {
    return function freeze(it) {
      return $freeze && isObject(it) ? $freeze(meta(it)) : it;
    };
  });
  /***/

},
/* 60 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__12, _onFreeze2;

  // 19.1.2.17 Object.seal(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__12 = __webpack_require__(17), _onFreeze2 = _webpack_require__12._ES5ProxyType ? _webpack_require__12.get("onFreeze") : _webpack_require__12.onFreeze);

  __webpack_require__(3)('seal', function ($seal) {
    return function seal(it) {
      return $seal && isObject(it) ? $seal(meta(it)) : it;
    };
  });
  /***/

},
/* 61 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__13, _onFreeze3;

  // 19.1.2.15 Object.preventExtensions(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__13 = __webpack_require__(17), _onFreeze3 = _webpack_require__13._ES5ProxyType ? _webpack_require__13.get("onFreeze") : _webpack_require__13.onFreeze);

  __webpack_require__(3)('preventExtensions', function ($preventExtensions) {
    return function preventExtensions(it) {
      return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
    };
  });
  /***/

},
/* 62 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.12 Object.isFrozen(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isFrozen', function ($isFrozen) {
    return function isFrozen(it) {
      return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
    };
  });
  /***/

},
/* 63 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.13 Object.isSealed(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isSealed', function ($isSealed) {
    return function isSealed(it) {
      return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
    };
  });
  /***/

},
/* 64 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.11 Object.isExtensible(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isExtensible', function ($isExtensible) {
    return function isExtensible(it) {
      return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
    };
  });
  /***/

},
/* 65 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.3.10 Object.is(value1, value2)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    is: __webpack_require__(66)
  });
  /***/
},
/* 66 */

/***/
function (module, exports) {
  // 7.2.9 SameValue(x, y)
  setKey(module, "exports", Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  });
  /***/

},
/* 67 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var ctx = __webpack_require__(34);

  var $export = __webpack_require__(0);

  var toObject = __webpack_require__(12);

  var call = __webpack_require__(68);

  var isArrayIter = __webpack_require__(69);

  var toLength = __webpack_require__(18);

  var createProperty = __webpack_require__(29);

  var getIterFn = __webpack_require__(70);

  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !__webpack_require__(72)(function (iter) {
    Array.from(iter);
  }), 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function from(arrayLike
    /* , mapfn = undefined, thisArg = undefined */
    ) {
      var O = toObject(arrayLike);
      var C = typeof this == 'function' ? this : Array;
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var index = 0;
      var iterFn = getIterFn(O);
      var length, result, step, iterator;
      if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = callKey1(iterFn, "call", O), result = new C(); !(_step = step = callKey0(iterator, "next"), _done = _step._ES5ProxyType ? _step.get("done") : _step.done); index++) {
          var _step, _done;

          createProperty(result, index, mapping ? call(iterator, mapfn, [step._ES5ProxyType ? step.get("value") : step.value, index], true) : step._ES5ProxyType ? step.get("value") : step.value);
        }
      } else {
        length = toLength(O._ES5ProxyType ? O.get("length") : O.length);

        for (result = new C(length); length > index; index++) {
          createProperty(result, index, mapping ? mapfn(O._ES5ProxyType ? O.get(index) : O[index], index) : O._ES5ProxyType ? O.get(index) : O[index]);
        }
      }

      setKey(result, "length", index);

      return result;
    }
  });
  /***/
},
/* 68 */

/***/
function (module, exports, __webpack_require__) {
  // call something on iterator step with safe closing on error
  var anObject = __webpack_require__(11);

  setKey(module, "exports", function (iterator, fn, value, entries) {
    try {
      var _anObject, _;

      return entries ? fn((_anObject = anObject(value), _ = _anObject._ES5ProxyType ? _anObject.get(0) : _anObject[0]), value._ES5ProxyType ? value.get(1) : value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator._ES5ProxyType ? iterator.get('return') : iterator['return'];
      if (ret !== undefined) anObject(callKey1(ret, "call", iterator));
      throw e;
    }
  });
  /***/

},
/* 69 */

/***/
function (module, exports, __webpack_require__) {
  // check on default Array iterator
  var Iterators = __webpack_require__(42);

  var ITERATOR = __webpack_require__(4)('iterator');

  var ArrayProto = Array.prototype;

  setKey(module, "exports", function (it) {
    return it !== undefined && ((Iterators._ES5ProxyType ? Iterators.get("Array") : Iterators.Array) === it || (ArrayProto._ES5ProxyType ? ArrayProto.get(ITERATOR) : ArrayProto[ITERATOR]) === it);
  });
  /***/

},
/* 70 */

/***/
function (module, exports, __webpack_require__) {
  var classof = __webpack_require__(71);

  var ITERATOR = __webpack_require__(4)('iterator');

  var Iterators = __webpack_require__(42);

  setKey(module, "exports", setKey(__webpack_require__(10), "getIteratorMethod", function (it) {
    var _classof, _classof2;

    if (it != undefined) return (it._ES5ProxyType ? it.get(ITERATOR) : it[ITERATOR]) || (it._ES5ProxyType ? it.get('@@iterator') : it['@@iterator']) || (_classof = classof(it), _classof2 = Iterators._ES5ProxyType ? Iterators.get(_classof) : Iterators[_classof]);
  }));
  /***/

},
/* 71 */

/***/
function (module, exports, __webpack_require__) {
  // getting tag from 19.1.3.6 Object.prototype.toString()
  var cof = __webpack_require__(23);

  var TAG = __webpack_require__(4)('toStringTag'); // ES3 wrong here


  var ARG = cof(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function (it, key) {
    try {
      return it._ES5ProxyType ? it.get(key) : it[key];
    } catch (e) {
      /* empty */
    }
  };

  setKey(module, "exports", function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T // builtinTag case
    : ARG ? cof(O) // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof (O._ES5ProxyType ? O.get("callee") : O.callee) == 'function' ? 'Arguments' : B;
  });
  /***/

},
/* 72 */

/***/
function (module, exports, __webpack_require__) {
  var ITERATOR = __webpack_require__(4)('iterator');

  var SAFE_CLOSING = false;

  try {
    var riter = callKey0([7], ITERATOR);

    setKey(riter, 'return', function () {
      SAFE_CLOSING = true;
    }); // eslint-disable-next-line no-throw-literal


    Array.from(riter, function () {
      throw 2;
    });
  } catch (e) {
    /* empty */
  }

  setKey(module, "exports", function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;

    try {
      var arr = [7];

      var iter = callKey0(arr, ITERATOR);

      setKey(iter, "next", function () {
        return {
          done: safe = true
        };
      });

      setKey(arr, ITERATOR, function () {
        return iter;
      });

      exec(arr);
    } catch (e) {
      /* empty */
    }

    return safe;
  });
  /***/

},
/* 73 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var $export = __webpack_require__(0);

  var createProperty = __webpack_require__(29); // WebKit Array.of isn't generic


  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * __webpack_require__(9)(function () {
    function F() {
      /* empty */
    }

    return !instanceOfKey(callKey1(Array.of, "call", F), F);
  }), 'Array', {
    // 22.1.2.3 Array.of( ...items)
    of: function
      /* ...args */
    of() {
      var index = 0;
      var aLen = arguments.length;
      var result = new (typeof this == 'function' ? this : Array)(aLen);

      while (aLen > index) createProperty(result, index, arguments[index++]);

      setKey(result, "length", aLen);

      return result;
    }
  });
  /***/
},
/* 74 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    copyWithin: __webpack_require__(75)
  });

  __webpack_require__(30)('copyWithin');
  /***/

},
/* 75 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)

  var _ref9, _copyWithin;

  var toObject = __webpack_require__(12);

  var toAbsoluteIndex = __webpack_require__(24);

  var toLength = __webpack_require__(18);

  setKey(module, "exports", (_ref9 = [], _copyWithin = _ref9._ES5ProxyType ? _ref9.get("copyWithin") : _ref9.copyWithin) || function copyWithin(target
  /* = 0 */
  , start
  /* = 0, end = @length */
  ) {
    var O = toObject(this);
    var len = toLength(O._ES5ProxyType ? O.get("length") : O.length);
    var to = toAbsoluteIndex(target, len);
    var from = toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;

    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }

    while (count-- > 0) {
      if (inKey(O, from)) setKey(O, to, O._ES5ProxyType ? O.get(from) : O[from]);else deleteKey(O, to);
      to += inc;
      from += inc;
    }

    return O;
  });
  /***/

},
/* 76 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    fill: __webpack_require__(77)
  });

  __webpack_require__(30)('fill');
  /***/

},
/* 77 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)

  var toObject = __webpack_require__(12);

  var toAbsoluteIndex = __webpack_require__(24);

  var toLength = __webpack_require__(18);

  setKey(module, "exports", function fill(value
  /* , start = 0, end = @length */
  ) {
    var O = toObject(this);
    var length = toLength(O._ES5ProxyType ? O.get("length") : O.length);
    var aLen = arguments.length;
    var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : toAbsoluteIndex(end, length);

    while (endPos > index) setKey(O, index++, value);

    return O;
  });
  /***/

},
/* 78 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // https://github.com/tc39/Array.prototype.includes

  var $export = __webpack_require__(0);

  var $includes = __webpack_require__(38)(true);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  __webpack_require__(30)('includes');
  /***/

},
/* 79 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-getownpropertydescriptors
  var $export = __webpack_require__(0);

  var ownKeys = __webpack_require__(80);

  var toIObject = __webpack_require__(7);

  var gOPD = __webpack_require__(41);

  var createProperty = __webpack_require__(29);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = toIObject(object);
      var getDesc = gOPD._ES5ProxyType ? gOPD.get("f") : gOPD.f;
      var keys = ownKeys(O);
      var result = {};
      var i = 0;
      var key, desc;

      while ((keys._ES5ProxyType ? keys.get("length") : keys.length) > i) {
        var _i16, _i17;

        desc = getDesc(O, key = (_i16 = i++, _i17 = keys._ES5ProxyType ? keys.get(_i16) : keys[_i16]));
        if (desc !== undefined) createProperty(result, key, desc);
      }

      return result;
    }
  });
  /***/
},
/* 80 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__14, _Reflect;

  // all object keys, includes non-enumerable and symbols
  var gOPN = __webpack_require__(28);

  var gOPS = __webpack_require__(27);

  var anObject = __webpack_require__(11);

  var Reflect = (_webpack_require__14 = __webpack_require__(2), _Reflect = _webpack_require__14._ES5ProxyType ? _webpack_require__14.get("Reflect") : _webpack_require__14.Reflect);

  setKey(module, "exports", Reflect && (Reflect._ES5ProxyType ? Reflect.get("ownKeys") : Reflect.ownKeys) || function ownKeys(it) {
    var keys = callKey1(gOPN, "f", anObject(it));

    var getSymbols = gOPS._ES5ProxyType ? gOPS.get("f") : gOPS.f;
    return getSymbols ? concat(keys, getSymbols(it)) : keys;
  });
  /***/

},
/* 81 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-values-entries
  var $export = __webpack_require__(0);

  var $values = __webpack_require__(43)(false);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    values: function values(it) {
      return $values(it);
    }
  });
  /***/
},
/* 82 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-values-entries
  var $export = __webpack_require__(0);

  var $entries = __webpack_require__(43)(true);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    entries: function entries(it) {
      return $entries(it);
    }
  });
  /***/
}
/******/
]);

/***/ })
/******/ ]);
Object.defineSymbolProperty = Object.defineProperty;
Object.defineProperty = Object.definePropertyNative;
Object.defineSymbolProperties = Object.defineProperties;
Object.defineProperties = Object.definePropertiesNative;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Milo = {}));
})(this, (function (exports) { 'use strict';

  var __callKey0 = Proxy.callKey0;

  var __setKey = Proxy.setKey;

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  var __callKey4 = Proxy.callKey4;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && (obj._ES5ProxyType ? obj.get("constructor") : obj.constructor) === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  var __inKey = Proxy.inKey;

  var __deleteKey = Proxy.deleteKey;

  var __iterableKey = Proxy.iterableKey;

  function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && (right._ES5ProxyType ? right.get(Symbol.hasInstance) : right[Symbol.hasInstance])) {
      return !!__callKey1(right, Symbol.hasInstance, left);
    } else {
      return _instanceof(left, right);
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function getDefaultExportFromNamespaceIfPresent (n) {
  	return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
  }

  function getDefaultExportFromNamespaceIfNotNamed (n) {
  	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
  }

  function getAugmentedNamespace(n) {
  	if (n.__esModule) return n;
  	var a = Object.defineProperty({}, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  function commonjsRequire (target) {
  	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
  }

  var commonjsHelpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    commonjsGlobal: commonjsGlobal,
    getDefaultExportFromCjs: getDefaultExportFromCjs,
    getDefaultExportFromNamespaceIfPresent: getDefaultExportFromNamespaceIfPresent,
    getDefaultExportFromNamespaceIfNotNamed: getDefaultExportFromNamespaceIfNotNamed,
    getAugmentedNamespace: getAugmentedNamespace,
    createCommonjsModule: createCommonjsModule,
    commonjsRequire: commonjsRequire
  });

  var _typeof_1 = __callKey1(commonjsHelpers, "createCommonjsModule", function (module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";

      return (__setKey(module, "exports", _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && (obj._ES5ProxyType ? obj.get("constructor") : obj.constructor) === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "__esModule", true), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "default", module._ES5ProxyType ? module.get("exports") : module.exports)), _typeof(obj);
    }
    __setKey(module, "exports", _typeof), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "__esModule", true), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "default", module._ES5ProxyType ? module.get("exports") : module.exports);
  });

  var regeneratorRuntime$1 = __callKey1(commonjsHelpers, "createCommonjsModule", function (module) {
    var _typeof = _typeof_1._ES5ProxyType ? _typeof_1.get("default") : _typeof_1["default"];
    function _regeneratorRuntime() {

      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
      __setKey(module, "exports", _regeneratorRuntime = function _regeneratorRuntime() {
        return exports;
      }), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "__esModule", true), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "default", module._ES5ProxyType ? module.get("exports") : module.exports);
      var exports = {},
        Op = Object.prototype,
        hasOwn = Op._ES5ProxyType ? Op.get("hasOwnProperty") : Op.hasOwnProperty,
        defineProperty = Object.compatDefineProperty || function (obj, key, desc) {
          __setKey(obj, key, desc._ES5ProxyType ? desc.get("value") : desc.value);
        },
        $Symbol = "function" == typeof Symbol ? Symbol : {},
        iteratorSymbol = ($Symbol._ES5ProxyType ? $Symbol.get("iterator") : $Symbol.iterator) || "@@iterator",
        asyncIteratorSymbol = ($Symbol._ES5ProxyType ? $Symbol.get("asyncIterator") : $Symbol.asyncIterator) || "@@asyncIterator",
        toStringTagSymbol = ($Symbol._ES5ProxyType ? $Symbol.get("toStringTag") : $Symbol.toStringTag) || "@@toStringTag";
      function define(obj, key, value) {
        return Object.compatDefineProperty(obj, key, {
          value: value,
          enumerable: !0,
          configurable: !0,
          writable: !0
        }), obj._ES5ProxyType ? obj.get(key) : obj[key];
      }
      try {
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return __setKey(obj, key, value);
        };
      }
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var protoGenerator = outerFn && _instanceof(outerFn._ES5ProxyType ? outerFn.get("prototype") : outerFn.prototype, Generator) ? outerFn : Generator,
          generator = Object.create(protoGenerator._ES5ProxyType ? protoGenerator.get("prototype") : protoGenerator.prototype),
          context = new Context(tryLocsList || []);
        return defineProperty(generator, "_invoke", {
          value: makeInvokeMethod(innerFn, self, context)
        }), generator;
      }
      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: __callKey2(fn, "call", obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }
      __setKey(exports, "wrap", wrap);
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var IteratorPrototype = {};
      define(IteratorPrototype, iteratorSymbol, function () {
        return this;
      });
      var getProto = Object.getPrototypeOf,
        NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      NativeIteratorPrototype && NativeIteratorPrototype !== Op && __callKey2(hasOwn, "call", NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
      var Gp = __setKey(GeneratorFunctionPrototype, "prototype", __setKey(Generator, "prototype", Object.create(IteratorPrototype)));
      function defineIteratorMethods(prototype) {
        __callKey1(["next", "throw", "return"], "forEach", function (method) {
          define(prototype, method, function (arg) {
            return __callKey2(this, "_invoke", method, arg);
          });
        });
      }
      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator._ES5ProxyType ? generator.get(method) : generator[method], generator, arg);
          if ("throw" !== (record._ES5ProxyType ? record.get("type") : record.type)) {
            var result = record._ES5ProxyType ? record.get("arg") : record.arg,
              value = result._ES5ProxyType ? result.get("value") : result.value;
            return value && "object" == _typeof(value) && __callKey2(hasOwn, "call", value, "__await") ? __callKey2(__callKey1(PromiseImpl, "resolve", value._ES5ProxyType ? value.get("__await") : value.__await), "then", function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            }) : __callKey2(__callKey1(PromiseImpl, "resolve", value), "then", function (unwrapped) {
              __setKey(result, "value", unwrapped), resolve(result);
            }, function (error) {
              return invoke("throw", error, resolve, reject);
            });
          }
          reject(record._ES5ProxyType ? record.get("arg") : record.arg);
        }
        var previousPromise;
        defineProperty(this, "_invoke", {
          value: function value(method, arg) {
            function callInvokeWithMethodAndArg() {
              return new PromiseImpl(function (resolve, reject) {
                invoke(method, arg, resolve, reject);
              });
            }
            return previousPromise = previousPromise ? __callKey2(previousPromise, "then", callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
          }
        });
      }
      function makeInvokeMethod(innerFn, self, context) {
        var state = "suspendedStart";
        return function (method, arg) {
          if ("executing" === state) throw new Error("Generator is already running");
          if ("completed" === state) {
            if ("throw" === method) throw arg;
            return doneResult();
          }
          for (__setKey(context, "method", method), __setKey(context, "arg", arg);;) {
            var delegate = context._ES5ProxyType ? context.get("delegate") : context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }
            if ("next" === (context._ES5ProxyType ? context.get("method") : context.method)) __setKey(context, "sent", __setKey(context, "_sent", context._ES5ProxyType ? context.get("arg") : context.arg));else if ("throw" === (context._ES5ProxyType ? context.get("method") : context.method)) {
              if ("suspendedStart" === state) throw state = "completed", context._ES5ProxyType ? context.get("arg") : context.arg;
              __callKey1(context, "dispatchException", context._ES5ProxyType ? context.get("arg") : context.arg);
            } else "return" === (context._ES5ProxyType ? context.get("method") : context.method) && __callKey2(context, "abrupt", "return", context._ES5ProxyType ? context.get("arg") : context.arg);
            state = "executing";
            var record = tryCatch(innerFn, self, context);
            if ("normal" === (record._ES5ProxyType ? record.get("type") : record.type)) {
              if (state = (context._ES5ProxyType ? context.get("done") : context.done) ? "completed" : "suspendedYield", (record._ES5ProxyType ? record.get("arg") : record.arg) === ContinueSentinel) continue;
              return {
                value: record._ES5ProxyType ? record.get("arg") : record.arg,
                done: context._ES5ProxyType ? context.get("done") : context.done
              };
            }
            "throw" === (record._ES5ProxyType ? record.get("type") : record.type) && (state = "completed", __setKey(context, "method", "throw"), __setKey(context, "arg", record._ES5ProxyType ? record.get("arg") : record.arg));
          }
        };
      }
      function maybeInvokeDelegate(delegate, context) {
        var _iterator, _iterator2;
        var methodName = context._ES5ProxyType ? context.get("method") : context.method,
          method = (_iterator = delegate._ES5ProxyType ? delegate.get("iterator") : delegate.iterator, _iterator._ES5ProxyType ? _iterator.get(methodName) : _iterator[methodName]);
        if (undefined === method) return __setKey(context, "delegate", null), "throw" === methodName && (_iterator2 = delegate._ES5ProxyType ? delegate.get("iterator") : delegate.iterator, _iterator2._ES5ProxyType ? _iterator2.get("return") : _iterator2["return"]) && (__setKey(context, "method", "return"), __setKey(context, "arg", undefined), maybeInvokeDelegate(delegate, context), "throw" === (context._ES5ProxyType ? context.get("method") : context.method)) || "return" !== methodName && (__setKey(context, "method", "throw"), __setKey(context, "arg", new TypeError("The iterator does not provide a '" + methodName + "' method"))), ContinueSentinel;
        var record = tryCatch(method, delegate._ES5ProxyType ? delegate.get("iterator") : delegate.iterator, context._ES5ProxyType ? context.get("arg") : context.arg);
        if ("throw" === (record._ES5ProxyType ? record.get("type") : record.type)) return __setKey(context, "method", "throw"), __setKey(context, "arg", record._ES5ProxyType ? record.get("arg") : record.arg), __setKey(context, "delegate", null), ContinueSentinel;
        var info = record._ES5ProxyType ? record.get("arg") : record.arg;
        return info ? (info._ES5ProxyType ? info.get("done") : info.done) ? (__setKey(context, delegate._ES5ProxyType ? delegate.get("resultName") : delegate.resultName, info._ES5ProxyType ? info.get("value") : info.value), __setKey(context, "next", delegate._ES5ProxyType ? delegate.get("nextLoc") : delegate.nextLoc), "return" !== (context._ES5ProxyType ? context.get("method") : context.method) && (__setKey(context, "method", "next"), __setKey(context, "arg", undefined)), __setKey(context, "delegate", null), ContinueSentinel) : info : (__setKey(context, "method", "throw"), __setKey(context, "arg", new TypeError("iterator result is not an object")), __setKey(context, "delegate", null), ContinueSentinel);
      }
      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs._ES5ProxyType ? locs.get(0) : locs[0]
        };
        __inKey(locs, 1) && __setKey(entry, "catchLoc", locs._ES5ProxyType ? locs.get(1) : locs[1]), __inKey(locs, 2) && (__setKey(entry, "finallyLoc", locs._ES5ProxyType ? locs.get(2) : locs[2]), __setKey(entry, "afterLoc", locs._ES5ProxyType ? locs.get(3) : locs[3])), (this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries).push(entry);
      }
      function resetTryEntry(entry) {
        var record = (entry._ES5ProxyType ? entry.get("completion") : entry.completion) || {};
        __setKey(record, "type", "normal"), __deleteKey(record, "arg"), __setKey(entry, "completion", record);
      }
      function Context(tryLocsList) {
        __setKey(this, "tryEntries", [{
          tryLoc: "root"
        }]), __callKey2(tryLocsList, "forEach", pushTryEntry, this), __callKey1(this, "reset", !0);
      }
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable._ES5ProxyType ? iterable.get(iteratorSymbol) : iterable[iteratorSymbol];
          if (iteratorMethod) return __callKey1(iteratorMethod, "call", iterable);
          if ("function" == typeof (iterable._ES5ProxyType ? iterable.get("next") : iterable.next)) return iterable;
          if (!isNaN(iterable._ES5ProxyType ? iterable.get("length") : iterable.length)) {
            var i = -1,
              next = function next() {
                for (; ++i < (iterable._ES5ProxyType ? iterable.get("length") : iterable.length);) {
                  if (__callKey2(hasOwn, "call", iterable, i)) return __setKey(next, "value", iterable._ES5ProxyType ? iterable.get(i) : iterable[i]), __setKey(next, "done", !1), next;
                }
                return __setKey(next, "value", undefined), __setKey(next, "done", !0), next;
              };
            return __setKey(next, "next", next);
          }
        }
        return {
          next: doneResult
        };
      }
      function doneResult() {
        return {
          value: undefined,
          done: !0
        };
      }
      return __setKey(GeneratorFunction, "prototype", GeneratorFunctionPrototype), defineProperty(Gp, "constructor", {
        value: GeneratorFunctionPrototype,
        configurable: !0
      }), defineProperty(GeneratorFunctionPrototype, "constructor", {
        value: GeneratorFunction,
        configurable: !0
      }), __setKey(GeneratorFunction, "displayName", define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction")), __setKey(exports, "isGeneratorFunction", function (genFun) {
        var ctor = "function" == typeof genFun && (genFun._ES5ProxyType ? genFun.get("constructor") : genFun.constructor);
        return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === ((ctor._ES5ProxyType ? ctor.get("displayName") : ctor.displayName) || (ctor._ES5ProxyType ? ctor.get("name") : ctor.name)));
      }), __setKey(exports, "mark", function (genFun) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (__setKey(genFun, "__proto__", GeneratorFunctionPrototype), define(genFun, toStringTagSymbol, "GeneratorFunction")), __setKey(genFun, "prototype", Object.create(Gp)), genFun;
      }), __setKey(exports, "awrap", function (arg) {
        return {
          __await: arg
        };
      }), defineIteratorMethods(AsyncIterator._ES5ProxyType ? AsyncIterator.get("prototype") : AsyncIterator.prototype), define(AsyncIterator._ES5ProxyType ? AsyncIterator.get("prototype") : AsyncIterator.prototype, asyncIteratorSymbol, function () {
        return this;
      }), __setKey(exports, "AsyncIterator", AsyncIterator), __setKey(exports, "async", function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        void 0 === PromiseImpl && (PromiseImpl = Promise);
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return __callKey1(exports, "isGeneratorFunction", outerFn) ? iter : __callKey1(__callKey0(iter, "next"), "then", function (result) {
          return (result._ES5ProxyType ? result.get("done") : result.done) ? result._ES5ProxyType ? result.get("value") : result.value : __callKey0(iter, "next");
        });
      }), defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
        return this;
      }), define(Gp, "toString", function () {
        return "[object Generator]";
      }), __setKey(exports, "keys", function (val) {
        var object = Object(val),
          keys = [];
        for (var key in __iterableKey(object)) {
          keys.push(key);
        }
        return __callKey0(keys, "reverse"), function next() {
          for (; keys._ES5ProxyType ? keys.get("length") : keys.length;) {
            var key = keys.pop();
            if (__inKey(object, key)) return __setKey(next, "value", key), __setKey(next, "done", !1), next;
          }
          return __setKey(next, "done", !0), next;
        };
      }), __setKey(exports, "values", values), __setKey(Context, "prototype", {
        constructor: Context,
        reset: function reset(skipTempReset) {
          if (__setKey(this, "prev", 0), __setKey(this, "next", 0), __setKey(this, "sent", __setKey(this, "_sent", undefined)), __setKey(this, "done", !1), __setKey(this, "delegate", null), __setKey(this, "method", "next"), __setKey(this, "arg", undefined), __callKey1(this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, "forEach", resetTryEntry), !skipTempReset) for (var name in __iterableKey(this)) {
            "t" === __callKey1(name, "charAt", 0) && __callKey2(hasOwn, "call", this, name) && !isNaN(+__callKey1(name, "slice", 1)) && __setKey(this, name, undefined);
          }
        },
        stop: function stop() {
          var _tryEntries, _;
          __setKey(this, "done", !0);
          var rootRecord = (_tryEntries = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _ = _tryEntries._ES5ProxyType ? _tryEntries.get(0) : _tryEntries[0], _._ES5ProxyType ? _.get("completion") : _.completion);
          if ("throw" === (rootRecord._ES5ProxyType ? rootRecord.get("type") : rootRecord.type)) throw rootRecord._ES5ProxyType ? rootRecord.get("arg") : rootRecord.arg;
          return this._ES5ProxyType ? this.get("rval") : this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this._ES5ProxyType ? this.get("done") : this.done) throw exception;
          var context = this;
          function handle(loc, caught) {
            return __setKey(record, "type", "throw"), __setKey(record, "arg", exception), __setKey(context, "next", loc), caught && (__setKey(context, "method", "next"), __setKey(context, "arg", undefined)), !!caught;
          }
          for (var i = (_tryEntries2 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries2._ES5ProxyType ? _tryEntries2.get("length") : _tryEntries2.length) - 1; i >= 0; --i) {
            var _tryEntries2, _tryEntries3;
            var entry = (_tryEntries3 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries3._ES5ProxyType ? _tryEntries3.get(i) : _tryEntries3[i]),
              record = entry._ES5ProxyType ? entry.get("completion") : entry.completion;
            if ("root" === (entry._ES5ProxyType ? entry.get("tryLoc") : entry.tryLoc)) return handle("end");
            if ((entry._ES5ProxyType ? entry.get("tryLoc") : entry.tryLoc) <= (this._ES5ProxyType ? this.get("prev") : this.prev)) {
              var hasCatch = __callKey2(hasOwn, "call", entry, "catchLoc"),
                hasFinally = __callKey2(hasOwn, "call", entry, "finallyLoc");
              if (hasCatch && hasFinally) {
                if ((this._ES5ProxyType ? this.get("prev") : this.prev) < (entry._ES5ProxyType ? entry.get("catchLoc") : entry.catchLoc)) return handle(entry._ES5ProxyType ? entry.get("catchLoc") : entry.catchLoc, !0);
                if ((this._ES5ProxyType ? this.get("prev") : this.prev) < (entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc)) return handle(entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc);
              } else if (hasCatch) {
                if ((this._ES5ProxyType ? this.get("prev") : this.prev) < (entry._ES5ProxyType ? entry.get("catchLoc") : entry.catchLoc)) return handle(entry._ES5ProxyType ? entry.get("catchLoc") : entry.catchLoc, !0);
              } else {
                if (!hasFinally) throw new Error("try statement without catch or finally");
                if ((this._ES5ProxyType ? this.get("prev") : this.prev) < (entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc)) return handle(entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc);
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = (_tryEntries4 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries4._ES5ProxyType ? _tryEntries4.get("length") : _tryEntries4.length) - 1; i >= 0; --i) {
            var _tryEntries4, _tryEntries5;
            var entry = (_tryEntries5 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries5._ES5ProxyType ? _tryEntries5.get(i) : _tryEntries5[i]);
            if ((entry._ES5ProxyType ? entry.get("tryLoc") : entry.tryLoc) <= (this._ES5ProxyType ? this.get("prev") : this.prev) && __callKey2(hasOwn, "call", entry, "finallyLoc") && (this._ES5ProxyType ? this.get("prev") : this.prev) < (entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc)) {
              var finallyEntry = entry;
              break;
            }
          }
          finallyEntry && ("break" === type || "continue" === type) && (finallyEntry._ES5ProxyType ? finallyEntry.get("tryLoc") : finallyEntry.tryLoc) <= arg && arg <= (finallyEntry._ES5ProxyType ? finallyEntry.get("finallyLoc") : finallyEntry.finallyLoc) && (finallyEntry = null);
          var record = finallyEntry ? finallyEntry._ES5ProxyType ? finallyEntry.get("completion") : finallyEntry.completion : {};
          return __setKey(record, "type", type), __setKey(record, "arg", arg), finallyEntry ? (__setKey(this, "method", "next"), __setKey(this, "next", finallyEntry._ES5ProxyType ? finallyEntry.get("finallyLoc") : finallyEntry.finallyLoc), ContinueSentinel) : __callKey1(this, "complete", record);
        },
        complete: function complete(record, afterLoc) {
          if ("throw" === (record._ES5ProxyType ? record.get("type") : record.type)) throw record._ES5ProxyType ? record.get("arg") : record.arg;
          return "break" === (record._ES5ProxyType ? record.get("type") : record.type) || "continue" === (record._ES5ProxyType ? record.get("type") : record.type) ? __setKey(this, "next", record._ES5ProxyType ? record.get("arg") : record.arg) : "return" === (record._ES5ProxyType ? record.get("type") : record.type) ? (__setKey(this, "rval", __setKey(this, "arg", record._ES5ProxyType ? record.get("arg") : record.arg)), __setKey(this, "method", "return"), __setKey(this, "next", "end")) : "normal" === (record._ES5ProxyType ? record.get("type") : record.type) && afterLoc && __setKey(this, "next", afterLoc), ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = (_tryEntries6 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries6._ES5ProxyType ? _tryEntries6.get("length") : _tryEntries6.length) - 1; i >= 0; --i) {
            var _tryEntries6, _tryEntries7;
            var entry = (_tryEntries7 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries7._ES5ProxyType ? _tryEntries7.get(i) : _tryEntries7[i]);
            if ((entry._ES5ProxyType ? entry.get("finallyLoc") : entry.finallyLoc) === finallyLoc) return __callKey2(this, "complete", entry._ES5ProxyType ? entry.get("completion") : entry.completion, entry._ES5ProxyType ? entry.get("afterLoc") : entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = (_tryEntries8 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries8._ES5ProxyType ? _tryEntries8.get("length") : _tryEntries8.length) - 1; i >= 0; --i) {
            var _tryEntries8, _tryEntries9;
            var entry = (_tryEntries9 = this._ES5ProxyType ? this.get("tryEntries") : this.tryEntries, _tryEntries9._ES5ProxyType ? _tryEntries9.get(i) : _tryEntries9[i]);
            if ((entry._ES5ProxyType ? entry.get("tryLoc") : entry.tryLoc) === tryLoc) {
              var record = entry._ES5ProxyType ? entry.get("completion") : entry.completion;
              if ("throw" === (record._ES5ProxyType ? record.get("type") : record.type)) {
                var thrown = record._ES5ProxyType ? record.get("arg") : record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }
          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          return __setKey(this, "delegate", {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          }), "next" === (this._ES5ProxyType ? this.get("method") : this.method) && __setKey(this, "arg", undefined), ContinueSentinel;
        }
      }), exports;
    }
    __setKey(module, "exports", _regeneratorRuntime), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "__esModule", true), __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "default", module._ES5ProxyType ? module.get("exports") : module.exports);
  });

  // TODO(Babel 8): Remove this file.

  var runtime = regeneratorRuntime$1();
  var regenerator = runtime;

  // Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    if ((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) === "object") {
      __setKey(globalThis, "regeneratorRuntime", runtime);
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = __callKey1(gen, key, arg);
      var value = info._ES5ProxyType ? info.get("value") : info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info._ES5ProxyType ? info.get("done") : info.done) {
      resolve(value);
    } else {
      __callKey2(Promise.resolve(value), "then", _next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = __callKey2(fn, "apply", self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _toPrimitive(input, hint) {
    if (_typeof(input) !== "object" || input === null) return input;
    var prim = input._ES5ProxyType ? input.get(Symbol.toPrimitive) : input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = __callKey2(prim, "call", input, hint || "default");
      if (_typeof(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }

  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof(key) === "symbol" ? key : String(key);
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < (props._ES5ProxyType ? props.get("length") : props.length); i++) {
      var descriptor = props._ES5ProxyType ? props.get(i) : props[i];
      __setKey(descriptor, "enumerable", (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) || false);
      __setKey(descriptor, "configurable", true);
      if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
      Object.compatDefineProperty(target, _toPropertyKey(descriptor._ES5ProxyType ? descriptor.get("key") : descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor._ES5ProxyType ? Constructor.get("prototype") : Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.compatDefineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var __concat = Proxy.concat;

  function _arrayWithHoles(arr) {
    if (Array.compatIsArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && (arr._ES5ProxyType ? arr.get(Symbol.iterator) : arr[Symbol.iterator]) || (arr._ES5ProxyType ? arr.get("@@iterator") : arr["@@iterator"]);
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        var _i2, _next;
        if (_x = (_i2 = _i = __callKey1(_i, "call", arr), _next = _i2._ES5ProxyType ? _i2.get("next") : _i2.next), 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s2 = _s = __callKey1(_x, "call", _i), _done = _s2._ES5ProxyType ? _s2.get("done") : _s2.done)) && (_arr.push(_s._ES5ProxyType ? _s.get("value") : _s.value), (_arr._ES5ProxyType ? _arr.get("length") : _arr.length) !== i); _n = !0) {
          var _s2, _done;
          ;
        }
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != (_i._ES5ProxyType ? _i.get("return") : _i["return"]) && (_r = __callKey0(_i, "return"), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > (arr._ES5ProxyType ? arr.get("length") : arr.length)) len = arr._ES5ProxyType ? arr.get("length") : arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      __setKey(arr2, i, arr._ES5ProxyType ? arr.get(i) : arr[i]);
    }
    return arr2;
  }

  function _unsupportedIterableToArray(o, minLen) {
    var _constructor;
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = __callKey2(__callKey1(Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString, "call", o), "slice", 8, -1);
    if (n === "Object" && (o._ES5ProxyType ? o.get("constructor") : o.constructor)) n = (_constructor = o._ES5ProxyType ? o.get("constructor") : o.constructor, _constructor._ES5ProxyType ? _constructor.get("name") : _constructor.name);
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || __callKey1(/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/, "test", n)) return _arrayLikeToArray(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function bind(fn, thisArg) {
    return function wrap() {
      return __callKey2(fn, "apply", thisArg, arguments);
    };
  }

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString;
  var getPrototypeOf = Object.getPrototypeOf;
  var kindOf = function (cache) {
    return function (thing) {
      var str = __callKey1(toString, "call", thing);
      return (cache._ES5ProxyType ? cache.get(str) : cache[str]) || __setKey(cache, str, __callKey0(__callKey2(str, "slice", 8, -1), "toLowerCase"));
    };
  }(Object.create(null));
  var kindOfTest = function kindOfTest(type) {
    type = __callKey0(type, "toLowerCase");
    return function (thing) {
      return kindOf(thing) === type;
    };
  };
  var typeOfTest = function typeOfTest(type) {
    return function (thing) {
      return _typeof(thing) === type;
    };
  };

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   *
   * @returns {boolean} True if value is an Array, otherwise false
   */
  var isArray$4 = Array.compatIsArray;

  /**
   * Determine if a value is undefined
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  var isUndefined = typeOfTest('undefined');

  /**
   * Determine if a value is a Buffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer$1(val) {
    var _constructor;
    return val !== null && !isUndefined(val) && (val._ES5ProxyType ? val.get("constructor") : val.constructor) !== null && !isUndefined(val._ES5ProxyType ? val.get("constructor") : val.constructor) && isFunction((_constructor = val._ES5ProxyType ? val.get("constructor") : val.constructor, _constructor._ES5ProxyType ? _constructor.get("isBuffer") : _constructor.isBuffer)) && __callKey1(val._ES5ProxyType ? val.get("constructor") : val.constructor, "isBuffer", val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  var isArrayBuffer = kindOfTest('ArrayBuffer');

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if (typeof ArrayBuffer !== 'undefined' && (ArrayBuffer._ES5ProxyType ? ArrayBuffer.get("isView") : ArrayBuffer.isView)) {
      result = __callKey1(ArrayBuffer, "isView", val);
    } else {
      result = val && (val._ES5ProxyType ? val.get("buffer") : val.buffer) && isArrayBuffer(val._ES5ProxyType ? val.get("buffer") : val.buffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a String, otherwise false
   */
  var isString$1 = typeOfTest('string');

  /**
   * Determine if a value is a Function
   *
   * @param {*} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  var isFunction = typeOfTest('function');

  /**
   * Determine if a value is a Number
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Number, otherwise false
   */
  var isNumber$1 = typeOfTest('number');

  /**
   * Determine if a value is an Object
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an Object, otherwise false
   */
  var isObject = function isObject(thing) {
    return thing !== null && _typeof(thing) === 'object';
  };

  /**
   * Determine if a value is a Boolean
   *
   * @param {*} thing The value to test
   * @returns {boolean} True if value is a Boolean, otherwise false
   */
  var isBoolean$1 = function isBoolean(thing) {
    return thing === true || thing === false;
  };

  /**
   * Determine if a value is a plain Object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a plain Object, otherwise false
   */
  var isPlainObject = function isPlainObject(val) {
    if (kindOf(val) !== 'object') {
      return false;
    }
    var prototype = getPrototypeOf(val);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !__inKey(val, Symbol.toStringTag) && !__inKey(val, Symbol.iterator);
  };

  /**
   * Determine if a value is a Date
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Date, otherwise false
   */
  var isDate$1 = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  var isFile = kindOfTest('File');

  /**
   * Determine if a value is a Blob
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  var isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  var isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Stream
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  var isStream = function isStream(val) {
    return isObject(val) && isFunction(val._ES5ProxyType ? val.get("pipe") : val.pipe);
  };

  /**
   * Determine if a value is a FormData
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  var isFormData = function isFormData(thing) {
    var kind;
    return thing && (typeof FormData === 'function' && _instanceof(thing, FormData) || isFunction(thing._ES5ProxyType ? thing.get("append") : thing.append) && ((kind = kindOf(thing)) === 'formdata' ||
    // detect form-data instance
    kind === 'object' && isFunction(thing._ES5ProxyType ? thing.get("toString") : thing.toString) && __callKey0(thing, "toString") === '[object FormData]'));
  };

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  var isURLSearchParams = kindOfTest('URLSearchParams');

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   *
   * @returns {String} The String freed of excess whitespace
   */
  var trim = function trim(str) {
    return (str._ES5ProxyType ? str.get("trim") : str.trim) ? __callKey0(str, "trim") : __callKey2(str, "replace", /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   *
   * @param {Boolean} [allOwnKeys = false]
   * @returns {any}
   */
  function forEach(obj, fn) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$allOwnKeys = _ref._ES5ProxyType ? _ref.get("allOwnKeys") : _ref.allOwnKeys,
      allOwnKeys = _ref$allOwnKeys === void 0 ? false : _ref$allOwnKeys;
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }
    var i;
    var l;

    // Force an array if not already something iterable
    if (_typeof(obj) !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }
    if (isArray$4(obj)) {
      // Iterate over array values
      for (i = 0, l = obj._ES5ProxyType ? obj.get("length") : obj.length; i < l; i++) {
        __callKey4(fn, "call", null, obj._ES5ProxyType ? obj.get(i) : obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      var keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.compatKeys(obj);
      var len = keys._ES5ProxyType ? keys.get("length") : keys.length;
      var key;
      for (i = 0; i < len; i++) {
        key = keys._ES5ProxyType ? keys.get(i) : keys[i];
        __callKey4(fn, "call", null, obj._ES5ProxyType ? obj.get(key) : obj[key], key, obj);
      }
    }
  }
  function findKey(obj, key) {
    key = __callKey0(key, "toLowerCase");
    var keys = Object.compatKeys(obj);
    var i = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var _key;
    while (i-- > 0) {
      _key = keys._ES5ProxyType ? keys.get(i) : keys[i];
      if (key === __callKey0(_key, "toLowerCase")) {
        return _key;
      }
    }
    return null;
  }
  var _global = function () {
    /*eslint no-undef:0*/
    if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== 'undefined' ? window : global;
  }();
  var isContextDefined = function isContextDefined(context) {
    return !isUndefined(context) && context !== _global;
  };

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   *
   * @returns {Object} Result of all merge properties
   */
  function merge$1( /* obj1, obj2, obj3, ... */
  ) {
    var _ref2 = isContextDefined(this) && this || {},
      caseless = _ref2._ES5ProxyType ? _ref2.get("caseless") : _ref2.caseless;
    var result = {};
    var assignValue = function assignValue(val, key) {
      var targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result._ES5ProxyType ? result.get(targetKey) : result[targetKey]) && isPlainObject(val)) {
        __setKey(result, targetKey, merge$1(result._ES5ProxyType ? result.get(targetKey) : result[targetKey], val));
      } else if (isPlainObject(val)) {
        __setKey(result, targetKey, merge$1({}, val));
      } else if (isArray$4(val)) {
        __setKey(result, targetKey, __callKey0(val, "slice"));
      } else {
        __setKey(result, targetKey, val);
      }
    };
    for (var i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   *
   * @param {Boolean} [allOwnKeys]
   * @returns {Object} The resulting value of object a
   */
  var extend = function extend(a, b, thisArg) {
    var _ref3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      allOwnKeys = _ref3._ES5ProxyType ? _ref3.get("allOwnKeys") : _ref3.allOwnKeys;
    forEach(b, function (val, key) {
      if (thisArg && isFunction(val)) {
        __setKey(a, key, bind(val, thisArg));
      } else {
        __setKey(a, key, val);
      }
    }, {
      allOwnKeys: allOwnKeys
    });
    return a;
  };

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   *
   * @returns {string} content value without BOM
   */
  var stripBOM = function stripBOM(content) {
    if (__callKey1(content, "charCodeAt", 0) === 0xFEFF) {
      content = __callKey1(content, "slice", 1);
    }
    return content;
  };

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   *
   * @returns {void}
   */
  var inherits = function inherits(constructor, superConstructor, props, descriptors) {
    __setKey(constructor, "prototype", Object.create(superConstructor._ES5ProxyType ? superConstructor.get("prototype") : superConstructor.prototype, descriptors));
    __setKey(constructor._ES5ProxyType ? constructor.get("prototype") : constructor.prototype, "constructor", constructor);
    Object.compatDefineProperty(constructor, 'super', {
      value: superConstructor._ES5ProxyType ? superConstructor.get("prototype") : superConstructor.prototype
    });
    props && Object.compatAssign(constructor._ES5ProxyType ? constructor.get("prototype") : constructor.prototype, props);
  };

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   *
   * @returns {Object}
   */
  var toFlatObject = function toFlatObject(sourceObj, destObj, filter, propFilter) {
    var props;
    var i;
    var prop;
    var merged = {};
    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;
    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props._ES5ProxyType ? props.get("length") : props.length;
      while (i-- > 0) {
        prop = props._ES5ProxyType ? props.get(i) : props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !(merged._ES5ProxyType ? merged.get(prop) : merged[prop])) {
          __setKey(destObj, prop, sourceObj._ES5ProxyType ? sourceObj.get(prop) : sourceObj[prop]);
          __setKey(merged, prop, true);
        }
      }
      sourceObj = filter !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
    return destObj;
  };

  /**
   * Determines whether a string ends with the characters of a specified string
   *
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   *
   * @returns {boolean}
   */
  var endsWith = function endsWith(str, searchString, position) {
    str = String(str);
    if (position === undefined || position > (str._ES5ProxyType ? str.get("length") : str.length)) {
      position = str._ES5ProxyType ? str.get("length") : str.length;
    }
    position -= searchString._ES5ProxyType ? searchString.get("length") : searchString.length;
    var lastIndex = __callKey2(str, "indexOf", searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };

  /**
   * Returns new array from array like object or null if failed
   *
   * @param {*} [thing]
   *
   * @returns {?Array}
   */
  var toArray = function toArray(thing) {
    if (!thing) return null;
    if (isArray$4(thing)) return thing;
    var i = thing._ES5ProxyType ? thing.get("length") : thing.length;
    if (!isNumber$1(i)) return null;
    var arr = new Array(i);
    while (i-- > 0) {
      __setKey(arr, i, thing._ES5ProxyType ? thing.get(i) : thing[i]);
    }
    return arr;
  };

  /**
   * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
   * thing passed in is an instance of Uint8Array
   *
   * @param {TypedArray}
   *
   * @returns {Array}
   */
  // eslint-disable-next-line func-names
  var isTypedArray = function (TypedArray) {
    // eslint-disable-next-line func-names
    return function (thing) {
      return TypedArray && _instanceof(thing, TypedArray);
    };
  }(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

  /**
   * For each entry in the object, call the function with the key and value.
   *
   * @param {Object<any, any>} obj - The object to iterate over.
   * @param {Function} fn - The function to call for each entry.
   *
   * @returns {void}
   */
  var forEachEntry = function forEachEntry(obj, fn) {
    var generator = obj && (obj._ES5ProxyType ? obj.get(Symbol.iterator) : obj[Symbol.iterator]);
    var iterator = __callKey1(generator, "call", obj);
    var result;
    while ((result = __callKey0(iterator, "next")) && !(result._ES5ProxyType ? result.get("done") : result.done)) {
      var pair = result._ES5ProxyType ? result.get("value") : result.value;
      __callKey3(fn, "call", obj, pair._ES5ProxyType ? pair.get(0) : pair[0], pair._ES5ProxyType ? pair.get(1) : pair[1]);
    }
  };

  /**
   * It takes a regular expression and a string, and returns an array of all the matches
   *
   * @param {string} regExp - The regular expression to match against.
   * @param {string} str - The string to search.
   *
   * @returns {Array<boolean>}
   */
  var matchAll = function matchAll(regExp, str) {
    var matches;
    var arr = [];
    while ((matches = __callKey1(regExp, "exec", str)) !== null) {
      arr.push(matches);
    }
    return arr;
  };

  /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
  var isHTMLForm = kindOfTest('HTMLFormElement');
  var toCamelCase = function toCamelCase(str) {
    return __callKey2(__callKey0(str, "toLowerCase"), "replace", /[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
      return __callKey0(p1, "toUpperCase") + p2;
    });
  };

  /* Creating a function that will check if an object has a property. */
  var hasOwnProperty = function (_ref4) {
    var hasOwnProperty = _ref4._ES5ProxyType ? _ref4.get("hasOwnProperty") : _ref4.hasOwnProperty;
    return function (obj, prop) {
      return __callKey2(hasOwnProperty, "call", obj, prop);
    };
  }(Object.prototype);

  /**
   * Determine if a value is a RegExp object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a RegExp object, otherwise false
   */
  var isRegExp$2 = kindOfTest('RegExp');
  var reduceDescriptors = function reduceDescriptors(obj, reducer) {
    var descriptors = Object.getOwnPropertyDescriptors(obj);
    var reducedDescriptors = {};
    forEach(descriptors, function (descriptor, name) {
      if (reducer(descriptor, name, obj) !== false) {
        __setKey(reducedDescriptors, name, descriptor);
      }
    });
    Object.defineProperties(obj, reducedDescriptors);
  };

  /**
   * Makes all methods read-only
   * @param {Object} obj
   */

  var freezeMethods = function freezeMethods(obj) {
    reduceDescriptors(obj, function (descriptor, name) {
      // skip restricted props in strict mode
      if (isFunction(obj) && __callKey1(['arguments', 'caller', 'callee'], "indexOf", name) !== -1) {
        return false;
      }
      var value = obj._ES5ProxyType ? obj.get(name) : obj[name];
      if (!isFunction(value)) return;
      __setKey(descriptor, "enumerable", false);
      if (__inKey(descriptor, 'writable')) {
        __setKey(descriptor, "writable", false);
        return;
      }
      if (!(descriptor._ES5ProxyType ? descriptor.get("set") : descriptor.set)) {
        __setKey(descriptor, "set", function () {
          throw Error('Can not rewrite read-only method \'' + name + '\'');
        });
      }
    });
  };
  var toObjectSet = function toObjectSet(arrayOrString, delimiter) {
    var obj = {};
    var define = function define(arr) {
      __callKey1(arr, "forEach", function (value) {
        __setKey(obj, value, true);
      });
    };
    isArray$4(arrayOrString) ? define(arrayOrString) : define(__callKey1(String(arrayOrString), "split", delimiter));
    return obj;
  };
  var noop = function noop() {};
  var toFiniteNumber = function toFiniteNumber(value, defaultValue) {
    value = +value;
    return Number.isFinite(value) ? value : defaultValue;
  };
  var ALPHA = 'abcdefghijklmnopqrstuvwxyz';
  var DIGIT = '0123456789';
  var ALPHABET = {
    DIGIT: DIGIT,
    ALPHA: ALPHA,
    ALPHA_DIGIT: ALPHA + __callKey0(ALPHA, "toUpperCase") + DIGIT
  };
  var generateString = function generateString() {
    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
    var alphabet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ALPHABET._ES5ProxyType ? ALPHABET.get("ALPHA_DIGIT") : ALPHABET.ALPHA_DIGIT;
    var str = '';
    var length = alphabet._ES5ProxyType ? alphabet.get("length") : alphabet.length;
    while (size--) {
      var _ref5;
      str += (_ref5 = Math.random() * length | 0, alphabet._ES5ProxyType ? alphabet.get(_ref5) : alphabet[_ref5]);
    }
    return str;
  };

  /**
   * If the thing is a FormData object, return true, otherwise return false.
   *
   * @param {unknown} thing - The thing to check.
   *
   * @returns {boolean}
   */
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing._ES5ProxyType ? thing.get("append") : thing.append) && (thing._ES5ProxyType ? thing.get(Symbol.toStringTag) : thing[Symbol.toStringTag]) === 'FormData' && (thing._ES5ProxyType ? thing.get(Symbol.iterator) : thing[Symbol.iterator]));
  }
  var toJSONObject = function toJSONObject(obj) {
    var stack = new Array(10);
    var visit = function visit(source, i) {
      if (isObject(source)) {
        if (__callKey1(stack, "indexOf", source) >= 0) {
          return;
        }
        if (!__inKey(source, 'toJSON')) {
          __setKey(stack, i, source);
          var target = isArray$4(source) ? [] : {};
          forEach(source, function (value, key) {
            var reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && __setKey(target, key, reducedValue);
          });
          __setKey(stack, i, undefined);
          return target;
        }
      }
      return source;
    };
    return visit(obj, 0);
  };
  var isAsyncFn = kindOfTest('AsyncFunction');
  var isThenable = function isThenable(thing) {
    return thing && (isObject(thing) || isFunction(thing)) && isFunction(thing._ES5ProxyType ? thing.get("then") : thing.then) && isFunction(thing._ES5ProxyType ? thing.get("catch") : thing.catch);
  };
  var utils$1 = {
    isArray: isArray$4,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer$1,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString$1,
    isNumber: isNumber$1,
    isBoolean: isBoolean$1,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate$1,
    isFile: isFile,
    isBlob: isBlob,
    isRegExp: isRegExp$2,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isTypedArray: isTypedArray,
    isFileList: isFileList,
    forEach: forEach,
    merge: merge$1,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM,
    inherits: inherits,
    toFlatObject: toFlatObject,
    kindOf: kindOf,
    kindOfTest: kindOfTest,
    endsWith: endsWith,
    toArray: toArray,
    forEachEntry: forEachEntry,
    matchAll: matchAll,
    isHTMLForm: isHTMLForm,
    hasOwnProperty: hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors: reduceDescriptors,
    freezeMethods: freezeMethods,
    toObjectSet: toObjectSet,
    toCamelCase: toCamelCase,
    noop: noop,
    toFiniteNumber: toFiniteNumber,
    findKey: findKey,
    global: _global,
    isContextDefined: isContextDefined,
    ALPHABET: ALPHABET,
    generateString: generateString,
    isSpecCompliantForm: isSpecCompliantForm,
    toJSONObject: toJSONObject,
    isAsyncFn: isAsyncFn,
    isThenable: isThenable
  };

  var __callKey = Proxy.callKey;

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  function AxiosError(message, code, config, request, response) {
    __callKey1(Error, "call", this);
    if (Error._ES5ProxyType ? Error.get("captureStackTrace") : Error.captureStackTrace) {
      __callKey2(Error, "captureStackTrace", this, this._ES5ProxyType ? this.get("constructor") : this.constructor);
    } else {
      var _Error;
      __setKey(this, "stack", (_Error = new Error(), _Error._ES5ProxyType ? _Error.get("stack") : _Error.stack));
    }
    __setKey(this, "message", message);
    __setKey(this, "name", 'AxiosError');
    code && __setKey(this, "code", code);
    config && __setKey(this, "config", config);
    request && __setKey(this, "request", request);
    response && __setKey(this, "response", response);
  }
  __callKey3(utils$1, "inherits", AxiosError, Error, {
    toJSON: function toJSON() {
      var _response, _response2;
      return {
        // Standard
        message: this._ES5ProxyType ? this.get("message") : this.message,
        name: this._ES5ProxyType ? this.get("name") : this.name,
        // Microsoft
        description: this._ES5ProxyType ? this.get("description") : this.description,
        number: this._ES5ProxyType ? this.get("number") : this.number,
        // Mozilla
        fileName: this._ES5ProxyType ? this.get("fileName") : this.fileName,
        lineNumber: this._ES5ProxyType ? this.get("lineNumber") : this.lineNumber,
        columnNumber: this._ES5ProxyType ? this.get("columnNumber") : this.columnNumber,
        stack: this._ES5ProxyType ? this.get("stack") : this.stack,
        // Axios
        config: __callKey1(utils$1, "toJSONObject", this._ES5ProxyType ? this.get("config") : this.config),
        code: this._ES5ProxyType ? this.get("code") : this.code,
        status: (this._ES5ProxyType ? this.get("response") : this.response) && (_response = this._ES5ProxyType ? this.get("response") : this.response, _response._ES5ProxyType ? _response.get("status") : _response.status) ? (_response2 = this._ES5ProxyType ? this.get("response") : this.response, _response2._ES5ProxyType ? _response2.get("status") : _response2.status) : null
      };
    }
  });
  var prototype$1 = AxiosError._ES5ProxyType ? AxiosError.get("prototype") : AxiosError.prototype;
  var descriptors = {};
  __callKey1(['ERR_BAD_OPTION_VALUE', 'ERR_BAD_OPTION', 'ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK', 'ERR_FR_TOO_MANY_REDIRECTS', 'ERR_DEPRECATED', 'ERR_BAD_RESPONSE', 'ERR_BAD_REQUEST', 'ERR_CANCELED', 'ERR_NOT_SUPPORT', 'ERR_INVALID_URL'
  // eslint-disable-next-line func-names
  ], "forEach", function (code) {
    __setKey(descriptors, code, {
      value: code
    });
  });
  Object.defineProperties(AxiosError, descriptors);
  Object.compatDefineProperty(prototype$1, 'isAxiosError', {
    value: true
  });

  // eslint-disable-next-line func-names
  __setKey(AxiosError, "from", function (error, code, config, request, response, customProps) {
    var axiosError = Object.create(prototype$1);
    __callKey4(utils$1, "toFlatObject", error, axiosError, function filter(obj) {
      return obj !== (Error._ES5ProxyType ? Error.get("prototype") : Error.prototype);
    }, function (prop) {
      return prop !== 'isAxiosError';
    });
    __callKey(AxiosError, "call", axiosError, error._ES5ProxyType ? error.get("message") : error.message, code, config, request, response);
    __setKey(axiosError, "cause", error);
    __setKey(axiosError, "name", error._ES5ProxyType ? error.get("name") : error.name);
    customProps && Object.compatAssign(axiosError, customProps);
    return axiosError;
  });

  // eslint-disable-next-line strict
  var httpAdapter = null;

  /**
   * Determines if the given thing is a array or js object.
   *
   * @param {string} thing - The object or array to be visited.
   *
   * @returns {boolean}
   */
  function isVisitable(thing) {
    return __callKey1(utils$1, "isPlainObject", thing) || __callKey1(utils$1, "isArray", thing);
  }

  /**
   * It removes the brackets from the end of a string
   *
   * @param {string} key - The key of the parameter.
   *
   * @returns {string} the key without the brackets.
   */
  function removeBrackets(key) {
    return __callKey2(utils$1, "endsWith", key, '[]') ? __callKey2(key, "slice", 0, -2) : key;
  }

  /**
   * It takes a path, a key, and a boolean, and returns a string
   *
   * @param {string} path - The path to the current key.
   * @param {string} key - The key of the current object being iterated over.
   * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
   *
   * @returns {string} The path to the current key.
   */
  function renderKey(path, key, dots) {
    if (!path) return key;
    return __callKey1(__callKey1(__concat(path, key), "map", function each(token, i) {
      // eslint-disable-next-line no-param-reassign
      token = removeBrackets(token);
      return !dots && i ? '[' + token + ']' : token;
    }), "join", dots ? '.' : '');
  }

  /**
   * If the array is an array and none of its elements are visitable, then it's a flat array.
   *
   * @param {Array<any>} arr - The array to check
   *
   * @returns {boolean}
   */
  function isFlatArray(arr) {
    return __callKey1(utils$1, "isArray", arr) && !__callKey1(arr, "some", isVisitable);
  }
  var predicates = __callKey4(utils$1, "toFlatObject", utils$1, {}, null, function filter(prop) {
    return __callKey1(/^is[A-Z]/, "test", prop);
  });

  /**
   * Convert a data object to FormData
   *
   * @param {Object} obj
   * @param {?Object} [formData]
   * @param {?Object} [options]
   * @param {Function} [options.visitor]
   * @param {Boolean} [options.metaTokens = true]
   * @param {Boolean} [options.dots = false]
   * @param {?Boolean} [options.indexes = false]
   *
   * @returns {Object}
   **/

  /**
   * It converts an object into a FormData object
   *
   * @param {Object<any, any>} obj - The object to convert to form data.
   * @param {string} formData - The FormData object to append to.
   * @param {Object<string, any>} options
   *
   * @returns
   */
  function toFormData(obj, formData, options) {
    if (!__callKey1(utils$1, "isObject", obj)) {
      throw new TypeError('target must be an object');
    }

    // eslint-disable-next-line no-param-reassign
    formData = formData || new (FormData)();

    // eslint-disable-next-line no-param-reassign
    options = __callKey4(utils$1, "toFlatObject", options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      return !__callKey1(utils$1, "isUndefined", source._ES5ProxyType ? source.get(option) : source[option]);
    });
    var metaTokens = options._ES5ProxyType ? options.get("metaTokens") : options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    var visitor = (options._ES5ProxyType ? options.get("visitor") : options.visitor) || defaultVisitor;
    var dots = options._ES5ProxyType ? options.get("dots") : options.dots;
    var indexes = options._ES5ProxyType ? options.get("indexes") : options.indexes;
    var _Blob = (options._ES5ProxyType ? options.get("Blob") : options.Blob) || typeof Blob !== 'undefined' && Blob;
    var useBlob = _Blob && __callKey1(utils$1, "isSpecCompliantForm", formData);
    if (!__callKey1(utils$1, "isFunction", visitor)) {
      throw new TypeError('visitor must be a function');
    }
    function convertValue(value) {
      if (value === null) return '';
      if (__callKey1(utils$1, "isDate", value)) {
        return __callKey0(value, "toISOString");
      }
      if (!useBlob && __callKey1(utils$1, "isBlob", value)) {
        throw new AxiosError('Blob is not supported. Use a Buffer instead.');
      }
      if (__callKey1(utils$1, "isArrayBuffer", value) || __callKey1(utils$1, "isTypedArray", value)) {
        return useBlob && typeof Blob === 'function' ? new Blob([value]) : __callKey1(Buffer, "from", value);
      }
      return value;
    }

    /**
     * Default visitor.
     *
     * @param {*} value
     * @param {String|Number} key
     * @param {Array<String|Number>} path
     * @this {FormData}
     *
     * @returns {boolean} return true to visit the each prop of the value recursively
     */
    function defaultVisitor(value, key, path) {
      var arr = value;
      if (value && !path && _typeof(value) === 'object') {
        if (__callKey2(utils$1, "endsWith", key, '{}')) {
          // eslint-disable-next-line no-param-reassign
          key = metaTokens ? key : __callKey2(key, "slice", 0, -2);
          // eslint-disable-next-line no-param-reassign
          value = JSON.stringify(value);
        } else if (__callKey1(utils$1, "isArray", value) && isFlatArray(value) || (__callKey1(utils$1, "isFileList", value) || __callKey2(utils$1, "endsWith", key, '[]')) && (arr = __callKey1(utils$1, "toArray", value))) {
          // eslint-disable-next-line no-param-reassign
          key = removeBrackets(key);
          __callKey1(arr, "forEach", function each(el, index) {
            !(__callKey1(utils$1, "isUndefined", el) || el === null) && __callKey2(formData, "append",
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + '[]', convertValue(el));
          });
          return false;
        }
      }
      if (isVisitable(value)) {
        return true;
      }
      __callKey2(formData, "append", renderKey(path, key, dots), convertValue(value));
      return false;
    }
    var stack = [];
    var exposedHelpers = Object.compatAssign(predicates, {
      defaultVisitor: defaultVisitor,
      convertValue: convertValue,
      isVisitable: isVisitable
    });
    function build(value, path) {
      if (__callKey1(utils$1, "isUndefined", value)) return;
      if (__callKey1(stack, "indexOf", value) !== -1) {
        throw Error('Circular reference detected in ' + __callKey1(path, "join", '.'));
      }
      stack.push(value);
      __callKey2(utils$1, "forEach", value, function each(el, key) {
        var result = !(__callKey1(utils$1, "isUndefined", el) || el === null) && __callKey(visitor, "call", formData, el, __callKey1(utils$1, "isString", key) ? __callKey0(key, "trim") : key, path, exposedHelpers);
        if (result === true) {
          build(el, path ? __concat(path, key) : [key]);
        }
      });
      stack.pop();
    }
    if (!__callKey1(utils$1, "isObject", obj)) {
      throw new TypeError('data must be an object');
    }
    build(obj);
    return formData;
  }

  /**
   * It encodes a string by replacing all characters that are not in the unreserved set with
   * their percent-encoded equivalents
   *
   * @param {string} str - The string to encode.
   *
   * @returns {string} The encoded string.
   */
  function encode$2(str) {
    var charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
      '%00': '\x00'
    };
    return __callKey2(encodeURIComponent(str), "replace", /[!'()~]|%20|%00/g, function replacer(match) {
      return charMap._ES5ProxyType ? charMap.get(match) : charMap[match];
    });
  }

  /**
   * It takes a params object and converts it to a FormData object
   *
   * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
   * @param {Object<string, any>} options - The options object passed to the Axios constructor.
   *
   * @returns {void}
   */
  function AxiosURLSearchParams(params, options) {
    __setKey(this, "_pairs", []);
    params && toFormData(params, this, options);
  }
  var prototype = AxiosURLSearchParams._ES5ProxyType ? AxiosURLSearchParams.get("prototype") : AxiosURLSearchParams.prototype;
  __setKey(prototype, "append", function append(name, value) {
    (this._ES5ProxyType ? this.get("_pairs") : this._pairs).push([name, value]);
  });
  __setKey(prototype, "toString", function toString(encoder) {
    var _encode = encoder ? function (value) {
      return __callKey3(encoder, "call", this, value, encode$2);
    } : encode$2;
    return __callKey1(__callKey2(this._ES5ProxyType ? this.get("_pairs") : this._pairs, "map", function each(pair) {
      return _encode(pair._ES5ProxyType ? pair.get(0) : pair[0]) + '=' + _encode(pair._ES5ProxyType ? pair.get(1) : pair[1]);
    }, ''), "join", '&');
  });

  /**
   * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
   * URI encoded counterparts
   *
   * @param {string} val The value to be encoded.
   *
   * @returns {string} The encoded value.
   */
  function encode$1(val) {
    return __callKey2(__callKey2(__callKey2(__callKey2(__callKey2(__callKey2(encodeURIComponent(val), "replace", /%3A/gi, ':'), "replace", /%24/g, '$'), "replace", /%2C/gi, ','), "replace", /%20/g, '+'), "replace", /%5B/gi, '['), "replace", /%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?object} options
   *
   * @returns {string} The formatted url
   */
  function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }
    var _encode = options && (options._ES5ProxyType ? options.get("encode") : options.encode) || encode$1;
    var serializeFn = options && (options._ES5ProxyType ? options.get("serialize") : options.serialize);
    var serializedParams;
    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = __callKey1(utils$1, "isURLSearchParams", params) ? __callKey0(params, "toString") : __callKey1(new AxiosURLSearchParams(params, options), "toString", _encode);
    }
    if (serializedParams) {
      var hashmarkIndex = __callKey1(url, "indexOf", "#");
      if (hashmarkIndex !== -1) {
        url = __callKey2(url, "slice", 0, hashmarkIndex);
      }
      url += (__callKey1(url, "indexOf", '?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
  }

  var InterceptorManager = /*#__PURE__*/function () {
    function InterceptorManager() {
      _classCallCheck(this, InterceptorManager);
      __setKey(this, "handlers", []);
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    _createClass(InterceptorManager, [{
      key: "use",
      value: function use(fulfilled, rejected, options) {
        var _handlers;
        (this._ES5ProxyType ? this.get("handlers") : this.handlers).push({
          fulfilled: fulfilled,
          rejected: rejected,
          synchronous: options ? options._ES5ProxyType ? options.get("synchronous") : options.synchronous : false,
          runWhen: options ? options._ES5ProxyType ? options.get("runWhen") : options.runWhen : null
        });
        return (_handlers = this._ES5ProxyType ? this.get("handlers") : this.handlers, _handlers._ES5ProxyType ? _handlers.get("length") : _handlers.length) - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
    }, {
      key: "eject",
      value: function eject(id) {
        var _handlers2;
        if (_handlers2 = this._ES5ProxyType ? this.get("handlers") : this.handlers, _handlers2._ES5ProxyType ? _handlers2.get(id) : _handlers2[id]) {
          __setKey(this._ES5ProxyType ? this.get("handlers") : this.handlers, id, null);
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
    }, {
      key: "clear",
      value: function clear() {
        if (this._ES5ProxyType ? this.get("handlers") : this.handlers) {
          __setKey(this, "handlers", []);
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
    }, {
      key: "forEach",
      value: function forEach(fn) {
        __callKey2(utils$1, "forEach", this._ES5ProxyType ? this.get("handlers") : this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }]);
    return InterceptorManager;
  }();
  var InterceptorManager$1 = InterceptorManager;

  var transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

  var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

  var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   *
   * @returns {boolean}
   */
  var isStandardBrowserEnv = function () {
    var product;
    if (typeof navigator !== 'undefined' && ((product = navigator._ES5ProxyType ? navigator.get("product") : navigator.product) === 'ReactNative' || product === 'NativeScript' || product === 'NS')) {
      return false;
    }
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }();

  /**
   * Determine if we're running in a standard browser webWorker environment
   *
   * Although the `isStandardBrowserEnv` method indicates that
   * `allows axios to run in a web worker`, the WebWorker will still be
   * filtered out due to its judgment standard
   * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
   * This leads to a problem when axios post `FormData` in webWorker
   */
  var isStandardBrowserWebWorkerEnv = function () {
    return typeof WorkerGlobalScope !== 'undefined' && // eslint-disable-next-line no-undef
    _instanceof(self, WorkerGlobalScope) && typeof (self._ES5ProxyType ? self.get("importScripts") : self.importScripts) === 'function';
  }();
  var platform = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams$1,
      FormData: FormData$1,
      Blob: Blob$1
    },
    isStandardBrowserEnv: isStandardBrowserEnv,
    isStandardBrowserWebWorkerEnv: isStandardBrowserWebWorkerEnv,
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
  };

  function toURLEncodedForm(data, options) {
    var _classes;
    return toFormData(data, new (_classes = platform._ES5ProxyType ? platform.get("classes") : platform.classes, _classes._ES5ProxyType ? _classes.get("URLSearchParams") : _classes.URLSearchParams)(), Object.compatAssign({
      visitor: function visitor(value, key, path, helpers) {
        if ((platform._ES5ProxyType ? platform.get("isNode") : platform.isNode) && __callKey1(utils$1, "isBuffer", value)) {
          __callKey2(this, "append", key, __callKey1(value, "toString", 'base64'));
          return false;
        }
        return __callKey2(helpers._ES5ProxyType ? helpers.get("defaultVisitor") : helpers.defaultVisitor, "apply", this, arguments);
      }
    }, options));
  }

  /**
   * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
   *
   * @param {string} name - The name of the property to get.
   *
   * @returns An array of strings.
   */
  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return __callKey1(__callKey2(utils$1, "matchAll", /\w+|\[(\w*)]/g, name), "map", function (match) {
      return (match._ES5ProxyType ? match.get(0) : match[0]) === '[]' ? '' : (match._ES5ProxyType ? match.get(1) : match[1]) || (match._ES5ProxyType ? match.get(0) : match[0]);
    });
  }

  /**
   * Convert an array to an object.
   *
   * @param {Array<any>} arr - The array to convert to an object.
   *
   * @returns An object with the same keys and values as the array.
   */
  function arrayToObject$1(arr) {
    var obj = {};
    var keys = Object.compatKeys(arr);
    var i;
    var len = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var key;
    for (i = 0; i < len; i++) {
      key = keys._ES5ProxyType ? keys.get(i) : keys[i];
      __setKey(obj, key, arr._ES5ProxyType ? arr.get(key) : arr[key]);
    }
    return obj;
  }

  /**
   * It takes a FormData object and returns a JavaScript object
   *
   * @param {string} formData The FormData object to convert to JSON.
   *
   * @returns {Object<string, any> | null} The converted object.
   */
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      var _index;
      var name = (_index = index++, path._ES5ProxyType ? path.get(_index) : path[_index]);
      var isNumericKey = Number.isFinite(+name);
      var isLast = index >= (path._ES5ProxyType ? path.get("length") : path.length);
      name = !name && __callKey1(utils$1, "isArray", target) ? target._ES5ProxyType ? target.get("length") : target.length : name;
      if (isLast) {
        if (__callKey2(utils$1, "hasOwnProp", target, name)) {
          __setKey(target, name, [target._ES5ProxyType ? target.get(name) : target[name], value]);
        } else {
          __setKey(target, name, value);
        }
        return !isNumericKey;
      }
      if (!(target._ES5ProxyType ? target.get(name) : target[name]) || !__callKey1(utils$1, "isObject", target._ES5ProxyType ? target.get(name) : target[name])) {
        __setKey(target, name, []);
      }
      var result = buildPath(path, value, target._ES5ProxyType ? target.get(name) : target[name], index);
      if (result && __callKey1(utils$1, "isArray", target._ES5ProxyType ? target.get(name) : target[name])) {
        __setKey(target, name, arrayToObject$1(target._ES5ProxyType ? target.get(name) : target[name]));
      }
      return !isNumericKey;
    }
    if (__callKey1(utils$1, "isFormData", formData) && __callKey1(utils$1, "isFunction", formData._ES5ProxyType ? formData.get("entries") : formData.entries)) {
      var obj = {};
      __callKey2(utils$1, "forEachEntry", formData, function (name, value) {
        buildPath(parsePropPath(name), value, obj, 0);
      });
      return obj;
    }
    return null;
  }

  var _classes, _classes2;
  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': undefined
  };

  /**
   * It takes a string, tries to parse it, and if it fails, it returns the stringified version
   * of the input
   *
   * @param {any} rawValue - The value to be stringified.
   * @param {Function} parser - A function that parses a string into a JavaScript object.
   * @param {Function} encoder - A function that takes a value and returns a string.
   *
   * @returns {string} A stringified version of the rawValue.
   */
  function stringifySafely(rawValue, parser, encoder) {
    if (__callKey1(utils$1, "isString", rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return __callKey1(utils$1, "trim", rawValue);
      } catch (e) {
        if ((e._ES5ProxyType ? e.get("name") : e.name) !== 'SyntaxError') {
          throw e;
        }
      }
    }
    return (encoder || JSON.stringify)(rawValue);
  }
  var defaults$2 = {
    transitional: transitionalDefaults,
    adapter: ['xhr', 'http'],
    transformRequest: [function transformRequest(data, headers) {
      var contentType = __callKey0(headers, "getContentType") || '';
      var hasJSONContentType = __callKey1(contentType, "indexOf", 'application/json') > -1;
      var isObjectPayload = __callKey1(utils$1, "isObject", data);
      if (isObjectPayload && __callKey1(utils$1, "isHTMLForm", data)) {
        data = new FormData(data);
      }
      var isFormData = __callKey1(utils$1, "isFormData", data);
      if (isFormData) {
        if (!hasJSONContentType) {
          return data;
        }
        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
      }
      if (__callKey1(utils$1, "isArrayBuffer", data) || __callKey1(utils$1, "isBuffer", data) || __callKey1(utils$1, "isStream", data) || __callKey1(utils$1, "isFile", data) || __callKey1(utils$1, "isBlob", data)) {
        return data;
      }
      if (__callKey1(utils$1, "isArrayBufferView", data)) {
        return data._ES5ProxyType ? data.get("buffer") : data.buffer;
      }
      if (__callKey1(utils$1, "isURLSearchParams", data)) {
        __callKey2(headers, "setContentType", 'application/x-www-form-urlencoded;charset=utf-8', false);
        return __callKey0(data, "toString");
      }
      var isFileList;
      if (isObjectPayload) {
        if (__callKey1(contentType, "indexOf", 'application/x-www-form-urlencoded') > -1) {
          return __callKey0(toURLEncodedForm(data, this._ES5ProxyType ? this.get("formSerializer") : this.formSerializer), "toString");
        }
        if ((isFileList = __callKey1(utils$1, "isFileList", data)) || __callKey1(contentType, "indexOf", 'multipart/form-data') > -1) {
          var _env;
          var _FormData = (this._ES5ProxyType ? this.get("env") : this.env) && (_env = this._ES5ProxyType ? this.get("env") : this.env, _env._ES5ProxyType ? _env.get("FormData") : _env.FormData);
          return toFormData(isFileList ? {
            'files[]': data
          } : data, _FormData && new _FormData(), this._ES5ProxyType ? this.get("formSerializer") : this.formSerializer);
        }
      }
      if (isObjectPayload || hasJSONContentType) {
        __callKey2(headers, "setContentType", 'application/json', false);
        return stringifySafely(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      var transitional = (this._ES5ProxyType ? this.get("transitional") : this.transitional) || (defaults$2._ES5ProxyType ? defaults$2.get("transitional") : defaults$2.transitional);
      var forcedJSONParsing = transitional && (transitional._ES5ProxyType ? transitional.get("forcedJSONParsing") : transitional.forcedJSONParsing);
      var JSONRequested = (this._ES5ProxyType ? this.get("responseType") : this.responseType) === 'json';
      if (data && __callKey1(utils$1, "isString", data) && (forcedJSONParsing && !(this._ES5ProxyType ? this.get("responseType") : this.responseType) || JSONRequested)) {
        var silentJSONParsing = transitional && (transitional._ES5ProxyType ? transitional.get("silentJSONParsing") : transitional.silentJSONParsing);
        var strictJSONParsing = !silentJSONParsing && JSONRequested;
        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if ((e._ES5ProxyType ? e.get("name") : e.name) === 'SyntaxError') {
              throw __callKey(AxiosError, "from", e, AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_RESPONSE") : AxiosError.ERR_BAD_RESPONSE, this, null, this._ES5ProxyType ? this.get("response") : this.response);
            }
            throw e;
          }
        }
      }
      return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: (_classes = platform._ES5ProxyType ? platform.get("classes") : platform.classes, _classes._ES5ProxyType ? _classes.get("FormData") : _classes.FormData),
      Blob: (_classes2 = platform._ES5ProxyType ? platform.get("classes") : platform.classes, _classes2._ES5ProxyType ? _classes2.get("Blob") : _classes2.Blob)
    },
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },
    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    }
  };
  __callKey2(utils$1, "forEach", ['delete', 'get', 'head'], function forEachMethodNoData(method) {
    __setKey(defaults$2._ES5ProxyType ? defaults$2.get("headers") : defaults$2.headers, method, {});
  });
  __callKey2(utils$1, "forEach", ['post', 'put', 'patch'], function forEachMethodWithData(method) {
    __setKey(defaults$2._ES5ProxyType ? defaults$2.get("headers") : defaults$2.headers, method, __callKey1(utils$1, "merge", DEFAULT_CONTENT_TYPE));
  });
  var defaults$3 = defaults$2;

  // RawAxiosHeaders whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = __callKey1(utils$1, "toObjectSet", ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent']);

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} rawHeaders Headers needing to be parsed
   *
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = (function (rawHeaders) {
    var parsed = {};
    var key;
    var val;
    var i;
    rawHeaders && __callKey1(__callKey1(rawHeaders, "split", '\n'), "forEach", function parser(line) {
      i = __callKey1(line, "indexOf", ':');
      key = __callKey0(__callKey0(__callKey2(line, "substring", 0, i), "trim"), "toLowerCase");
      val = __callKey0(__callKey1(line, "substring", i + 1), "trim");
      if (!key || (parsed._ES5ProxyType ? parsed.get(key) : parsed[key]) && (ignoreDuplicateOf._ES5ProxyType ? ignoreDuplicateOf.get(key) : ignoreDuplicateOf[key])) {
        return;
      }
      if (key === 'set-cookie') {
        if (parsed._ES5ProxyType ? parsed.get(key) : parsed[key]) {
          (parsed._ES5ProxyType ? parsed.get(key) : parsed[key]).push(val);
        } else {
          __setKey(parsed, key, [val]);
        }
      } else {
        __setKey(parsed, key, (parsed._ES5ProxyType ? parsed.get(key) : parsed[key]) ? (parsed._ES5ProxyType ? parsed.get(key) : parsed[key]) + ', ' + val : val);
      }
    });
    return parsed;
  });

  var $internals = Symbol('internals');
  function normalizeHeader(header) {
    return header && __callKey0(__callKey0(String(header), "trim"), "toLowerCase");
  }
  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }
    return __callKey1(utils$1, "isArray", value) ? __callKey1(value, "map", normalizeValue) : String(value);
  }
  function parseTokens(str) {
    var tokens = Object.create(null);
    var tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    var match;
    while (match = __callKey1(tokensRE, "exec", str)) {
      __setKey(tokens, match._ES5ProxyType ? match.get(1) : match[1], match._ES5ProxyType ? match.get(2) : match[2]);
    }
    return tokens;
  }
  var isValidHeaderName = function isValidHeaderName(str) {
    return __callKey1(/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/, "test", __callKey0(str, "trim"));
  };
  function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (__callKey1(utils$1, "isFunction", filter)) {
      return __callKey3(filter, "call", this, value, header);
    }
    if (isHeaderNameFilter) {
      value = header;
    }
    if (!__callKey1(utils$1, "isString", value)) return;
    if (__callKey1(utils$1, "isString", filter)) {
      return __callKey1(value, "indexOf", filter) !== -1;
    }
    if (__callKey1(utils$1, "isRegExp", filter)) {
      return __callKey1(filter, "test", value);
    }
  }
  function formatHeader(header) {
    return __callKey2(__callKey0(__callKey0(header, "trim"), "toLowerCase"), "replace", /([a-z\d])(\w*)/g, function (w, char, str) {
      return __callKey0(char, "toUpperCase") + str;
    });
  }
  function buildAccessors(obj, header) {
    var accessorName = __callKey1(utils$1, "toCamelCase", ' ' + header);
    __callKey1(['get', 'set', 'has'], "forEach", function (methodName) {
      Object.compatDefineProperty(obj, methodName + accessorName, {
        value: function value(arg1, arg2, arg3) {
          return __callKey(this._ES5ProxyType ? this.get(methodName) : this[methodName], "call", this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }
  var AxiosHeaders = /*#__PURE__*/function (_Symbol$iterator, _Symbol$toStringTag) {
    function AxiosHeaders(headers) {
      _classCallCheck(this, AxiosHeaders);
      headers && __callKey1(this, "set", headers);
    }
    _createClass(AxiosHeaders, [{
      key: "set",
      value: function set(header, valueOrRewrite, rewrite) {
        var self = this;
        function setHeader(_value, _header, _rewrite) {
          var lHeader = normalizeHeader(_header);
          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }
          var key = __callKey2(utils$1, "findKey", self, lHeader);
          if (!key || (self._ES5ProxyType ? self.get(key) : self[key]) === undefined || _rewrite === true || _rewrite === undefined && (self._ES5ProxyType ? self.get(key) : self[key]) !== false) {
            __setKey(self, key || _header, normalizeValue(_value));
          }
        }
        var setHeaders = function setHeaders(headers, _rewrite) {
          return __callKey2(utils$1, "forEach", headers, function (_value, _header) {
            return setHeader(_value, _header, _rewrite);
          });
        };
        if (__callKey1(utils$1, "isPlainObject", header) || _instanceof(header, this._ES5ProxyType ? this.get("constructor") : this.constructor)) {
          setHeaders(header, valueOrRewrite);
        } else if (__callKey1(utils$1, "isString", header) && (header = __callKey0(header, "trim")) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
      }
    }, {
      key: "get",
      value: function get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
          var key = __callKey2(utils$1, "findKey", this, header);
          if (key) {
            var value = this._ES5ProxyType ? this.get(key) : this[key];
            if (!parser) {
              return value;
            }
            if (parser === true) {
              return parseTokens(value);
            }
            if (__callKey1(utils$1, "isFunction", parser)) {
              return __callKey3(parser, "call", this, value, key);
            }
            if (__callKey1(utils$1, "isRegExp", parser)) {
              return __callKey1(parser, "exec", value);
            }
            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }
    }, {
      key: "has",
      value: function has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
          var key = __callKey2(utils$1, "findKey", this, header);
          return !!(key && (this._ES5ProxyType ? this.get(key) : this[key]) !== undefined && (!matcher || matchHeaderValue(this, this._ES5ProxyType ? this.get(key) : this[key], key, matcher)));
        }
        return false;
      }
    }, {
      key: "delete",
      value: function _delete(header, matcher) {
        var self = this;
        var deleted = false;
        function deleteHeader(_header) {
          _header = normalizeHeader(_header);
          if (_header) {
            var key = __callKey2(utils$1, "findKey", self, _header);
            if (key && (!matcher || matchHeaderValue(self, self._ES5ProxyType ? self.get(key) : self[key], key, matcher))) {
              __deleteKey(self, key);
              deleted = true;
            }
          }
        }
        if (__callKey1(utils$1, "isArray", header)) {
          __callKey1(header, "forEach", deleteHeader);
        } else {
          deleteHeader(header);
        }
        return deleted;
      }
    }, {
      key: "clear",
      value: function clear(matcher) {
        var keys = Object.compatKeys(this);
        var i = keys._ES5ProxyType ? keys.get("length") : keys.length;
        var deleted = false;
        while (i--) {
          var key = keys._ES5ProxyType ? keys.get(i) : keys[i];
          if (!matcher || matchHeaderValue(this, this._ES5ProxyType ? this.get(key) : this[key], key, matcher, true)) {
            __deleteKey(this, key);
            deleted = true;
          }
        }
        return deleted;
      }
    }, {
      key: "normalize",
      value: function normalize(format) {
        var self = this;
        var headers = {};
        __callKey2(utils$1, "forEach", this, function (value, header) {
          var key = __callKey2(utils$1, "findKey", headers, header);
          if (key) {
            __setKey(self, key, normalizeValue(value));
            __deleteKey(self, header);
            return;
          }
          var normalized = format ? formatHeader(header) : __callKey0(String(header), "trim");
          if (normalized !== header) {
            __deleteKey(self, header);
          }
          __setKey(self, normalized, normalizeValue(value));
          __setKey(headers, normalized, true);
        });
        return this;
      }
    }, {
      key: "concat",
      value: function concat() {
        var _this$constructor, _this$constructor2;
        for (var _len = arguments.length, targets = new Array(_len), _key = 0; _key < _len; _key++) {
          __setKey(targets, _key, arguments[_key]);
        }
        return __callKey2((_this$constructor2 = _this$constructor = this._ES5ProxyType ? this.get("constructor") : this.constructor, _this$constructor2._ES5ProxyType ? _this$constructor2.get("concat") : _this$constructor2.concat), "apply", _this$constructor, __concat([this], targets));
      }
    }, {
      key: "toJSON",
      value: function toJSON(asStrings) {
        var obj = Object.create(null);
        __callKey2(utils$1, "forEach", this, function (value, header) {
          value != null && value !== false && __setKey(obj, header, asStrings && __callKey1(utils$1, "isArray", value) ? __callKey1(value, "join", ', ') : value);
        });
        return obj;
      }
    }, {
      key: _Symbol$iterator,
      value: function value() {
        return __callKey0(Object.compatEntries(__callKey0(this, "toJSON")), Symbol.iterator);
      }
    }, {
      key: "toString",
      value: function toString() {
        return __callKey1(__callKey1(Object.compatEntries(__callKey0(this, "toJSON")), "map", function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            header = _ref2._ES5ProxyType ? _ref2.get(0) : _ref2[0],
            value = _ref2._ES5ProxyType ? _ref2.get(1) : _ref2[1];
          return header + ': ' + value;
        }), "join", '\n');
      }
    }, {
      key: _Symbol$toStringTag,
      get: function get() {
        return 'AxiosHeaders';
      }
    }], [{
      key: "from",
      value: function from(thing) {
        return _instanceof(thing, this) ? thing : new this(thing);
      }
    }, {
      key: "concat",
      value: function concat(first) {
        var computed = new this(first);
        for (var _len2 = arguments.length, targets = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          __setKey(targets, _key2 - 1, arguments[_key2]);
        }
        __callKey1(targets, "forEach", function (target) {
          return __callKey1(computed, "set", target);
        });
        return computed;
      }
    }, {
      key: "accessor",
      value: function accessor(header) {
        var internals = __setKey(this, $internals, __setKey(this, $internals, {
          accessors: {}
        }));
        var accessors = internals._ES5ProxyType ? internals.get("accessors") : internals.accessors;
        var prototype = this._ES5ProxyType ? this.get("prototype") : this.prototype;
        function defineAccessor(_header) {
          var lHeader = normalizeHeader(_header);
          if (!(accessors._ES5ProxyType ? accessors.get(lHeader) : accessors[lHeader])) {
            buildAccessors(prototype, _header);
            __setKey(accessors, lHeader, true);
          }
        }
        __callKey1(utils$1, "isArray", header) ? __callKey1(header, "forEach", defineAccessor) : defineAccessor(header);
        return this;
      }
    }]);
    return AxiosHeaders;
  }(Symbol.iterator, Symbol.toStringTag);
  __callKey1(AxiosHeaders, "accessor", ['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);
  __callKey1(utils$1, "freezeMethods", AxiosHeaders._ES5ProxyType ? AxiosHeaders.get("prototype") : AxiosHeaders.prototype);
  __callKey1(utils$1, "freezeMethods", AxiosHeaders);
  var AxiosHeaders$1 = AxiosHeaders;

  /**
   * Transform the data for a request or a response
   *
   * @param {Array|Function} fns A single function or Array of functions
   * @param {?Object} response The response object
   *
   * @returns {*} The resulting transformed data
   */
  function transformData(fns, response) {
    var config = this || defaults$3;
    var context = response || config;
    var headers = __callKey1(AxiosHeaders$1, "from", context._ES5ProxyType ? context.get("headers") : context.headers);
    var data = context._ES5ProxyType ? context.get("data") : context.data;
    __callKey2(utils$1, "forEach", fns, function transform(fn) {
      data = __callKey4(fn, "call", config, data, __callKey0(headers, "normalize"), response ? response._ES5ProxyType ? response.get("status") : response.status : undefined);
    });
    __callKey0(headers, "normalize");
    return data;
  }

  function isCancel(value) {
    return !!(value && (value._ES5ProxyType ? value.get("__CANCEL__") : value.__CANCEL__));
  }

  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  function CanceledError(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    __callKey(AxiosError, "call", this, message == null ? 'canceled' : message, AxiosError._ES5ProxyType ? AxiosError.get("ERR_CANCELED") : AxiosError.ERR_CANCELED, config, request);
    __setKey(this, "name", 'CanceledError');
  }
  __callKey3(utils$1, "inherits", CanceledError, AxiosError, {
    __CANCEL__: true
  });

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   *
   * @returns {object} The response.
   */
  function settle(resolve, reject, response) {
    var _config;
    var validateStatus = (_config = response._ES5ProxyType ? response.get("config") : response.config, _config._ES5ProxyType ? _config.get("validateStatus") : _config.validateStatus);
    if (!(response._ES5ProxyType ? response.get("status") : response.status) || !validateStatus || validateStatus(response._ES5ProxyType ? response.get("status") : response.status)) {
      resolve(response);
    } else {
      var _ref, _ref2;
      reject(new AxiosError('Request failed with status code ' + (response._ES5ProxyType ? response.get("status") : response.status), (_ref = [AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_REQUEST") : AxiosError.ERR_BAD_REQUEST, AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_RESPONSE") : AxiosError.ERR_BAD_RESPONSE], _ref2 = Math.floor((response._ES5ProxyType ? response.get("status") : response.status) / 100) - 4, _ref._ES5ProxyType ? _ref.get(_ref2) : _ref[_ref2]), response._ES5ProxyType ? response.get("config") : response.config, response._ES5ProxyType ? response.get("request") : response.request, response));
    }
  }

  var cookies = (platform._ES5ProxyType ? platform.get("isStandardBrowserEnv") : platform.isStandardBrowserEnv) ?
  // Standard browser envs support document.cookie
  function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));
        if (__callKey1(utils$1, "isNumber", expires)) {
          cookie.push('expires=' + __callKey0(new Date(expires), "toGMTString"));
        }
        if (__callKey1(utils$1, "isString", path)) {
          cookie.push('path=' + path);
        }
        if (__callKey1(utils$1, "isString", domain)) {
          cookie.push('domain=' + domain);
        }
        if (secure === true) {
          cookie.push('secure');
        }
        __setKey(document, "cookie", __callKey1(cookie, "join", '; '));
      },
      read: function read(name) {
        var match = __callKey1(document._ES5ProxyType ? document.get("cookie") : document.cookie, "match", new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match._ES5ProxyType ? match.get(3) : match[3]) : null;
      },
      remove: function remove(name) {
        __callKey3(this, "write", name, '', Date.now() - 86400000);
      }
    };
  }() :
  // Non standard browser env (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  }();

  function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return __callKey1(/^([a-z][a-z\d+\-.]*:)?\/\//i, "test", url);
  }

  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? __callKey2(baseURL, "replace", /\/+$/, '') + '/' + __callKey2(relativeURL, "replace", /^\/+/, '') : baseURL;
  }

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   *
   * @returns {string} The combined full path
   */
  function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  var isURLSameOrigin = (platform._ES5ProxyType ? platform.get("isStandardBrowserEnv") : platform.isStandardBrowserEnv) ?
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function standardBrowserEnv() {
    var msie = __callKey1(/(msie|trident)/i, "test", navigator._ES5ProxyType ? navigator.get("userAgent") : navigator.userAgent);
    var urlParsingNode = __callKey1(document, "createElement", 'a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;
      if (msie) {
        // IE needs attribute set twice to normalize properties
        __callKey2(urlParsingNode, "setAttribute", 'href', href);
        href = urlParsingNode._ES5ProxyType ? urlParsingNode.get("href") : urlParsingNode.href;
      }
      __callKey2(urlParsingNode, "setAttribute", 'href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode._ES5ProxyType ? urlParsingNode.get("href") : urlParsingNode.href,
        protocol: (urlParsingNode._ES5ProxyType ? urlParsingNode.get("protocol") : urlParsingNode.protocol) ? __callKey2(urlParsingNode._ES5ProxyType ? urlParsingNode.get("protocol") : urlParsingNode.protocol, "replace", /:$/, '') : '',
        host: urlParsingNode._ES5ProxyType ? urlParsingNode.get("host") : urlParsingNode.host,
        search: (urlParsingNode._ES5ProxyType ? urlParsingNode.get("search") : urlParsingNode.search) ? __callKey2(urlParsingNode._ES5ProxyType ? urlParsingNode.get("search") : urlParsingNode.search, "replace", /^\?/, '') : '',
        hash: (urlParsingNode._ES5ProxyType ? urlParsingNode.get("hash") : urlParsingNode.hash) ? __callKey2(urlParsingNode._ES5ProxyType ? urlParsingNode.get("hash") : urlParsingNode.hash, "replace", /^#/, '') : '',
        hostname: urlParsingNode._ES5ProxyType ? urlParsingNode.get("hostname") : urlParsingNode.hostname,
        port: urlParsingNode._ES5ProxyType ? urlParsingNode.get("port") : urlParsingNode.port,
        pathname: __callKey1(urlParsingNode._ES5ProxyType ? urlParsingNode.get("pathname") : urlParsingNode.pathname, "charAt", 0) === '/' ? urlParsingNode._ES5ProxyType ? urlParsingNode.get("pathname") : urlParsingNode.pathname : '/' + (urlParsingNode._ES5ProxyType ? urlParsingNode.get("pathname") : urlParsingNode.pathname)
      };
    }
    originURL = resolveURL(window.location._ES5ProxyType ? window.location.get("href") : window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = __callKey1(utils$1, "isString", requestURL) ? resolveURL(requestURL) : requestURL;
      return (parsed._ES5ProxyType ? parsed.get("protocol") : parsed.protocol) === (originURL._ES5ProxyType ? originURL.get("protocol") : originURL.protocol) && (parsed._ES5ProxyType ? parsed.get("host") : parsed.host) === (originURL._ES5ProxyType ? originURL.get("host") : originURL.host);
    };
  }() :
  // Non standard browser envs (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  }();

  function parseProtocol(url) {
    var match = __callKey1(/^([-+\w]{1,25})(:?\/\/|:)/, "exec", url);
    return match && (match._ES5ProxyType ? match.get(1) : match[1]) || '';
  }

  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    var bytes = new Array(samplesCount);
    var timestamps = new Array(samplesCount);
    var head = 0;
    var tail = 0;
    var firstSampleTS;
    min = min !== undefined ? min : 1000;
    return function push(chunkLength) {
      var now = Date.now();
      var startedAt = timestamps._ES5ProxyType ? timestamps.get(tail) : timestamps[tail];
      if (!firstSampleTS) {
        firstSampleTS = now;
      }
      __setKey(bytes, head, chunkLength);
      __setKey(timestamps, head, now);
      var i = tail;
      var bytesCount = 0;
      while (i !== head) {
        var _i;
        bytesCount += (_i = i++, bytes._ES5ProxyType ? bytes.get(_i) : bytes[_i]);
        i = i % samplesCount;
      }
      head = (head + 1) % samplesCount;
      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }
      if (now - firstSampleTS < min) {
        return;
      }
      var passed = startedAt && now - startedAt;
      return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
    };
  }

  function progressEventReducer(listener, isDownloadStream) {
    var bytesNotified = 0;
    var _speedometer = speedometer(50, 250);
    return function (e) {
      var loaded = e._ES5ProxyType ? e.get("loaded") : e.loaded;
      var total = (e._ES5ProxyType ? e.get("lengthComputable") : e.lengthComputable) ? e._ES5ProxyType ? e.get("total") : e.total : undefined;
      var progressBytes = loaded - bytesNotified;
      var rate = _speedometer(progressBytes);
      var inRange = loaded <= total;
      bytesNotified = loaded;
      var data = {
        loaded: loaded,
        total: total,
        progress: total ? loaded / total : undefined,
        bytes: progressBytes,
        rate: rate ? rate : undefined,
        estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
        event: e
      };
      __setKey(data, isDownloadStream ? 'download' : 'upload', true);
      listener(data);
    };
  }
  var isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';
  var xhrAdapter = isXHRAdapterSupported && function (config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config._ES5ProxyType ? config.get("data") : config.data;
      var requestHeaders = __callKey0(__callKey1(AxiosHeaders$1, "from", config._ES5ProxyType ? config.get("headers") : config.headers), "normalize");
      var responseType = config._ES5ProxyType ? config.get("responseType") : config.responseType;
      var onCanceled;
      function done() {
        if (config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken) {
          __callKey1(config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken, "unsubscribe", onCanceled);
        }
        if (config._ES5ProxyType ? config.get("signal") : config.signal) {
          __callKey2(config._ES5ProxyType ? config.get("signal") : config.signal, "removeEventListener", 'abort', onCanceled);
        }
      }
      if (__callKey1(utils$1, "isFormData", requestData)) {
        if ((platform._ES5ProxyType ? platform.get("isStandardBrowserEnv") : platform.isStandardBrowserEnv) || (platform._ES5ProxyType ? platform.get("isStandardBrowserWebWorkerEnv") : platform.isStandardBrowserWebWorkerEnv)) {
          __callKey1(requestHeaders, "setContentType", false); // Let the browser set it
        } else {
          __callKey2(requestHeaders, "setContentType", 'multipart/form-data;', false); // mobile/desktop app frameworks
        }
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config._ES5ProxyType ? config.get("auth") : config.auth) {
        var _auth, _auth2, _auth3;
        var username = (_auth = config._ES5ProxyType ? config.get("auth") : config.auth, _auth._ES5ProxyType ? _auth.get("username") : _auth.username) || '';
        var password = (_auth2 = config._ES5ProxyType ? config.get("auth") : config.auth, _auth2._ES5ProxyType ? _auth2.get("password") : _auth2.password) ? unescape(encodeURIComponent((_auth3 = config._ES5ProxyType ? config.get("auth") : config.auth, _auth3._ES5ProxyType ? _auth3.get("password") : _auth3.password))) : '';
        __callKey2(requestHeaders, "set", 'Authorization', 'Basic ' + btoa(username + ':' + password));
      }
      var fullPath = buildFullPath(config._ES5ProxyType ? config.get("baseURL") : config.baseURL, config._ES5ProxyType ? config.get("url") : config.url);
      __callKey3(request, "open", __callKey0(config._ES5ProxyType ? config.get("method") : config.method, "toUpperCase"), buildURL(fullPath, config._ES5ProxyType ? config.get("params") : config.params, config._ES5ProxyType ? config.get("paramsSerializer") : config.paramsSerializer), true);

      // Set the request timeout in MS
      __setKey(request, "timeout", config._ES5ProxyType ? config.get("timeout") : config.timeout);
      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        var responseHeaders = __callKey1(AxiosHeaders$1, "from", __inKey(request, 'getAllResponseHeaders') && __callKey0(request, "getAllResponseHeaders"));
        var responseData = !responseType || responseType === 'text' || responseType === 'json' ? request._ES5ProxyType ? request.get("responseText") : request.responseText : request._ES5ProxyType ? request.get("response") : request.response;
        var response = {
          data: responseData,
          status: request._ES5ProxyType ? request.get("status") : request.status,
          statusText: request._ES5ProxyType ? request.get("statusText") : request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };
        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }
      if (__inKey(request, 'onloadend')) {
        // Use onloadend if available
        __setKey(request, "onloadend", onloadend);
      } else {
        // Listen for ready state to emulate onloadend
        __setKey(request, "onreadystatechange", function handleLoad() {
          if (!request || (request._ES5ProxyType ? request.get("readyState") : request.readyState) !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if ((request._ES5ProxyType ? request.get("status") : request.status) === 0 && !((request._ES5ProxyType ? request.get("responseURL") : request.responseURL) && __callKey1(request._ES5ProxyType ? request.get("responseURL") : request.responseURL, "indexOf", 'file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        });
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      __setKey(request, "onabort", function handleAbort() {
        if (!request) {
          return;
        }
        reject(new AxiosError('Request aborted', AxiosError._ES5ProxyType ? AxiosError.get("ECONNABORTED") : AxiosError.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      });

      // Handle low level network errors
      __setKey(request, "onerror", function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(new AxiosError('Network Error', AxiosError._ES5ProxyType ? AxiosError.get("ERR_NETWORK") : AxiosError.ERR_NETWORK, config, request));

        // Clean up request
        request = null;
      });

      // Handle timeout
      __setKey(request, "ontimeout", function handleTimeout() {
        var timeoutErrorMessage = (config._ES5ProxyType ? config.get("timeout") : config.timeout) ? 'timeout of ' + (config._ES5ProxyType ? config.get("timeout") : config.timeout) + 'ms exceeded' : 'timeout exceeded';
        var transitional = (config._ES5ProxyType ? config.get("transitional") : config.transitional) || transitionalDefaults;
        if (config._ES5ProxyType ? config.get("timeoutErrorMessage") : config.timeoutErrorMessage) {
          timeoutErrorMessage = config._ES5ProxyType ? config.get("timeoutErrorMessage") : config.timeoutErrorMessage;
        }
        reject(new AxiosError(timeoutErrorMessage, (transitional._ES5ProxyType ? transitional.get("clarifyTimeoutError") : transitional.clarifyTimeoutError) ? AxiosError._ES5ProxyType ? AxiosError.get("ETIMEDOUT") : AxiosError.ETIMEDOUT : AxiosError._ES5ProxyType ? AxiosError.get("ECONNABORTED") : AxiosError.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      });

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (platform._ES5ProxyType ? platform.get("isStandardBrowserEnv") : platform.isStandardBrowserEnv) {
        // Add xsrf header
        var xsrfValue = ((config._ES5ProxyType ? config.get("withCredentials") : config.withCredentials) || isURLSameOrigin(fullPath)) && (config._ES5ProxyType ? config.get("xsrfCookieName") : config.xsrfCookieName) && __callKey1(cookies, "read", config._ES5ProxyType ? config.get("xsrfCookieName") : config.xsrfCookieName);
        if (xsrfValue) {
          __callKey2(requestHeaders, "set", config._ES5ProxyType ? config.get("xsrfHeaderName") : config.xsrfHeaderName, xsrfValue);
        }
      }

      // Remove Content-Type if data is undefined
      requestData === undefined && __callKey1(requestHeaders, "setContentType", null);

      // Add headers to the request
      if (__inKey(request, 'setRequestHeader')) {
        __callKey2(utils$1, "forEach", __callKey0(requestHeaders, "toJSON"), function setRequestHeader(val, key) {
          __callKey2(request, "setRequestHeader", key, val);
        });
      }

      // Add withCredentials to request if needed
      if (!__callKey1(utils$1, "isUndefined", config._ES5ProxyType ? config.get("withCredentials") : config.withCredentials)) {
        __setKey(request, "withCredentials", !!(config._ES5ProxyType ? config.get("withCredentials") : config.withCredentials));
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        __setKey(request, "responseType", config._ES5ProxyType ? config.get("responseType") : config.responseType);
      }

      // Handle progress if needed
      if (typeof (config._ES5ProxyType ? config.get("onDownloadProgress") : config.onDownloadProgress) === 'function') {
        __callKey2(request, "addEventListener", 'progress', progressEventReducer(config._ES5ProxyType ? config.get("onDownloadProgress") : config.onDownloadProgress, true));
      }

      // Not all browsers support upload events
      if (typeof (config._ES5ProxyType ? config.get("onUploadProgress") : config.onUploadProgress) === 'function' && (request._ES5ProxyType ? request.get("upload") : request.upload)) {
        __callKey2(request._ES5ProxyType ? request.get("upload") : request.upload, "addEventListener", 'progress', progressEventReducer(config._ES5ProxyType ? config.get("onUploadProgress") : config.onUploadProgress));
      }
      if ((config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken) || (config._ES5ProxyType ? config.get("signal") : config.signal)) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function onCanceled(cancel) {
          if (!request) {
            return;
          }
          reject(!cancel || (cancel._ES5ProxyType ? cancel.get("type") : cancel.type) ? new CanceledError(null, config, request) : cancel);
          __callKey0(request, "abort");
          request = null;
        };
        (config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken) && __callKey1(config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken, "subscribe", onCanceled);
        if (config._ES5ProxyType ? config.get("signal") : config.signal) {
          var _signal;
          (_signal = config._ES5ProxyType ? config.get("signal") : config.signal, _signal._ES5ProxyType ? _signal.get("aborted") : _signal.aborted) ? onCanceled() : __callKey2(config._ES5ProxyType ? config.get("signal") : config.signal, "addEventListener", 'abort', onCanceled);
        }
      }
      var protocol = parseProtocol(fullPath);
      if (protocol && __callKey1(platform._ES5ProxyType ? platform.get("protocols") : platform.protocols, "indexOf", protocol) === -1) {
        reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_REQUEST") : AxiosError.ERR_BAD_REQUEST, config));
        return;
      }

      // Send the request
      __callKey1(request, "send", requestData || null);
    });
  };

  var knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter
  };
  __callKey2(utils$1, "forEach", knownAdapters, function (fn, value) {
    if (fn) {
      try {
        Object.compatDefineProperty(fn, 'name', {
          value: value
        });
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      Object.compatDefineProperty(fn, 'adapterName', {
        value: value
      });
    }
  });
  var adapters = {
    getAdapter: function getAdapter(adapters) {
      adapters = __callKey1(utils$1, "isArray", adapters) ? adapters : [adapters];
      var _adapters = adapters,
        length = _adapters._ES5ProxyType ? _adapters.get("length") : _adapters.length;
      var nameOrAdapter;
      var adapter;
      for (var i = 0; i < length; i++) {
        var _nameOrAdapter$toLowe;
        nameOrAdapter = adapters._ES5ProxyType ? adapters.get(i) : adapters[i];
        if (adapter = __callKey1(utils$1, "isString", nameOrAdapter) ? (_nameOrAdapter$toLowe = __callKey0(nameOrAdapter, "toLowerCase"), knownAdapters._ES5ProxyType ? knownAdapters.get(_nameOrAdapter$toLowe) : knownAdapters[_nameOrAdapter$toLowe]) : nameOrAdapter) {
          break;
        }
      }
      if (!adapter) {
        if (adapter === false) {
          throw new AxiosError(__concat("Adapter ", nameOrAdapter, " is not supported by the environment"), 'ERR_NOT_SUPPORT');
        }
        throw new Error(__callKey2(utils$1, "hasOwnProp", knownAdapters, nameOrAdapter) ? __concat("Adapter '", nameOrAdapter, "' is not available in the build") : __concat("Unknown adapter '", nameOrAdapter, "'"));
      }
      if (!__callKey1(utils$1, "isFunction", adapter)) {
        throw new TypeError('adapter is not a function');
      }
      return adapter;
    },
    adapters: knownAdapters
  };

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   *
   * @param {Object} config The config that is to be used for the request
   *
   * @returns {void}
   */
  function throwIfCancellationRequested(config) {
    var _signal;
    if (config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken) {
      __callKey0(config._ES5ProxyType ? config.get("cancelToken") : config.cancelToken, "throwIfRequested");
    }
    if ((config._ES5ProxyType ? config.get("signal") : config.signal) && (_signal = config._ES5ProxyType ? config.get("signal") : config.signal, _signal._ES5ProxyType ? _signal.get("aborted") : _signal.aborted)) {
      throw new CanceledError(null, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    __setKey(config, "headers", __callKey1(AxiosHeaders$1, "from", config._ES5ProxyType ? config.get("headers") : config.headers));

    // Transform request data
    __setKey(config, "data", __callKey2(transformData, "call", config, config._ES5ProxyType ? config.get("transformRequest") : config.transformRequest));
    if (__callKey1(['post', 'put', 'patch'], "indexOf", config._ES5ProxyType ? config.get("method") : config.method) !== -1) {
      __callKey2(config._ES5ProxyType ? config.get("headers") : config.headers, "setContentType", 'application/x-www-form-urlencoded', false);
    }
    var adapter = __callKey1(adapters, "getAdapter", (config._ES5ProxyType ? config.get("adapter") : config.adapter) || (defaults$3._ES5ProxyType ? defaults$3.get("adapter") : defaults$3.adapter));
    return __callKey2(adapter(config), "then", function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      __setKey(response, "data", __callKey3(transformData, "call", config, config._ES5ProxyType ? config.get("transformResponse") : config.transformResponse, response));
      __setKey(response, "headers", __callKey1(AxiosHeaders$1, "from", response._ES5ProxyType ? response.get("headers") : response.headers));
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && (reason._ES5ProxyType ? reason.get("response") : reason.response)) {
          var _response;
          __setKey(reason._ES5ProxyType ? reason.get("response") : reason.response, "data", __callKey3(transformData, "call", config, config._ES5ProxyType ? config.get("transformResponse") : config.transformResponse, reason._ES5ProxyType ? reason.get("response") : reason.response));
          __setKey(reason._ES5ProxyType ? reason.get("response") : reason.response, "headers", __callKey1(AxiosHeaders$1, "from", (_response = reason._ES5ProxyType ? reason.get("response") : reason.response, _response._ES5ProxyType ? _response.get("headers") : _response.headers)));
        }
      }
      return Promise.reject(reason);
    });
  }

  var headersToObject = function headersToObject(thing) {
    return _instanceof(thing, AxiosHeaders$1) ? __callKey0(thing, "toJSON") : thing;
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   *
   * @returns {Object} New object resulting from merging config2 to config1
   */
  function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};
    function getMergedValue(target, source, caseless) {
      if (__callKey1(utils$1, "isPlainObject", target) && __callKey1(utils$1, "isPlainObject", source)) {
        return __callKey3(utils$1._ES5ProxyType ? utils$1.get("merge") : utils$1.merge, "call", {
          caseless: caseless
        }, target, source);
      } else if (__callKey1(utils$1, "isPlainObject", source)) {
        return __callKey2(utils$1, "merge", {}, source);
      } else if (__callKey1(utils$1, "isArray", source)) {
        return __callKey0(source, "slice");
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(a, b, caseless) {
      if (!__callKey1(utils$1, "isUndefined", b)) {
        return getMergedValue(a, b, caseless);
      } else if (!__callKey1(utils$1, "isUndefined", a)) {
        return getMergedValue(undefined, a, caseless);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
      if (!__callKey1(utils$1, "isUndefined", b)) {
        return getMergedValue(undefined, b);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
      if (!__callKey1(utils$1, "isUndefined", b)) {
        return getMergedValue(undefined, b);
      } else if (!__callKey1(utils$1, "isUndefined", a)) {
        return getMergedValue(undefined, a);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
      if (__inKey(config2, prop)) {
        return getMergedValue(a, b);
      } else if (__inKey(config1, prop)) {
        return getMergedValue(undefined, a);
      }
    }
    var mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: function headers(a, b) {
        return mergeDeepProperties(headersToObject(a), headersToObject(b), true);
      }
    };
    __callKey2(utils$1, "forEach", Object.compatKeys(Object.compatAssign({}, config1, config2)), function computeConfigValue(prop) {
      var merge = (mergeMap._ES5ProxyType ? mergeMap.get(prop) : mergeMap[prop]) || mergeDeepProperties;
      var configValue = merge(config1._ES5ProxyType ? config1.get(prop) : config1[prop], config2._ES5ProxyType ? config2.get(prop) : config2[prop], prop);
      __callKey1(utils$1, "isUndefined", configValue) && merge !== mergeDirectKeys || __setKey(config, prop, configValue);
    });
    return config;
  }

  var VERSION = "1.4.0";

  var validators$1 = {};

  // eslint-disable-next-line func-names
  __callKey1(['object', 'boolean', 'number', 'function', 'string', 'symbol'], "forEach", function (type, i) {
    __setKey(validators$1, type, function validator(thing) {
      return _typeof(thing) === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    });
  });
  var deprecatedWarnings = {};

  /**
   * Transitional option validator
   *
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   *
   * @returns {function}
   */
  __setKey(validators$1, "transitional", function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return function (value, opt, opts) {
      if (validator === false) {
        throw new AxiosError(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')), AxiosError._ES5ProxyType ? AxiosError.get("ERR_DEPRECATED") : AxiosError.ERR_DEPRECATED);
      }
      if (version && !(deprecatedWarnings._ES5ProxyType ? deprecatedWarnings.get(opt) : deprecatedWarnings[opt])) {
        __setKey(deprecatedWarnings, opt, true);
        // eslint-disable-next-line no-console
        __callKey1(console, "warn", formatMessage(opt, ' has been deprecated since v' + version + ' and will be removed in the near future'));
      }
      return validator ? validator(value, opt, opts) : true;
    };
  });

  /**
   * Assert object's properties type
   *
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   *
   * @returns {object}
   */

  function assertOptions(options, schema, allowUnknown) {
    if (_typeof(options) !== 'object') {
      throw new AxiosError('options must be an object', AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_OPTION_VALUE") : AxiosError.ERR_BAD_OPTION_VALUE);
    }
    var keys = Object.compatKeys(options);
    var i = keys._ES5ProxyType ? keys.get("length") : keys.length;
    while (i-- > 0) {
      var opt = keys._ES5ProxyType ? keys.get(i) : keys[i];
      var validator = schema._ES5ProxyType ? schema.get(opt) : schema[opt];
      if (validator) {
        var value = options._ES5ProxyType ? options.get(opt) : options[opt];
        var result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_OPTION_VALUE") : AxiosError.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError('Unknown option ' + opt, AxiosError._ES5ProxyType ? AxiosError.get("ERR_BAD_OPTION") : AxiosError.ERR_BAD_OPTION);
      }
    }
  }
  var validator = {
    assertOptions: assertOptions,
    validators: validators$1
  };

  var validators = validator._ES5ProxyType ? validator.get("validators") : validator.validators;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   *
   * @return {Axios} A new instance of Axios
   */
  var Axios = /*#__PURE__*/function () {
    function Axios(instanceConfig) {
      _classCallCheck(this, Axios);
      __setKey(this, "defaults", instanceConfig);
      __setKey(this, "interceptors", {
        request: new InterceptorManager$1(),
        response: new InterceptorManager$1()
      });
    }

    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    _createClass(Axios, [{
      key: "request",
      value: function request(configOrUrl, config) {
        var _defaults, _config$method, _interceptors, _interceptors2;
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          __setKey(config, "url", configOrUrl);
        } else {
          config = configOrUrl || {};
        }
        config = mergeConfig(this._ES5ProxyType ? this.get("defaults") : this.defaults, config);
        var _config = config,
          transitional = _config._ES5ProxyType ? _config.get("transitional") : _config.transitional,
          paramsSerializer = _config._ES5ProxyType ? _config.get("paramsSerializer") : _config.paramsSerializer,
          headers = _config._ES5ProxyType ? _config.get("headers") : _config.headers;
        if (transitional !== undefined) {
          __callKey3(validator, "assertOptions", transitional, {
            silentJSONParsing: __callKey1(validators, "transitional", validators._ES5ProxyType ? validators.get("boolean") : validators.boolean),
            forcedJSONParsing: __callKey1(validators, "transitional", validators._ES5ProxyType ? validators.get("boolean") : validators.boolean),
            clarifyTimeoutError: __callKey1(validators, "transitional", validators._ES5ProxyType ? validators.get("boolean") : validators.boolean)
          }, false);
        }
        if (paramsSerializer != null) {
          if (__callKey1(utils$1, "isFunction", paramsSerializer)) {
            __setKey(config, "paramsSerializer", {
              serialize: paramsSerializer
            });
          } else {
            __callKey3(validator, "assertOptions", paramsSerializer, {
              encode: validators._ES5ProxyType ? validators.get("function") : validators.function,
              serialize: validators._ES5ProxyType ? validators.get("function") : validators.function
            }, true);
          }
        }

        // Set config.method
        __setKey(config, "method", __callKey0((config._ES5ProxyType ? config.get("method") : config.method) || (_defaults = this._ES5ProxyType ? this.get("defaults") : this.defaults, _defaults._ES5ProxyType ? _defaults.get("method") : _defaults.method) || 'get', "toLowerCase"));
        var contextHeaders;

        // Flatten headers
        contextHeaders = headers && __callKey2(utils$1, "merge", headers._ES5ProxyType ? headers.get("common") : headers.common, (_config$method = config._ES5ProxyType ? config.get("method") : config.method, headers._ES5ProxyType ? headers.get(_config$method) : headers[_config$method]));
        contextHeaders && __callKey2(utils$1, "forEach", ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function (method) {
          __deleteKey(headers, method);
        });
        __setKey(config, "headers", __concat(AxiosHeaders$1, contextHeaders, headers));

        // filter out skipped interceptors
        var requestInterceptorChain = [];
        var synchronousRequestInterceptors = true;
        __callKey1((_interceptors = this._ES5ProxyType ? this.get("interceptors") : this.interceptors, _interceptors._ES5ProxyType ? _interceptors.get("request") : _interceptors.request), "forEach", function unshiftRequestInterceptors(interceptor) {
          if (typeof (interceptor._ES5ProxyType ? interceptor.get("runWhen") : interceptor.runWhen) === 'function' && __callKey1(interceptor, "runWhen", config) === false) {
            return;
          }
          synchronousRequestInterceptors = synchronousRequestInterceptors && (interceptor._ES5ProxyType ? interceptor.get("synchronous") : interceptor.synchronous);
          requestInterceptorChain.unshift(interceptor._ES5ProxyType ? interceptor.get("fulfilled") : interceptor.fulfilled, interceptor._ES5ProxyType ? interceptor.get("rejected") : interceptor.rejected);
        });
        var responseInterceptorChain = [];
        __callKey1((_interceptors2 = this._ES5ProxyType ? this.get("interceptors") : this.interceptors, _interceptors2._ES5ProxyType ? _interceptors2.get("response") : _interceptors2.response), "forEach", function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor._ES5ProxyType ? interceptor.get("fulfilled") : interceptor.fulfilled, interceptor._ES5ProxyType ? interceptor.get("rejected") : interceptor.rejected);
        });
        var promise;
        var i = 0;
        var len;
        if (!synchronousRequestInterceptors) {
          var chain = [__callKey1(dispatchRequest, "bind", this), undefined];
          __callKey2(chain.unshift, "apply", chain, requestInterceptorChain);
          __callKey2(chain.push, "apply", chain, responseInterceptorChain);
          len = chain._ES5ProxyType ? chain.get("length") : chain.length;
          promise = Promise.resolve(config);
          while (i < len) {
            var _i, _i3;
            promise = __callKey2(promise, "then", (_i = i++, chain._ES5ProxyType ? chain.get(_i) : chain[_i]), (_i3 = i++, chain._ES5ProxyType ? chain.get(_i3) : chain[_i3]));
          }
          return promise;
        }
        len = requestInterceptorChain._ES5ProxyType ? requestInterceptorChain.get("length") : requestInterceptorChain.length;
        var newConfig = config;
        i = 0;
        while (i < len) {
          var _i5, _i7;
          var onFulfilled = (_i5 = i++, requestInterceptorChain._ES5ProxyType ? requestInterceptorChain.get(_i5) : requestInterceptorChain[_i5]);
          var onRejected = (_i7 = i++, requestInterceptorChain._ES5ProxyType ? requestInterceptorChain.get(_i7) : requestInterceptorChain[_i7]);
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            __callKey2(onRejected, "call", this, error);
            break;
          }
        }
        try {
          promise = __callKey2(dispatchRequest, "call", this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }
        i = 0;
        len = responseInterceptorChain._ES5ProxyType ? responseInterceptorChain.get("length") : responseInterceptorChain.length;
        while (i < len) {
          var _i9, _i11;
          promise = __callKey2(promise, "then", (_i9 = i++, responseInterceptorChain._ES5ProxyType ? responseInterceptorChain.get(_i9) : responseInterceptorChain[_i9]), (_i11 = i++, responseInterceptorChain._ES5ProxyType ? responseInterceptorChain.get(_i11) : responseInterceptorChain[_i11]));
        }
        return promise;
      }
    }, {
      key: "getUri",
      value: function getUri(config) {
        config = mergeConfig(this._ES5ProxyType ? this.get("defaults") : this.defaults, config);
        var fullPath = buildFullPath(config._ES5ProxyType ? config.get("baseURL") : config.baseURL, config._ES5ProxyType ? config.get("url") : config.url);
        return buildURL(fullPath, config._ES5ProxyType ? config.get("params") : config.params, config._ES5ProxyType ? config.get("paramsSerializer") : config.paramsSerializer);
      }
    }]);
    return Axios;
  }(); // Provide aliases for supported request methods
  __callKey2(utils$1, "forEach", ['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    __setKey(Axios._ES5ProxyType ? Axios.get("prototype") : Axios.prototype, method, function (url, config) {
      var _ref;
      return __callKey1(this, "request", mergeConfig(config || {}, {
        method: method,
        url: url,
        data: (_ref = config || {}, _ref._ES5ProxyType ? _ref.get("data") : _ref.data)
      }));
    });
  });
  __callKey2(utils$1, "forEach", ['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/

    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return __callKey1(this, "request", mergeConfig(config || {}, {
          method: method,
          headers: isForm ? {
            'Content-Type': 'multipart/form-data'
          } : {},
          url: url,
          data: data
        }));
      };
    }
    __setKey(Axios._ES5ProxyType ? Axios.get("prototype") : Axios.prototype, method, generateHTTPMethod());
    __setKey(Axios._ES5ProxyType ? Axios.get("prototype") : Axios.prototype, method + 'Form', generateHTTPMethod(true));
  });
  var Axios$1 = Axios;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @param {Function} executor The executor function.
   *
   * @returns {CancelToken}
   */
  var CancelToken = /*#__PURE__*/function () {
    function CancelToken(executor) {
      _classCallCheck(this, CancelToken);
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }
      var resolvePromise;
      __setKey(this, "promise", new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      }));
      var token = this;

      // eslint-disable-next-line func-names
      __callKey1(this._ES5ProxyType ? this.get("promise") : this.promise, "then", function (cancel) {
        var _listeners;
        if (!(token._ES5ProxyType ? token.get("_listeners") : token._listeners)) return;
        var i = (_listeners = token._ES5ProxyType ? token.get("_listeners") : token._listeners, _listeners._ES5ProxyType ? _listeners.get("length") : _listeners.length);
        while (i-- > 0) {
          __callKey1(token._ES5ProxyType ? token.get("_listeners") : token._listeners, i, cancel);
        }
        __setKey(token, "_listeners", null);
      });

      // eslint-disable-next-line func-names
      __setKey(this._ES5ProxyType ? this.get("promise") : this.promise, "then", function (onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = __callKey1(new Promise(function (resolve) {
          __callKey1(token, "subscribe", resolve);
          _resolve = resolve;
        }), "then", onfulfilled);
        __setKey(promise, "cancel", function reject() {
          __callKey1(token, "unsubscribe", _resolve);
        });
        return promise;
      });
      executor(function cancel(message, config, request) {
        if (token._ES5ProxyType ? token.get("reason") : token.reason) {
          // Cancellation has already been requested
          return;
        }
        __setKey(token, "reason", new CanceledError(message, config, request));
        resolvePromise(token._ES5ProxyType ? token.get("reason") : token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    _createClass(CancelToken, [{
      key: "throwIfRequested",
      value: function throwIfRequested() {
        if (this._ES5ProxyType ? this.get("reason") : this.reason) {
          throw this._ES5ProxyType ? this.get("reason") : this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */
    }, {
      key: "subscribe",
      value: function subscribe(listener) {
        if (this._ES5ProxyType ? this.get("reason") : this.reason) {
          listener(this._ES5ProxyType ? this.get("reason") : this.reason);
          return;
        }
        if (this._ES5ProxyType ? this.get("_listeners") : this._listeners) {
          (this._ES5ProxyType ? this.get("_listeners") : this._listeners).push(listener);
        } else {
          __setKey(this, "_listeners", [listener]);
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */
    }, {
      key: "unsubscribe",
      value: function unsubscribe(listener) {
        if (!(this._ES5ProxyType ? this.get("_listeners") : this._listeners)) {
          return;
        }
        var index = __callKey1(this._ES5ProxyType ? this.get("_listeners") : this._listeners, "indexOf", listener);
        if (index !== -1) {
          (this._ES5ProxyType ? this.get("_listeners") : this._listeners).splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
    }], [{
      key: "source",
      value: function source() {
        var cancel;
        var token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token: token,
          cancel: cancel
        };
      }
    }]);
    return CancelToken;
  }();
  var CancelToken$1 = CancelToken;

  function spread(callback) {
    return function wrap(arr) {
      return __callKey2(callback, "apply", null, arr);
    };
  }

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   *
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  function isAxiosError(payload) {
    return __callKey1(utils$1, "isObject", payload) && (payload._ES5ProxyType ? payload.get("isAxiosError") : payload.isAxiosError) === true;
  }

  var HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
  };
  __callKey1(Object.compatEntries(HttpStatusCode), "forEach", function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2._ES5ProxyType ? _ref2.get(0) : _ref2[0],
      value = _ref2._ES5ProxyType ? _ref2.get(1) : _ref2[1];
    __setKey(HttpStatusCode, value, key);
  });
  var HttpStatusCode$1 = HttpStatusCode;

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   *
   * @returns {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var _prototype;
    var context = new Axios$1(defaultConfig);
    var instance = bind((_prototype = Axios$1._ES5ProxyType ? Axios$1.get("prototype") : Axios$1.prototype, _prototype._ES5ProxyType ? _prototype.get("request") : _prototype.request), context);

    // Copy axios.prototype to instance
    __callKey4(utils$1, "extend", instance, Axios$1._ES5ProxyType ? Axios$1.get("prototype") : Axios$1.prototype, context, {
      allOwnKeys: true
    });

    // Copy context to instance
    __callKey4(utils$1, "extend", instance, context, null, {
      allOwnKeys: true
    });

    // Factory for creating new instances
    __setKey(instance, "create", function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    });
    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults$3);

  // Expose Axios class to allow class inheritance
  __setKey(axios, "Axios", Axios$1);

  // Expose Cancel & CancelToken
  __setKey(axios, "CanceledError", CanceledError);
  __setKey(axios, "CancelToken", CancelToken$1);
  __setKey(axios, "isCancel", isCancel);
  __setKey(axios, "VERSION", VERSION);
  __setKey(axios, "toFormData", toFormData);

  // Expose AxiosError class
  __setKey(axios, "AxiosError", AxiosError);

  // alias for CanceledError for backward compatibility
  __setKey(axios, "Cancel", axios._ES5ProxyType ? axios.get("CanceledError") : axios.CanceledError);

  // Expose all/spread
  __setKey(axios, "all", function all(promises) {
    return Promise.all(promises);
  });
  __setKey(axios, "spread", spread);

  // Expose isAxiosError
  __setKey(axios, "isAxiosError", isAxiosError);

  // Expose mergeConfig
  __setKey(axios, "mergeConfig", mergeConfig);
  __setKey(axios, "AxiosHeaders", AxiosHeaders$1);
  __setKey(axios, "formToJSON", function (thing) {
    return formDataToJSON(__callKey1(utils$1, "isHTMLForm", thing) ? new FormData(thing) : thing);
  });
  __setKey(axios, "HttpStatusCode", HttpStatusCode$1);
  __setKey(axios, "default", axios);

  // this module should only have a default export
  var axios$1 = axios;

  // This module is intended to unwrap Axios default export as named.
  // Keep top-level export same with static properties
  // so that it can keep same with es module or cjs
  axios$1._ES5ProxyType ? axios$1.get("Axios") : axios$1.Axios;
    axios$1._ES5ProxyType ? axios$1.get("AxiosError") : axios$1.AxiosError;
    axios$1._ES5ProxyType ? axios$1.get("CanceledError") : axios$1.CanceledError;
    axios$1._ES5ProxyType ? axios$1.get("isCancel") : axios$1.isCancel;
    axios$1._ES5ProxyType ? axios$1.get("CancelToken") : axios$1.CancelToken;
    axios$1._ES5ProxyType ? axios$1.get("VERSION") : axios$1.VERSION;
    axios$1._ES5ProxyType ? axios$1.get("all") : axios$1.all;
    axios$1._ES5ProxyType ? axios$1.get("Cancel") : axios$1.Cancel;
    axios$1._ES5ProxyType ? axios$1.get("isAxiosError") : axios$1.isAxiosError;
    axios$1._ES5ProxyType ? axios$1.get("spread") : axios$1.spread;
    axios$1._ES5ProxyType ? axios$1.get("toFormData") : axios$1.toFormData;
    axios$1._ES5ProxyType ? axios$1.get("AxiosHeaders") : axios$1.AxiosHeaders;
    axios$1._ES5ProxyType ? axios$1.get("HttpStatusCode") : axios$1.HttpStatusCode;
    axios$1._ES5ProxyType ? axios$1.get("formToJSON") : axios$1.formToJSON;
    axios$1._ES5ProxyType ? axios$1.get("mergeConfig") : axios$1.mergeConfig;

  var shams = function hasSymbols() {
    var _Object$compatKeys, _Object$getOwnPropert;
    if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
      return false;
    }
    if (_typeof(Symbol.iterator) === 'symbol') {
      return true;
    }
    var obj = {};
    var sym = Symbol('test');
    var symObj = Object(sym);
    if (typeof sym === 'string') {
      return false;
    }
    if (__callKey1(Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString, "call", sym) !== '[object Symbol]') {
      return false;
    }
    if (__callKey1(Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString, "call", symObj) !== '[object Symbol]') {
      return false;
    }

    // temp disabled per https://github.com/ljharb/object.assign/issues/17
    // if (sym instanceof Symbol) { return false; }
    // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    // if (!(symObj instanceof Symbol)) { return false; }

    // if (typeof Symbol.prototype.toString !== 'function') { return false; }
    // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

    var symVal = 42;
    __setKey(obj, sym, symVal);
    for (sym in __iterableKey(obj)) {
      return false;
    } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    if (typeof Object.compatKeys === 'function' && (_Object$compatKeys = Object.compatKeys(obj), _Object$compatKeys._ES5ProxyType ? _Object$compatKeys.get("length") : _Object$compatKeys.length) !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === 'function' && (_Object$getOwnPropert = Object.getOwnPropertyNames(obj), _Object$getOwnPropert._ES5ProxyType ? _Object$getOwnPropert.get("length") : _Object$getOwnPropert.length) !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if ((syms._ES5ProxyType ? syms.get("length") : syms.length) !== 1 || (syms._ES5ProxyType ? syms.get(0) : syms[0]) !== sym) {
      return false;
    }
    if (!__callKey2(Object.prototype._ES5ProxyType ? Object.prototype.get("propertyIsEnumerable") : Object.prototype.propertyIsEnumerable, "call", obj, sym)) {
      return false;
    }
    if (typeof Object.compatGetOwnPropertyDescriptor === 'function') {
      var descriptor = Object.compatGetOwnPropertyDescriptor(obj, sym);
      if ((descriptor._ES5ProxyType ? descriptor.get("value") : descriptor.value) !== symVal || (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) !== true) {
        return false;
      }
    }
    return true;
  };

  var origSymbol = typeof Symbol !== 'undefined' && Symbol;
  var hasSymbols$1 = function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') {
      return false;
    }
    if (typeof Symbol !== 'function') {
      return false;
    }
    if (_typeof(origSymbol('foo')) !== 'symbol') {
      return false;
    }
    if (_typeof(Symbol('bar')) !== 'symbol') {
      return false;
    }
    return shams();
  };

  var test = {
    foo: {}
  };
  var $Object = Object;
  var hasProto$1 = function hasProto() {
    var _proto__;
    return (_proto__ = {
      __proto__: test
    }, _proto__._ES5ProxyType ? _proto__.get("foo") : _proto__.foo) === (test._ES5ProxyType ? test.get("foo") : test.foo) && !_instanceof({
      __proto__: null
    }, $Object);
  };

  var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
  var slice = Array.prototype._ES5ProxyType ? Array.prototype.get("slice") : Array.prototype.slice;
  var toStr$1 = Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString;
  var funcType = '[object Function]';
  var implementation = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || __callKey1(toStr$1, "call", target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = __callKey2(slice, "call", arguments, 1);
    var bound;
    var binder = function binder() {
      if (_instanceof(this, bound)) {
        var result = __callKey2(target, "apply", this, __concat(args, __callKey1(slice, "call", arguments)));
        if (Object(result) === result) {
          return result;
        }
        return this;
      } else {
        return __callKey2(target, "apply", that, __concat(args, __callKey1(slice, "call", arguments)));
      }
    };
    var boundLength = Math.max(0, (target._ES5ProxyType ? target.get("length") : target.length) - (args._ES5ProxyType ? args.get("length") : args.length));
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
      boundArgs.push('$' + i);
    }
    bound = Function('binder', 'return function (' + __callKey1(boundArgs, "join", ',') + '){ return binder.apply(this,arguments); }')(binder);
    if (target._ES5ProxyType ? target.get("prototype") : target.prototype) {
      var Empty = function Empty() {};
      __setKey(Empty, "prototype", target._ES5ProxyType ? target.get("prototype") : target.prototype);
      __setKey(bound, "prototype", new Empty());
      __setKey(Empty, "prototype", null);
    }
    return bound;
  };

  var functionBind = (Function.prototype._ES5ProxyType ? Function.prototype.get("bind") : Function.prototype.bind) || implementation;

  var src = __callKey2(functionBind, "call", Function.call, Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty);

  var undefined$1;
  var $SyntaxError = SyntaxError;
  var $Function = Function;
  var $TypeError$1 = TypeError;

  // eslint-disable-next-line consistent-return
  var getEvalledConstructor = function getEvalledConstructor(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    } catch (e) {}
  };
  var $gOPD = Object.compatGetOwnPropertyDescriptor;
  if ($gOPD) {
    try {
      $gOPD({}, '');
    } catch (e) {
      $gOPD = null; // this is IE 8, which has a broken gOPD
    }
  }

  var throwTypeError = function throwTypeError() {
    throw new $TypeError$1();
  };
  var ThrowTypeError = $gOPD ? function () {
    try {
      // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
      arguments.callee; // IE 8 does not throw here
      return throwTypeError;
    } catch (calleeThrows) {
      try {
        var _$gOPD, _get;
        // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
        return _$gOPD = $gOPD(arguments, 'callee'), _get = _$gOPD._ES5ProxyType ? _$gOPD.get("get") : _$gOPD.get;
      } catch (gOPDthrows) {
        return throwTypeError;
      }
    }
  }() : throwTypeError;
  var hasSymbols = hasSymbols$1();
  var hasProto = hasProto$1();
  var getProto = Object.getPrototypeOf || (hasProto ? function (x) {
    return x._ES5ProxyType ? x.get("__proto__") : x.__proto__;
  } // eslint-disable-line no-proto
  : null);
  var needsEval = {};
  var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined$1 : getProto(Uint8Array);
  var INTRINSICS = {
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto(__callKey0([], Symbol.iterator)) : undefined$1,
    '%AsyncFromSyncIteratorPrototype%': undefined$1,
    '%AsyncFunction%': needsEval,
    '%AsyncGenerator%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%AsyncIteratorPrototype%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
    '%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
    '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
    '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
    '%Date%': Date,
    '%decodeURI%': decodeURI,
    '%decodeURIComponent%': decodeURIComponent,
    '%encodeURI%': encodeURI,
    '%encodeURIComponent%': encodeURIComponent,
    '%Error%': Error,
    '%eval%': eval,
    // eslint-disable-line no-eval
    '%EvalError%': EvalError,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
    '%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
    '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
    '%Function%': $Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
    '%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
    '%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
    '%isFinite%': isFinite,
    '%isNaN%': isNaN,
    '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto(__callKey0([], Symbol.iterator))) : undefined$1,
    '%JSON%': (typeof JSON === "undefined" ? "undefined" : _typeof(JSON)) === 'object' ? JSON : undefined$1,
    '%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
    '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(__callKey0(new Map(), Symbol.iterator)),
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': Object,
    '%parseFloat%': parseFloat,
    '%parseInt%': parseInt,
    '%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
    '%RangeError%': RangeError,
    '%ReferenceError%': ReferenceError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
    '%RegExp%': RegExp,
    '%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
    '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(__callKey0(new Set(), Symbol.iterator)),
    '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
    '%String%': String,
    '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(__callKey0('', Symbol.iterator)) : undefined$1,
    '%Symbol%': hasSymbols ? Symbol : undefined$1,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%TypeError%': $TypeError$1,
    '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
    '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
    '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
    '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
    '%URIError%': URIError,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
    '%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
    '%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
  };
  if (getProto) {
    try {
      null._ES5ProxyType ? null.get("error") : null.error; // eslint-disable-line no-unused-expressions
    } catch (e) {
      // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
      var errorProto = getProto(getProto(e));
      __setKey(INTRINSICS, '%Error.prototype%', errorProto);
    }
  }
  var doEval = function doEval(name) {
    var value;
    if (name === '%AsyncFunction%') {
      value = getEvalledConstructor('async function () {}');
    } else if (name === '%GeneratorFunction%') {
      value = getEvalledConstructor('function* () {}');
    } else if (name === '%AsyncGeneratorFunction%') {
      value = getEvalledConstructor('async function* () {}');
    } else if (name === '%AsyncGenerator%') {
      var fn = doEval('%AsyncGeneratorFunction%');
      if (fn) {
        value = fn._ES5ProxyType ? fn.get("prototype") : fn.prototype;
      }
    } else if (name === '%AsyncIteratorPrototype%') {
      var gen = doEval('%AsyncGenerator%');
      if (gen && getProto) {
        value = getProto(gen._ES5ProxyType ? gen.get("prototype") : gen.prototype);
      }
    }
    __setKey(INTRINSICS, name, value);
    return value;
  };
  var LEGACY_ALIASES = {
    '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
    '%ArrayPrototype%': ['Array', 'prototype'],
    '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
    '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
    '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
    '%ArrayProto_values%': ['Array', 'prototype', 'values'],
    '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
    '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
    '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
    '%BooleanPrototype%': ['Boolean', 'prototype'],
    '%DataViewPrototype%': ['DataView', 'prototype'],
    '%DatePrototype%': ['Date', 'prototype'],
    '%ErrorPrototype%': ['Error', 'prototype'],
    '%EvalErrorPrototype%': ['EvalError', 'prototype'],
    '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
    '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
    '%FunctionPrototype%': ['Function', 'prototype'],
    '%Generator%': ['GeneratorFunction', 'prototype'],
    '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
    '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
    '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
    '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
    '%JSONParse%': ['JSON', 'parse'],
    '%JSONStringify%': ['JSON', 'stringify'],
    '%MapPrototype%': ['Map', 'prototype'],
    '%NumberPrototype%': ['Number', 'prototype'],
    '%ObjectPrototype%': ['Object', 'prototype'],
    '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
    '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
    '%PromisePrototype%': ['Promise', 'prototype'],
    '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
    '%Promise_all%': ['Promise', 'all'],
    '%Promise_reject%': ['Promise', 'reject'],
    '%Promise_resolve%': ['Promise', 'resolve'],
    '%RangeErrorPrototype%': ['RangeError', 'prototype'],
    '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
    '%RegExpPrototype%': ['RegExp', 'prototype'],
    '%SetPrototype%': ['Set', 'prototype'],
    '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
    '%StringPrototype%': ['String', 'prototype'],
    '%SymbolPrototype%': ['Symbol', 'prototype'],
    '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
    '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
    '%TypeErrorPrototype%': ['TypeError', 'prototype'],
    '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
    '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
    '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
    '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
    '%URIErrorPrototype%': ['URIError', 'prototype'],
    '%WeakMapPrototype%': ['WeakMap', 'prototype'],
    '%WeakSetPrototype%': ['WeakSet', 'prototype']
  };
  var $concat$1 = __callKey2(functionBind, "call", Function.call, Array.prototype._ES5ProxyType ? Array.prototype.get("compatConcat") : Array.prototype.compatConcat);
  var $spliceApply = __callKey2(functionBind, "call", Function.apply, Array.prototype.splice);
  var $replace$1 = __callKey2(functionBind, "call", Function.call, String.prototype._ES5ProxyType ? String.prototype.get("replace") : String.prototype.replace);
  var $strSlice = __callKey2(functionBind, "call", Function.call, String.prototype._ES5ProxyType ? String.prototype.get("slice") : String.prototype.slice);
  var $exec = __callKey2(functionBind, "call", Function.call, RegExp.prototype._ES5ProxyType ? RegExp.prototype.get("exec") : RegExp.prototype.exec);

  /* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
  var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
  var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === '%' && last !== '%') {
      throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
    } else if (last === '%' && first !== '%') {
      throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
    }
    var result = [];
    $replace$1(string, rePropName, function (match, number, quote, subString) {
      __setKey(result, result._ES5ProxyType ? result.get("length") : result.length, quote ? $replace$1(subString, reEscapeChar, '$1') : number || match);
    });
    return result;
  };
  /* end adaptation */

  var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (src(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES._ES5ProxyType ? LEGACY_ALIASES.get(intrinsicName) : LEGACY_ALIASES[intrinsicName];
      intrinsicName = '%' + (alias._ES5ProxyType ? alias.get(0) : alias[0]) + '%';
    }
    if (src(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS._ES5ProxyType ? INTRINSICS.get(intrinsicName) : INTRINSICS[intrinsicName];
      if (value === needsEval) {
        value = doEval(intrinsicName);
      }
      if (typeof value === 'undefined' && !allowMissing) {
        throw new $TypeError$1('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
      }
      return {
        alias: alias,
        name: intrinsicName,
        value: value
      };
    }
    throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
  };
  var getIntrinsic = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || (name._ES5ProxyType ? name.get("length") : name.length) === 0) {
      throw new $TypeError$1('intrinsic name must be a non-empty string');
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
      throw new $TypeError$1('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = (parts._ES5ProxyType ? parts.get("length") : parts.length) > 0 ? parts._ES5ProxyType ? parts.get(0) : parts[0] : '';
    var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    var intrinsicRealName = intrinsic._ES5ProxyType ? intrinsic.get("name") : intrinsic.name;
    var value = intrinsic._ES5ProxyType ? intrinsic.get("value") : intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic._ES5ProxyType ? intrinsic.get("alias") : intrinsic.alias;
    if (alias) {
      intrinsicBaseName = alias._ES5ProxyType ? alias.get(0) : alias[0];
      $spliceApply(parts, $concat$1([0, 1], alias));
    }
    for (var i = 1, isOwn = true; i < (parts._ES5ProxyType ? parts.get("length") : parts.length); i += 1) {
      var part = parts._ES5ProxyType ? parts.get(i) : parts[i];
      var first = $strSlice(part, 0, 1);
      var last = $strSlice(part, -1);
      if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
        throw new $SyntaxError('property names with quotes must have matching quotes');
      }
      if (part === 'constructor' || !isOwn) {
        skipFurtherCaching = true;
      }
      intrinsicBaseName += '.' + part;
      intrinsicRealName = '%' + intrinsicBaseName + '%';
      if (src(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS._ES5ProxyType ? INTRINSICS.get(intrinsicRealName) : INTRINSICS[intrinsicRealName];
      } else if (value != null) {
        if (!__inKey(value, part)) {
          if (!allowMissing) {
            throw new $TypeError$1('base intrinsic for ' + name + ' exists, but the property is not available.');
          }
          return void undefined$1;
        }
        if ($gOPD && i + 1 >= (parts._ES5ProxyType ? parts.get("length") : parts.length)) {
          var desc = $gOPD(value, part);
          isOwn = !!desc;

          // By convention, when a data property is converted to an accessor
          // property to emulate a data property that does not suffer from
          // the override mistake, that accessor's getter is marked with
          // an `originalValue` property. Here, when we detect this, we
          // uphold the illusion by pretending to see that original data
          // property, i.e., returning the value rather than the getter
          // itself.
          if (isOwn && __inKey(desc, 'get') && !__inKey(desc._ES5ProxyType ? desc.get("get") : desc.get, 'originalValue')) {
            value = desc._ES5ProxyType ? desc.get("get") : desc.get;
          } else {
            value = value._ES5ProxyType ? value.get(part) : value[part];
          }
        } else {
          isOwn = src(value, part);
          value = value._ES5ProxyType ? value.get(part) : value[part];
        }
        if (isOwn && !skipFurtherCaching) {
          __setKey(INTRINSICS, intrinsicRealName, value);
        }
      }
    }
    return value;
  };

  var callBind = __callKey1(commonjsHelpers, "createCommonjsModule", function (module) {

    var $apply = getIntrinsic('%Function.prototype.apply%');
    var $call = getIntrinsic('%Function.prototype.call%');
    var $reflectApply = getIntrinsic('%Reflect.apply%', true) || __callKey2(functionBind, "call", $call, $apply);
    var $gOPD = getIntrinsic('%Object.getOwnPropertyDescriptor%', true);
    var $defineProperty = getIntrinsic('%Object.defineProperty%', true);
    var $max = getIntrinsic('%Math.max%');
    if ($defineProperty) {
      try {
        $defineProperty({}, 'a', {
          value: 1
        });
      } catch (e) {
        // IE 8 has a broken defineProperty
        $defineProperty = null;
      }
    }
    __setKey(module, "exports", function callBind(originalFunction) {
      var func = $reflectApply(functionBind, $call, arguments);
      if ($gOPD && $defineProperty) {
        var desc = $gOPD(func, 'length');
        if (desc._ES5ProxyType ? desc.get("configurable") : desc.configurable) {
          // original length, plus the receiver, minus any additional arguments (after the receiver)
          $defineProperty(func, 'length', {
            value: 1 + $max(0, (originalFunction._ES5ProxyType ? originalFunction.get("length") : originalFunction.length) - (arguments.length - 1))
          });
        }
      }
      return func;
    });
    var applyBind = function applyBind() {
      return $reflectApply(functionBind, $apply, arguments);
    };
    if ($defineProperty) {
      $defineProperty(module._ES5ProxyType ? module.get("exports") : module.exports, 'apply', {
        value: applyBind
      });
    } else {
      __setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "apply", applyBind);
    }
  });

  var $indexOf = callBind(getIntrinsic('String.prototype.indexOf'));
  var callBound = function callBoundIntrinsic(name, allowMissing) {
    var intrinsic = getIntrinsic(name, !!allowMissing);
    if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
      return callBind(intrinsic);
    }
    return intrinsic;
  };

  var _nodeResolve_empty = {};

  var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _nodeResolve_empty
  });

  var utilInspect = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

  var _prototype, _prototype2, _ref$1;
  var hasMap = typeof Map === 'function' && Map.prototype;
  var mapSizeDescriptor = Object.compatGetOwnPropertyDescriptor && hasMap ? Object.compatGetOwnPropertyDescriptor(Map.prototype, 'size') : null;
  var mapSize = hasMap && mapSizeDescriptor && typeof (mapSizeDescriptor._ES5ProxyType ? mapSizeDescriptor.get("get") : mapSizeDescriptor.get) === 'function' ? mapSizeDescriptor._ES5ProxyType ? mapSizeDescriptor.get("get") : mapSizeDescriptor.get : null;
  var mapForEach = hasMap && (Map.prototype._ES5ProxyType ? Map.prototype.get("forEach") : Map.prototype.forEach);
  var hasSet = typeof Set === 'function' && Set.prototype;
  var setSizeDescriptor = Object.compatGetOwnPropertyDescriptor && hasSet ? Object.compatGetOwnPropertyDescriptor(Set.prototype, 'size') : null;
  var setSize = hasSet && setSizeDescriptor && typeof (setSizeDescriptor._ES5ProxyType ? setSizeDescriptor.get("get") : setSizeDescriptor.get) === 'function' ? setSizeDescriptor._ES5ProxyType ? setSizeDescriptor.get("get") : setSizeDescriptor.get : null;
  var setForEach = hasSet && (Set.prototype._ES5ProxyType ? Set.prototype.get("forEach") : Set.prototype.forEach);
  var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
  var weakMapHas = hasWeakMap ? WeakMap.prototype._ES5ProxyType ? WeakMap.prototype.get("has") : WeakMap.prototype.has : null;
  var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
  var weakSetHas = hasWeakSet ? WeakSet.prototype._ES5ProxyType ? WeakSet.prototype.get("has") : WeakSet.prototype.has : null;
  var hasWeakRef = typeof WeakRef === 'function' && (WeakRef._ES5ProxyType ? WeakRef.get("prototype") : WeakRef.prototype);
  var weakRefDeref = hasWeakRef ? (_prototype = WeakRef._ES5ProxyType ? WeakRef.get("prototype") : WeakRef.prototype, _prototype._ES5ProxyType ? _prototype.get("deref") : _prototype.deref) : null;
  var booleanValueOf = Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf;
  var objectToString = Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString;
  var functionToString = Function.prototype._ES5ProxyType ? Function.prototype.get("toString") : Function.prototype.toString;
  var $match = String.prototype._ES5ProxyType ? String.prototype.get("match") : String.prototype.match;
  var $slice = String.prototype._ES5ProxyType ? String.prototype.get("slice") : String.prototype.slice;
  var $replace = String.prototype._ES5ProxyType ? String.prototype.get("replace") : String.prototype.replace;
  var $toUpperCase = String.prototype._ES5ProxyType ? String.prototype.get("toUpperCase") : String.prototype.toUpperCase;
  var $toLowerCase = String.prototype._ES5ProxyType ? String.prototype.get("toLowerCase") : String.prototype.toLowerCase;
  var $test = RegExp.prototype._ES5ProxyType ? RegExp.prototype.get("test") : RegExp.prototype.test;
  var $concat = Array.prototype._ES5ProxyType ? Array.prototype.get("compatConcat") : Array.prototype.compatConcat;
  var $join = Array.prototype._ES5ProxyType ? Array.prototype.get("join") : Array.prototype.join;
  var $arrSlice = Array.prototype._ES5ProxyType ? Array.prototype.get("slice") : Array.prototype.slice;
  var $floor = Math.floor;
  var bigIntValueOf = typeof BigInt === 'function' ? (_prototype2 = BigInt._ES5ProxyType ? BigInt.get("prototype") : BigInt.prototype, _prototype2._ES5ProxyType ? _prototype2.get("valueOf") : _prototype2.valueOf) : null;
  var gOPS = Object.getOwnPropertySymbols;
  var symToString = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'symbol' ? Symbol.prototype._ES5ProxyType ? Symbol.prototype.get("toString") : Symbol.prototype.toString : null;
  var hasShammedSymbols = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'object';
  // ie, `has-tostringtag/shams
  var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (_typeof(Symbol.toStringTag) === hasShammedSymbols ? 'object' : 'symbol') ? Symbol.toStringTag : null;
  var isEnumerable = Object.prototype._ES5ProxyType ? Object.prototype.get("propertyIsEnumerable") : Object.prototype.propertyIsEnumerable;
  var gPO = (typeof Reflect === 'function' ? Reflect._ES5ProxyType ? Reflect.get("getPrototypeOf") : Reflect.getPrototypeOf : Object.getPrototypeOf) || ((_ref$1 = [], _ref$1._ES5ProxyType ? _ref$1.get("__proto__") : _ref$1.__proto__) === Array.prototype // eslint-disable-line no-proto
  ? function (O) {
    return O._ES5ProxyType ? O.get("__proto__") : O.__proto__; // eslint-disable-line no-proto
  } : null);
  function addNumericSeparator(num, str) {
    if (num === Infinity || num === -Infinity || num !== num || num && num > -1000 && num < 1000 || __callKey2($test, "call", /e/, str)) {
      return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
      var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
      if (int !== num) {
        var intStr = String(int);
        var dec = __callKey2($slice, "call", str, (intStr._ES5ProxyType ? intStr.get("length") : intStr.length) + 1);
        return __callKey3($replace, "call", intStr, sepRegex, '$&_') + '.' + __callKey3($replace, "call", __callKey3($replace, "call", dec, /([0-9]{3})/g, '$&_'), /_$/, '');
      }
    }
    return __callKey3($replace, "call", str, sepRegex, '$&_');
  }
  var inspectCustom = utilInspect._ES5ProxyType ? utilInspect.get("custom") : utilInspect.custom;
  var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
  var objectInspect = function inspect_(obj, options, depth, seen) {
    var opts = options || {};
    if (has$3(opts, 'quoteStyle') && (opts._ES5ProxyType ? opts.get("quoteStyle") : opts.quoteStyle) !== 'single' && (opts._ES5ProxyType ? opts.get("quoteStyle") : opts.quoteStyle) !== 'double') {
      throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (has$3(opts, 'maxStringLength') && (typeof (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength) === 'number' ? (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength) < 0 && (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength) !== Infinity : (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength) !== null)) {
      throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has$3(opts, 'customInspect') ? opts._ES5ProxyType ? opts.get("customInspect") : opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
      throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }
    if (has$3(opts, 'indent') && (opts._ES5ProxyType ? opts.get("indent") : opts.indent) !== null && (opts._ES5ProxyType ? opts.get("indent") : opts.indent) !== '\t' && !(parseInt(opts._ES5ProxyType ? opts.get("indent") : opts.indent, 10) === (opts._ES5ProxyType ? opts.get("indent") : opts.indent) && (opts._ES5ProxyType ? opts.get("indent") : opts.indent) > 0)) {
      throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has$3(opts, 'numericSeparator') && typeof (opts._ES5ProxyType ? opts.get("numericSeparator") : opts.numericSeparator) !== 'boolean') {
      throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts._ES5ProxyType ? opts.get("numericSeparator") : opts.numericSeparator;
    if (typeof obj === 'undefined') {
      return 'undefined';
    }
    if (obj === null) {
      return 'null';
    }
    if (typeof obj === 'boolean') {
      return obj ? 'true' : 'false';
    }
    if (typeof obj === 'string') {
      return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
      if (obj === 0) {
        return Infinity / obj > 0 ? '0' : '-0';
      }
      var str = String(obj);
      return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
      var bigIntStr = String(obj) + 'n';
      return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }
    var maxDepth = typeof (opts._ES5ProxyType ? opts.get("depth") : opts.depth) === 'undefined' ? 5 : opts._ES5ProxyType ? opts.get("depth") : opts.depth;
    if (typeof depth === 'undefined') {
      depth = 0;
    }
    if (depth >= maxDepth && maxDepth > 0 && _typeof(obj) === 'object') {
      return isArray$3(obj) ? '[Array]' : '[Object]';
    }
    var indent = getIndent(opts, depth);
    if (typeof seen === 'undefined') {
      seen = [];
    } else if (indexOf(seen, obj) >= 0) {
      return '[Circular]';
    }
    function inspect(value, from, noIndent) {
      if (from) {
        seen = __callKey1($arrSlice, "call", seen);
        seen.push(from);
      }
      if (noIndent) {
        var newOpts = {
          depth: opts._ES5ProxyType ? opts.get("depth") : opts.depth
        };
        if (has$3(opts, 'quoteStyle')) {
          __setKey(newOpts, "quoteStyle", opts._ES5ProxyType ? opts.get("quoteStyle") : opts.quoteStyle);
        }
        return inspect_(value, newOpts, depth + 1, seen);
      }
      return inspect_(value, opts, depth + 1, seen);
    }
    if (typeof obj === 'function' && !isRegExp$1(obj)) {
      // in older engines, regexes are callable
      var name = nameOf(obj);
      var keys = arrObjKeys(obj, inspect);
      return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + ((keys._ES5ProxyType ? keys.get("length") : keys.length) > 0 ? ' { ' + __callKey2($join, "call", keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
      var symString = hasShammedSymbols ? __callKey3($replace, "call", String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : __callKey1(symToString, "call", obj);
      return _typeof(obj) === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
      var _childNodes;
      var s = '<' + __callKey1($toLowerCase, "call", String(obj._ES5ProxyType ? obj.get("nodeName") : obj.nodeName));
      var attrs = (obj._ES5ProxyType ? obj.get("attributes") : obj.attributes) || [];
      for (var i = 0; i < (attrs._ES5ProxyType ? attrs.get("length") : attrs.length); i++) {
        var _i, _i2;
        s += ' ' + (_i = attrs._ES5ProxyType ? attrs.get(i) : attrs[i], _i._ES5ProxyType ? _i.get("name") : _i.name) + '=' + wrapQuotes(quote((_i2 = attrs._ES5ProxyType ? attrs.get(i) : attrs[i], _i2._ES5ProxyType ? _i2.get("value") : _i2.value)), 'double', opts);
      }
      s += '>';
      if ((obj._ES5ProxyType ? obj.get("childNodes") : obj.childNodes) && (_childNodes = obj._ES5ProxyType ? obj.get("childNodes") : obj.childNodes, _childNodes._ES5ProxyType ? _childNodes.get("length") : _childNodes.length)) {
        s += '...';
      }
      s += '</' + __callKey1($toLowerCase, "call", String(obj._ES5ProxyType ? obj.get("nodeName") : obj.nodeName)) + '>';
      return s;
    }
    if (isArray$3(obj)) {
      if ((obj._ES5ProxyType ? obj.get("length") : obj.length) === 0) {
        return '[]';
      }
      var xs = arrObjKeys(obj, inspect);
      if (indent && !singleLineValues(xs)) {
        return '[' + indentedJoin(xs, indent) + ']';
      }
      return '[ ' + __callKey2($join, "call", xs, ', ') + ' ]';
    }
    if (isError(obj)) {
      var parts = arrObjKeys(obj, inspect);
      if (!__inKey(Error._ES5ProxyType ? Error.get("prototype") : Error.prototype, 'cause') && __inKey(obj, 'cause') && !__callKey2(isEnumerable, "call", obj, 'cause')) {
        return '{ [' + String(obj) + '] ' + __callKey2($join, "call", __callKey2($concat, "call", '[cause]: ' + inspect(obj._ES5ProxyType ? obj.get("cause") : obj.cause), parts), ', ') + ' }';
      }
      if ((parts._ES5ProxyType ? parts.get("length") : parts.length) === 0) {
        return '[' + String(obj) + ']';
      }
      return '{ [' + String(obj) + '] ' + __callKey2($join, "call", parts, ', ') + ' }';
    }
    if (_typeof(obj) === 'object' && customInspect) {
      if (inspectSymbol && typeof (obj._ES5ProxyType ? obj.get(inspectSymbol) : obj[inspectSymbol]) === 'function' && utilInspect) {
        return utilInspect(obj, {
          depth: maxDepth - depth
        });
      } else if (customInspect !== 'symbol' && typeof (obj._ES5ProxyType ? obj.get("inspect") : obj.inspect) === 'function') {
        return __callKey0(obj, "inspect");
      }
    }
    if (isMap(obj)) {
      var mapParts = [];
      if (mapForEach) {
        __callKey2(mapForEach, "call", obj, function (value, key) {
          mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
        });
      }
      return collectionOf('Map', __callKey1(mapSize, "call", obj), mapParts, indent);
    }
    if (isSet(obj)) {
      var setParts = [];
      if (setForEach) {
        __callKey2(setForEach, "call", obj, function (value) {
          setParts.push(inspect(value, obj));
        });
      }
      return collectionOf('Set', __callKey1(setSize, "call", obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
      return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
      return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
      return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
      return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
      return markBoxed(inspect(__callKey1(bigIntValueOf, "call", obj)));
    }
    if (isBoolean(obj)) {
      return markBoxed(__callKey1(booleanValueOf, "call", obj));
    }
    if (isString(obj)) {
      return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp$1(obj)) {
      var _constructor, _constructor2;
      var ys = arrObjKeys(obj, inspect);
      var isPlainObject = gPO ? gPO(obj) === Object.prototype : _instanceof(obj, Object) || (obj._ES5ProxyType ? obj.get("constructor") : obj.constructor) === Object;
      var protoTag = _instanceof(obj, Object) ? '' : 'null prototype';
      var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && __inKey(obj, toStringTag) ? __callKey3($slice, "call", toStr(obj), 8, -1) : protoTag ? 'Object' : '';
      var constructorTag = isPlainObject || typeof (obj._ES5ProxyType ? obj.get("constructor") : obj.constructor) !== 'function' ? '' : (_constructor = obj._ES5ProxyType ? obj.get("constructor") : obj.constructor, _constructor._ES5ProxyType ? _constructor.get("name") : _constructor.name) ? (_constructor2 = obj._ES5ProxyType ? obj.get("constructor") : obj.constructor, _constructor2._ES5ProxyType ? _constructor2.get("name") : _constructor2.name) + ' ' : '';
      var tag = constructorTag + (stringTag || protoTag ? '[' + __callKey2($join, "call", __callKey3($concat, "call", [], stringTag || [], protoTag || []), ': ') + '] ' : '');
      if ((ys._ES5ProxyType ? ys.get("length") : ys.length) === 0) {
        return tag + '{}';
      }
      if (indent) {
        return tag + '{' + indentedJoin(ys, indent) + '}';
      }
      return tag + '{ ' + __callKey2($join, "call", ys, ', ') + ' }';
    }
    return String(obj);
  };
  function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = ((opts._ES5ProxyType ? opts.get("quoteStyle") : opts.quoteStyle) || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
  }
  function quote(s) {
    return __callKey3($replace, "call", String(s), /"/g, '&quot;');
  }
  function isArray$3(obj) {
    return toStr(obj) === '[object Array]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isDate(obj) {
    return toStr(obj) === '[object Date]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isRegExp$1(obj) {
    return toStr(obj) === '[object RegExp]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isError(obj) {
    return toStr(obj) === '[object Error]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isString(obj) {
    return toStr(obj) === '[object String]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isNumber(obj) {
    return toStr(obj) === '[object Number]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }
  function isBoolean(obj) {
    return toStr(obj) === '[object Boolean]' && (!toStringTag || !(_typeof(obj) === 'object' && __inKey(obj, toStringTag)));
  }

  // Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
  function isSymbol(obj) {
    if (hasShammedSymbols) {
      return obj && _typeof(obj) === 'object' && _instanceof(obj, Symbol);
    }
    if (_typeof(obj) === 'symbol') {
      return true;
    }
    if (!obj || _typeof(obj) !== 'object' || !symToString) {
      return false;
    }
    try {
      __callKey1(symToString, "call", obj);
      return true;
    } catch (e) {}
    return false;
  }
  function isBigInt(obj) {
    if (!obj || _typeof(obj) !== 'object' || !bigIntValueOf) {
      return false;
    }
    try {
      __callKey1(bigIntValueOf, "call", obj);
      return true;
    } catch (e) {}
    return false;
  }
  var hasOwn = (Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty) || function (key) {
    return __inKey(this, key);
  };
  function has$3(obj, key) {
    return __callKey2(hasOwn, "call", obj, key);
  }
  function toStr(obj) {
    return __callKey1(objectToString, "call", obj);
  }
  function nameOf(f) {
    if (f._ES5ProxyType ? f.get("name") : f.name) {
      return f._ES5ProxyType ? f.get("name") : f.name;
    }
    var m = __callKey2($match, "call", __callKey1(functionToString, "call", f), /^function\s*([\w$]+)/);
    if (m) {
      return m._ES5ProxyType ? m.get(1) : m[1];
    }
    return null;
  }
  function indexOf(xs, x) {
    if (xs._ES5ProxyType ? xs.get("indexOf") : xs.indexOf) {
      return __callKey1(xs, "indexOf", x);
    }
    for (var i = 0, l = xs._ES5ProxyType ? xs.get("length") : xs.length; i < l; i++) {
      if ((xs._ES5ProxyType ? xs.get(i) : xs[i]) === x) {
        return i;
      }
    }
    return -1;
  }
  function isMap(x) {
    if (!mapSize || !x || _typeof(x) !== 'object') {
      return false;
    }
    try {
      __callKey1(mapSize, "call", x);
      try {
        __callKey1(setSize, "call", x);
      } catch (s) {
        return true;
      }
      return _instanceof(x, Map); // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
  }
  function isWeakMap(x) {
    if (!weakMapHas || !x || _typeof(x) !== 'object') {
      return false;
    }
    try {
      __callKey2(weakMapHas, "call", x, weakMapHas);
      try {
        __callKey2(weakSetHas, "call", x, weakSetHas);
      } catch (s) {
        return true;
      }
      return _instanceof(x, WeakMap); // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
  }
  function isWeakRef(x) {
    if (!weakRefDeref || !x || _typeof(x) !== 'object') {
      return false;
    }
    try {
      __callKey1(weakRefDeref, "call", x);
      return true;
    } catch (e) {}
    return false;
  }
  function isSet(x) {
    if (!setSize || !x || _typeof(x) !== 'object') {
      return false;
    }
    try {
      __callKey1(setSize, "call", x);
      try {
        __callKey1(mapSize, "call", x);
      } catch (m) {
        return true;
      }
      return _instanceof(x, Set); // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
  }
  function isWeakSet(x) {
    if (!weakSetHas || !x || _typeof(x) !== 'object') {
      return false;
    }
    try {
      __callKey2(weakSetHas, "call", x, weakSetHas);
      try {
        __callKey2(weakMapHas, "call", x, weakMapHas);
      } catch (s) {
        return true;
      }
      return _instanceof(x, WeakSet); // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
  }
  function isElement(x) {
    if (!x || _typeof(x) !== 'object') {
      return false;
    }
    if (typeof HTMLElement !== 'undefined' && _instanceof(x, HTMLElement)) {
      return true;
    }
    return typeof (x._ES5ProxyType ? x.get("nodeName") : x.nodeName) === 'string' && typeof (x._ES5ProxyType ? x.get("getAttribute") : x.getAttribute) === 'function';
  }
  function inspectString(str, opts) {
    if ((str._ES5ProxyType ? str.get("length") : str.length) > (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength)) {
      var remaining = (str._ES5ProxyType ? str.get("length") : str.length) - (opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength);
      var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
      return inspectString(__callKey3($slice, "call", str, 0, opts._ES5ProxyType ? opts.get("maxStringLength") : opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = __callKey3($replace, "call", __callKey3($replace, "call", str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
  }
  function lowbyte(c) {
    var _$9$10$12$;
    var n = __callKey1(c, "charCodeAt", 0);
    var x = (_$9$10$12$ = {
      8: 'b',
      9: 't',
      10: 'n',
      12: 'f',
      13: 'r'
    }, _$9$10$12$._ES5ProxyType ? _$9$10$12$.get(n) : _$9$10$12$[n]);
    if (x) {
      return '\\' + x;
    }
    return '\\x' + (n < 0x10 ? '0' : '') + __callKey1($toUpperCase, "call", __callKey1(n, "toString", 16));
  }
  function markBoxed(str) {
    return 'Object(' + str + ')';
  }
  function weakCollectionOf(type) {
    return type + ' { ? }';
  }
  function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : __callKey2($join, "call", entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
  }
  function singleLineValues(xs) {
    for (var i = 0; i < (xs._ES5ProxyType ? xs.get("length") : xs.length); i++) {
      if (indexOf(xs._ES5ProxyType ? xs.get(i) : xs[i], '\n') >= 0) {
        return false;
      }
    }
    return true;
  }
  function getIndent(opts, depth) {
    var baseIndent;
    if ((opts._ES5ProxyType ? opts.get("indent") : opts.indent) === '\t') {
      baseIndent = '\t';
    } else if (typeof (opts._ES5ProxyType ? opts.get("indent") : opts.indent) === 'number' && (opts._ES5ProxyType ? opts.get("indent") : opts.indent) > 0) {
      baseIndent = __callKey2($join, "call", Array((opts._ES5ProxyType ? opts.get("indent") : opts.indent) + 1), ' ');
    } else {
      return null;
    }
    return {
      base: baseIndent,
      prev: __callKey2($join, "call", Array(depth + 1), baseIndent)
    };
  }
  function indentedJoin(xs, indent) {
    if ((xs._ES5ProxyType ? xs.get("length") : xs.length) === 0) {
      return '';
    }
    var lineJoiner = '\n' + (indent._ES5ProxyType ? indent.get("prev") : indent.prev) + (indent._ES5ProxyType ? indent.get("base") : indent.base);
    return lineJoiner + __callKey2($join, "call", xs, ',' + lineJoiner) + '\n' + (indent._ES5ProxyType ? indent.get("prev") : indent.prev);
  }
  function arrObjKeys(obj, inspect) {
    var isArr = isArray$3(obj);
    var xs = [];
    if (isArr) {
      __setKey(xs, "length", obj._ES5ProxyType ? obj.get("length") : obj.length);
      for (var i = 0; i < (obj._ES5ProxyType ? obj.get("length") : obj.length); i++) {
        __setKey(xs, i, has$3(obj, i) ? inspect(obj._ES5ProxyType ? obj.get(i) : obj[i], obj) : '');
      }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
      symMap = {};
      for (var k = 0; k < (syms._ES5ProxyType ? syms.get("length") : syms.length); k++) {
        __setKey(symMap, '$' + (syms._ES5ProxyType ? syms.get(k) : syms[k]), syms._ES5ProxyType ? syms.get(k) : syms[k]);
      }
    }
    for (var key in __iterableKey(obj)) {
      var _ref2;
      // eslint-disable-line no-restricted-syntax
      if (!has$3(obj, key)) {
        continue;
      } // eslint-disable-line no-restricted-syntax, no-continue
      if (isArr && String(Number(key)) === key && key < (obj._ES5ProxyType ? obj.get("length") : obj.length)) {
        continue;
      } // eslint-disable-line no-restricted-syntax, no-continue
      if (hasShammedSymbols && _instanceof((_ref2 = '$' + key, symMap._ES5ProxyType ? symMap.get(_ref2) : symMap[_ref2]), Symbol)) {
        // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
        continue; // eslint-disable-line no-restricted-syntax, no-continue
      } else if (__callKey2($test, "call", /[^\w$]/, key)) {
        xs.push(inspect(key, obj) + ': ' + inspect(obj._ES5ProxyType ? obj.get(key) : obj[key], obj));
      } else {
        xs.push(key + ': ' + inspect(obj._ES5ProxyType ? obj.get(key) : obj[key], obj));
      }
    }
    if (typeof gOPS === 'function') {
      for (var j = 0; j < (syms._ES5ProxyType ? syms.get("length") : syms.length); j++) {
        if (__callKey2(isEnumerable, "call", obj, syms._ES5ProxyType ? syms.get(j) : syms[j])) {
          var _syms$j;
          xs.push('[' + inspect(syms._ES5ProxyType ? syms.get(j) : syms[j]) + ']: ' + inspect((_syms$j = syms._ES5ProxyType ? syms.get(j) : syms[j], obj._ES5ProxyType ? obj.get(_syms$j) : obj[_syms$j]), obj));
        }
      }
    }
    return xs;
  }

  var inspect = objectInspect;

  var $TypeError = getIntrinsic('%TypeError%');
  var $WeakMap = getIntrinsic('%WeakMap%', true);
  var $Map = getIntrinsic('%Map%', true);
  var $weakMapGet = callBound('WeakMap.prototype.get', true);
  var $weakMapSet = callBound('WeakMap.prototype.set', true);
  var $weakMapHas = callBound('WeakMap.prototype.has', true);
  var $mapGet = callBound('Map.prototype.get', true);
  var $mapSet = callBound('Map.prototype.set', true);
  var $mapHas = callBound('Map.prototype.has', true);

  /*
   * This function traverses the list returning the node corresponding to the
   * given key.
   *
   * That node is also moved to the head of the list, so that if it's accessed
   * again we don't need to traverse the whole list. By doing so, all the recently
   * used nodes can be accessed relatively quickly.
   */
  var listGetNode = function listGetNode(list, key) {
    // eslint-disable-line consistent-return
    for (var prev = list, curr; (curr = prev._ES5ProxyType ? prev.get("next") : prev.next) !== null; prev = curr) {
      if ((curr._ES5ProxyType ? curr.get("key") : curr.key) === key) {
        __setKey(prev, "next", curr._ES5ProxyType ? curr.get("next") : curr.next);
        __setKey(curr, "next", list._ES5ProxyType ? list.get("next") : list.next);
        __setKey(list, "next", curr); // eslint-disable-line no-param-reassign
        return curr;
      }
    }
  };
  var listGet = function listGet(objects, key) {
    var node = listGetNode(objects, key);
    return node && (node._ES5ProxyType ? node.get("value") : node.value);
  };
  var listSet = function listSet(objects, key, value) {
    var node = listGetNode(objects, key);
    if (node) {
      __setKey(node, "value", value);
    } else {
      // Prepend the new node to the beginning of the list
      __setKey(objects, "next", {
        // eslint-disable-line no-param-reassign
        key: key,
        next: objects._ES5ProxyType ? objects.get("next") : objects.next,
        value: value
      });
    }
  };
  var listHas = function listHas(objects, key) {
    return !!listGetNode(objects, key);
  };
  var sideChannel = function getSideChannel() {
    var $wm;
    var $m;
    var $o;
    var channel = {
      assert: function assert(key) {
        if (!__callKey1(channel, "has", key)) {
          throw new $TypeError('Side channel does not contain ' + inspect(key));
        }
      },
      get: function get(key) {
        // eslint-disable-line consistent-return
        if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
          if ($wm) {
            return $weakMapGet($wm, key);
          }
        } else if ($Map) {
          if ($m) {
            return $mapGet($m, key);
          }
        } else {
          if ($o) {
            // eslint-disable-line no-lonely-if
            return listGet($o, key);
          }
        }
      },
      has: function has(key) {
        if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
          if ($wm) {
            return $weakMapHas($wm, key);
          }
        } else if ($Map) {
          if ($m) {
            return $mapHas($m, key);
          }
        } else {
          if ($o) {
            // eslint-disable-line no-lonely-if
            return listHas($o, key);
          }
        }
        return false;
      },
      set: function set(key, value) {
        if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
          if (!$wm) {
            $wm = new $WeakMap();
          }
          $weakMapSet($wm, key, value);
        } else if ($Map) {
          if (!$m) {
            $m = new $Map();
          }
          $mapSet($m, key, value);
        } else {
          if (!$o) {
            /*
             * Initialize the linked list as an empty node, so that we don't have
             * to special-case handling of the first node: we can always refer to
             * it as (previous node).next, instead of something like (list).head
             */
            $o = {
              key: {},
              next: null
            };
          }
          listSet($o, key, value);
        }
      }
    };
    return channel;
  };

  var replace = String.prototype._ES5ProxyType ? String.prototype.get("replace") : String.prototype.replace;
  var percentTwenties = /%20/g;
  var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
  };
  var formats = {
    'default': Format._ES5ProxyType ? Format.get("RFC3986") : Format.RFC3986,
    formatters: {
      RFC1738: function RFC1738(value) {
        return __callKey3(replace, "call", value, percentTwenties, '+');
      },
      RFC3986: function RFC3986(value) {
        return String(value);
      }
    },
    RFC1738: Format._ES5ProxyType ? Format.get("RFC1738") : Format.RFC1738,
    RFC3986: Format._ES5ProxyType ? Format.get("RFC3986") : Format.RFC3986
  };

  var has$2 = Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty;
  var isArray$2 = Array.compatIsArray;
  var hexTable = function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
      array.push('%' + __callKey0((i < 16 ? '0' : '') + __callKey1(i, "toString", 16), "toUpperCase"));
    }
    return array;
  }();
  var compactQueue = function compactQueue(queue) {
    while ((queue._ES5ProxyType ? queue.get("length") : queue.length) > 1) {
      var _obj, _item$prop;
      var item = queue.pop();
      var obj = (_obj = item._ES5ProxyType ? item.get("obj") : item.obj, _item$prop = item._ES5ProxyType ? item.get("prop") : item.prop, _obj._ES5ProxyType ? _obj.get(_item$prop) : _obj[_item$prop]);
      if (isArray$2(obj)) {
        var compacted = [];
        for (var j = 0; j < (obj._ES5ProxyType ? obj.get("length") : obj.length); ++j) {
          if (typeof (obj._ES5ProxyType ? obj.get(j) : obj[j]) !== 'undefined') {
            compacted.push(obj._ES5ProxyType ? obj.get(j) : obj[j]);
          }
        }
        __setKey(item._ES5ProxyType ? item.get("obj") : item.obj, item._ES5ProxyType ? item.get("prop") : item.prop, compacted);
      }
    }
  };
  var arrayToObject = function arrayToObject(source, options) {
    var obj = options && (options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) ? Object.create(null) : {};
    for (var i = 0; i < (source._ES5ProxyType ? source.get("length") : source.length); ++i) {
      if (typeof (source._ES5ProxyType ? source.get(i) : source[i]) !== 'undefined') {
        __setKey(obj, i, source._ES5ProxyType ? source.get(i) : source[i]);
      }
    }
    return obj;
  };
  var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
      return target;
    }
    if (_typeof(source) !== 'object') {
      if (isArray$2(target)) {
        target.push(source);
      } else if (target && _typeof(target) === 'object') {
        if (options && ((options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) || (options._ES5ProxyType ? options.get("allowPrototypes") : options.allowPrototypes)) || !__callKey2(has$2, "call", Object.prototype, source)) {
          __setKey(target, source, true);
        }
      } else {
        return [target, source];
      }
      return target;
    }
    if (!target || _typeof(target) !== 'object') {
      return __concat([target], source);
    }
    var mergeTarget = target;
    if (isArray$2(target) && !isArray$2(source)) {
      mergeTarget = arrayToObject(target, options);
    }
    if (isArray$2(target) && isArray$2(source)) {
      __callKey1(source, "forEach", function (item, i) {
        if (__callKey2(has$2, "call", target, i)) {
          var targetItem = target._ES5ProxyType ? target.get(i) : target[i];
          if (targetItem && _typeof(targetItem) === 'object' && item && _typeof(item) === 'object') {
            __setKey(target, i, merge(targetItem, item, options));
          } else {
            target.push(item);
          }
        } else {
          __setKey(target, i, item);
        }
      });
      return target;
    }
    return __callKey2(Object.compatKeys(source), "reduce", function (acc, key) {
      var value = source._ES5ProxyType ? source.get(key) : source[key];
      if (__callKey2(has$2, "call", acc, key)) {
        __setKey(acc, key, merge(acc._ES5ProxyType ? acc.get(key) : acc[key], value, options));
      } else {
        __setKey(acc, key, value);
      }
      return acc;
    }, mergeTarget);
  };
  var assign$1 = function assignSingleSource(target, source) {
    return __callKey2(Object.compatKeys(source), "reduce", function (acc, key) {
      __setKey(acc, key, source._ES5ProxyType ? source.get(key) : source[key]);
      return acc;
    }, target);
  };
  var decode = function decode(str, decoder, charset) {
    var strWithoutPlus = __callKey2(str, "replace", /\+/g, ' ');
    if (charset === 'iso-8859-1') {
      // unescape never throws, no try...catch needed:
      return __callKey2(strWithoutPlus, "replace", /%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
      return decodeURIComponent(strWithoutPlus);
    } catch (e) {
      return strWithoutPlus;
    }
  };
  var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if ((str._ES5ProxyType ? str.get("length") : str.length) === 0) {
      return str;
    }
    var string = str;
    if (_typeof(str) === 'symbol') {
      string = __callKey1(Symbol.prototype._ES5ProxyType ? Symbol.prototype.get("toString") : Symbol.prototype.toString, "call", str);
    } else if (typeof str !== 'string') {
      string = String(str);
    }
    if (charset === 'iso-8859-1') {
      return __callKey2(escape(string), "replace", /%u[0-9a-f]{4}/gi, function ($0) {
        return '%26%23' + parseInt(__callKey1($0, "slice", 2), 16) + '%3B';
      });
    }
    var out = '';
    for (var i = 0; i < (string._ES5ProxyType ? string.get("length") : string.length); ++i) {
      var _ref11, _ref13, _ref15, _ref17;
      var c = __callKey1(string, "charCodeAt", i);
      if (c === 0x2D // -
      || c === 0x2E // .
      || c === 0x5F // _
      || c === 0x7E // ~
      || c >= 0x30 && c <= 0x39 // 0-9
      || c >= 0x41 && c <= 0x5A // a-z
      || c >= 0x61 && c <= 0x7A // A-Z
      || format === (formats._ES5ProxyType ? formats.get("RFC1738") : formats.RFC1738) && (c === 0x28 || c === 0x29) // ( )
      ) {
        out += __callKey1(string, "charAt", i);
        continue;
      }
      if (c < 0x80) {
        out = out + (hexTable._ES5ProxyType ? hexTable.get(c) : hexTable[c]);
        continue;
      }
      if (c < 0x800) {
        var _ref, _ref3;
        out = out + ((_ref = 0xC0 | c >> 6, hexTable._ES5ProxyType ? hexTable.get(_ref) : hexTable[_ref]) + (_ref3 = 0x80 | c & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref3) : hexTable[_ref3]));
        continue;
      }
      if (c < 0xD800 || c >= 0xE000) {
        var _ref5, _ref7, _ref9;
        out = out + ((_ref5 = 0xE0 | c >> 12, hexTable._ES5ProxyType ? hexTable.get(_ref5) : hexTable[_ref5]) + (_ref7 = 0x80 | c >> 6 & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref7) : hexTable[_ref7]) + (_ref9 = 0x80 | c & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref9) : hexTable[_ref9]));
        continue;
      }
      i += 1;
      c = 0x10000 + ((c & 0x3FF) << 10 | __callKey1(string, "charCodeAt", i) & 0x3FF);
      /* eslint operator-linebreak: [2, "before"] */
      out += (_ref11 = 0xF0 | c >> 18, hexTable._ES5ProxyType ? hexTable.get(_ref11) : hexTable[_ref11]) + (_ref13 = 0x80 | c >> 12 & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref13) : hexTable[_ref13]) + (_ref15 = 0x80 | c >> 6 & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref15) : hexTable[_ref15]) + (_ref17 = 0x80 | c & 0x3F, hexTable._ES5ProxyType ? hexTable.get(_ref17) : hexTable[_ref17]);
    }
    return out;
  };
  var compact = function compact(value) {
    var queue = [{
      obj: {
        o: value
      },
      prop: 'o'
    }];
    var refs = [];
    for (var i = 0; i < (queue._ES5ProxyType ? queue.get("length") : queue.length); ++i) {
      var _obj2, _item$prop3;
      var item = queue._ES5ProxyType ? queue.get(i) : queue[i];
      var obj = (_obj2 = item._ES5ProxyType ? item.get("obj") : item.obj, _item$prop3 = item._ES5ProxyType ? item.get("prop") : item.prop, _obj2._ES5ProxyType ? _obj2.get(_item$prop3) : _obj2[_item$prop3]);
      var keys = Object.compatKeys(obj);
      for (var j = 0; j < (keys._ES5ProxyType ? keys.get("length") : keys.length); ++j) {
        var key = keys._ES5ProxyType ? keys.get(j) : keys[j];
        var val = obj._ES5ProxyType ? obj.get(key) : obj[key];
        if (_typeof(val) === 'object' && val !== null && __callKey1(refs, "indexOf", val) === -1) {
          queue.push({
            obj: obj,
            prop: key
          });
          refs.push(val);
        }
      }
    }
    compactQueue(queue);
    return value;
  };
  var isRegExp = function isRegExp(obj) {
    return __callKey1(Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString, "call", obj) === '[object RegExp]';
  };
  var isBuffer = function isBuffer(obj) {
    var _constructor;
    if (!obj || _typeof(obj) !== 'object') {
      return false;
    }
    return !!((obj._ES5ProxyType ? obj.get("constructor") : obj.constructor) && (_constructor = obj._ES5ProxyType ? obj.get("constructor") : obj.constructor, _constructor._ES5ProxyType ? _constructor.get("isBuffer") : _constructor.isBuffer) && __callKey1(obj._ES5ProxyType ? obj.get("constructor") : obj.constructor, "isBuffer", obj));
  };
  var combine = function combine(a, b) {
    return __concat([], a, b);
  };
  var maybeMap = function maybeMap(val, fn) {
    if (isArray$2(val)) {
      var mapped = [];
      for (var i = 0; i < (val._ES5ProxyType ? val.get("length") : val.length); i += 1) {
        mapped.push(fn(val._ES5ProxyType ? val.get(i) : val[i]));
      }
      return mapped;
    }
    return fn(val);
  };
  var utils = {
    arrayToObject: arrayToObject,
    assign: assign$1,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
  };

  var _formatters;
  var has$1 = Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty;
  var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
      return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
      return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
      return prefix;
    }
  };
  var isArray$1 = Array.compatIsArray;
  var push = Array.prototype._ES5ProxyType ? Array.prototype.get("compatPush") : Array.prototype.compatPush;
  var pushToArray = function pushToArray(arr, valueOrArray) {
    __callKey2(push, "apply", arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
  };
  var toISO = Date.prototype._ES5ProxyType ? Date.prototype.get("toISOString") : Date.prototype.toISOString;
  var defaultFormat = formats._ES5ProxyType ? formats.get('default') : formats['default'];
  var defaults$1 = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils._ES5ProxyType ? utils.get("encode") : utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: (_formatters = formats._ES5ProxyType ? formats.get("formatters") : formats.formatters, _formatters._ES5ProxyType ? _formatters.get(defaultFormat) : _formatters[defaultFormat]),
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
      return __callKey1(toISO, "call", date);
    },
    skipNulls: false,
    strictNullHandling: false
  };
  var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || _typeof(v) === 'symbol' || typeof v === 'bigint';
  };
  var sentinel = {};
  var stringify = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel$1) {
    var obj = object;
    var tmpSc = sideChannel$1;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = __callKey1(tmpSc, "get", sentinel)) !== void undefined && !findFlag) {
      // Where object last appeared in the ref tree
      var pos = __callKey1(tmpSc, "get", object);
      step += 1;
      if (typeof pos !== 'undefined') {
        if (pos === step) {
          throw new RangeError('Cyclic object value');
        } else {
          findFlag = true; // Break while
        }
      }

      if (typeof __callKey1(tmpSc, "get", sentinel) === 'undefined') {
        step = 0;
      }
    }
    if (typeof filter === 'function') {
      obj = filter(prefix, obj);
    } else if (_instanceof(obj, Date)) {
      obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
      obj = __callKey2(utils, "maybeMap", obj, function (value) {
        if (_instanceof(value, Date)) {
          return serializeDate(value);
        }
        return value;
      });
    }
    if (obj === null) {
      if (strictNullHandling) {
        return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1._ES5ProxyType ? defaults$1.get("encoder") : defaults$1.encoder, charset, 'key', format) : prefix;
      }
      obj = '';
    }
    if (isNonNullishPrimitive(obj) || __callKey1(utils, "isBuffer", obj)) {
      if (encoder) {
        var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1._ES5ProxyType ? defaults$1.get("encoder") : defaults$1.encoder, charset, 'key', format);
        return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults$1._ES5ProxyType ? defaults$1.get("encoder") : defaults$1.encoder, charset, 'value', format))];
      }
      return [formatter(prefix) + '=' + formatter(String(obj))];
    }
    var values = [];
    if (typeof obj === 'undefined') {
      return values;
    }
    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
      // we need to join elements in
      if (encodeValuesOnly && encoder) {
        obj = __callKey2(utils, "maybeMap", obj, encoder);
      }
      objKeys = [{
        value: (obj._ES5ProxyType ? obj.get("length") : obj.length) > 0 ? __callKey1(obj, "join", ',') || null : void undefined
      }];
    } else if (isArray$1(filter)) {
      objKeys = filter;
    } else {
      var keys = Object.compatKeys(obj);
      objKeys = sort ? __callKey1(keys, "sort", sort) : keys;
    }
    var adjustedPrefix = commaRoundTrip && isArray$1(obj) && (obj._ES5ProxyType ? obj.get("length") : obj.length) === 1 ? prefix + '[]' : prefix;
    for (var j = 0; j < (objKeys._ES5ProxyType ? objKeys.get("length") : objKeys.length); ++j) {
      var key = objKeys._ES5ProxyType ? objKeys.get(j) : objKeys[j];
      var value = _typeof(key) === 'object' && typeof (key._ES5ProxyType ? key.get("value") : key.value) !== 'undefined' ? key._ES5ProxyType ? key.get("value") : key.value : obj._ES5ProxyType ? obj.get(key) : obj[key];
      if (skipNulls && value === null) {
        continue;
      }
      var keyPrefix = isArray$1(obj) ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix : adjustedPrefix + (allowDots ? '.' + key : '[' + key + ']');
      __callKey2(sideChannel$1, "set", object, step);
      var valueSideChannel = sideChannel();
      __callKey2(valueSideChannel, "set", sentinel, sideChannel$1);
      pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, commaRoundTrip, strictNullHandling, skipNulls, generateArrayPrefix === 'comma' && encodeValuesOnly && isArray$1(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
  };
  var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    var _formatters2;
    if (!opts) {
      return defaults$1;
    }
    if ((opts._ES5ProxyType ? opts.get("encoder") : opts.encoder) !== null && typeof (opts._ES5ProxyType ? opts.get("encoder") : opts.encoder) !== 'undefined' && typeof (opts._ES5ProxyType ? opts.get("encoder") : opts.encoder) !== 'function') {
      throw new TypeError('Encoder has to be a function.');
    }
    var charset = (opts._ES5ProxyType ? opts.get("charset") : opts.charset) || (defaults$1._ES5ProxyType ? defaults$1.get("charset") : defaults$1.charset);
    if (typeof (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'undefined' && (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'utf-8' && (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'iso-8859-1') {
      throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var format = formats._ES5ProxyType ? formats.get('default') : formats['default'];
    if (typeof (opts._ES5ProxyType ? opts.get("format") : opts.format) !== 'undefined') {
      if (!__callKey2(has$1, "call", formats._ES5ProxyType ? formats.get("formatters") : formats.formatters, opts._ES5ProxyType ? opts.get("format") : opts.format)) {
        throw new TypeError('Unknown format option provided.');
      }
      format = opts._ES5ProxyType ? opts.get("format") : opts.format;
    }
    var formatter = (_formatters2 = formats._ES5ProxyType ? formats.get("formatters") : formats.formatters, _formatters2._ES5ProxyType ? _formatters2.get(format) : _formatters2[format]);
    var filter = defaults$1._ES5ProxyType ? defaults$1.get("filter") : defaults$1.filter;
    if (typeof (opts._ES5ProxyType ? opts.get("filter") : opts.filter) === 'function' || isArray$1(opts._ES5ProxyType ? opts.get("filter") : opts.filter)) {
      filter = opts._ES5ProxyType ? opts.get("filter") : opts.filter;
    }
    return {
      addQueryPrefix: typeof (opts._ES5ProxyType ? opts.get("addQueryPrefix") : opts.addQueryPrefix) === 'boolean' ? opts._ES5ProxyType ? opts.get("addQueryPrefix") : opts.addQueryPrefix : defaults$1._ES5ProxyType ? defaults$1.get("addQueryPrefix") : defaults$1.addQueryPrefix,
      allowDots: typeof (opts._ES5ProxyType ? opts.get("allowDots") : opts.allowDots) === 'undefined' ? defaults$1._ES5ProxyType ? defaults$1.get("allowDots") : defaults$1.allowDots : !!(opts._ES5ProxyType ? opts.get("allowDots") : opts.allowDots),
      charset: charset,
      charsetSentinel: typeof (opts._ES5ProxyType ? opts.get("charsetSentinel") : opts.charsetSentinel) === 'boolean' ? opts._ES5ProxyType ? opts.get("charsetSentinel") : opts.charsetSentinel : defaults$1._ES5ProxyType ? defaults$1.get("charsetSentinel") : defaults$1.charsetSentinel,
      delimiter: typeof (opts._ES5ProxyType ? opts.get("delimiter") : opts.delimiter) === 'undefined' ? defaults$1._ES5ProxyType ? defaults$1.get("delimiter") : defaults$1.delimiter : opts._ES5ProxyType ? opts.get("delimiter") : opts.delimiter,
      encode: typeof (opts._ES5ProxyType ? opts.get("encode") : opts.encode) === 'boolean' ? opts._ES5ProxyType ? opts.get("encode") : opts.encode : defaults$1._ES5ProxyType ? defaults$1.get("encode") : defaults$1.encode,
      encoder: typeof (opts._ES5ProxyType ? opts.get("encoder") : opts.encoder) === 'function' ? opts._ES5ProxyType ? opts.get("encoder") : opts.encoder : defaults$1._ES5ProxyType ? defaults$1.get("encoder") : defaults$1.encoder,
      encodeValuesOnly: typeof (opts._ES5ProxyType ? opts.get("encodeValuesOnly") : opts.encodeValuesOnly) === 'boolean' ? opts._ES5ProxyType ? opts.get("encodeValuesOnly") : opts.encodeValuesOnly : defaults$1._ES5ProxyType ? defaults$1.get("encodeValuesOnly") : defaults$1.encodeValuesOnly,
      filter: filter,
      format: format,
      formatter: formatter,
      serializeDate: typeof (opts._ES5ProxyType ? opts.get("serializeDate") : opts.serializeDate) === 'function' ? opts._ES5ProxyType ? opts.get("serializeDate") : opts.serializeDate : defaults$1._ES5ProxyType ? defaults$1.get("serializeDate") : defaults$1.serializeDate,
      skipNulls: typeof (opts._ES5ProxyType ? opts.get("skipNulls") : opts.skipNulls) === 'boolean' ? opts._ES5ProxyType ? opts.get("skipNulls") : opts.skipNulls : defaults$1._ES5ProxyType ? defaults$1.get("skipNulls") : defaults$1.skipNulls,
      sort: typeof (opts._ES5ProxyType ? opts.get("sort") : opts.sort) === 'function' ? opts._ES5ProxyType ? opts.get("sort") : opts.sort : null,
      strictNullHandling: typeof (opts._ES5ProxyType ? opts.get("strictNullHandling") : opts.strictNullHandling) === 'boolean' ? opts._ES5ProxyType ? opts.get("strictNullHandling") : opts.strictNullHandling : defaults$1._ES5ProxyType ? defaults$1.get("strictNullHandling") : defaults$1.strictNullHandling
    };
  };
  var stringify_1 = function stringify_1(object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);
    var objKeys;
    var filter;
    if (typeof (options._ES5ProxyType ? options.get("filter") : options.filter) === 'function') {
      filter = options._ES5ProxyType ? options.get("filter") : options.filter;
      obj = filter('', obj);
    } else if (isArray$1(options._ES5ProxyType ? options.get("filter") : options.filter)) {
      filter = options._ES5ProxyType ? options.get("filter") : options.filter;
      objKeys = filter;
    }
    var keys = [];
    if (_typeof(obj) !== 'object' || obj === null) {
      return '';
    }
    var arrayFormat;
    if (opts && __inKey(arrayPrefixGenerators, opts._ES5ProxyType ? opts.get("arrayFormat") : opts.arrayFormat)) {
      arrayFormat = opts._ES5ProxyType ? opts.get("arrayFormat") : opts.arrayFormat;
    } else if (opts && __inKey(opts, 'indices')) {
      arrayFormat = (opts._ES5ProxyType ? opts.get("indices") : opts.indices) ? 'indices' : 'repeat';
    } else {
      arrayFormat = 'indices';
    }
    var generateArrayPrefix = arrayPrefixGenerators._ES5ProxyType ? arrayPrefixGenerators.get(arrayFormat) : arrayPrefixGenerators[arrayFormat];
    if (opts && __inKey(opts, 'commaRoundTrip') && typeof (opts._ES5ProxyType ? opts.get("commaRoundTrip") : opts.commaRoundTrip) !== 'boolean') {
      throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    var commaRoundTrip = generateArrayPrefix === 'comma' && opts && (opts._ES5ProxyType ? opts.get("commaRoundTrip") : opts.commaRoundTrip);
    if (!objKeys) {
      objKeys = Object.compatKeys(obj);
    }
    if (options._ES5ProxyType ? options.get("sort") : options.sort) {
      __callKey1(objKeys, "sort", options._ES5ProxyType ? options.get("sort") : options.sort);
    }
    var sideChannel$1 = sideChannel();
    for (var i = 0; i < (objKeys._ES5ProxyType ? objKeys.get("length") : objKeys.length); ++i) {
      var key = objKeys._ES5ProxyType ? objKeys.get(i) : objKeys[i];
      if ((options._ES5ProxyType ? options.get("skipNulls") : options.skipNulls) && (obj._ES5ProxyType ? obj.get(key) : obj[key]) === null) {
        continue;
      }
      pushToArray(keys, stringify(obj._ES5ProxyType ? obj.get(key) : obj[key], key, generateArrayPrefix, commaRoundTrip, options._ES5ProxyType ? options.get("strictNullHandling") : options.strictNullHandling, options._ES5ProxyType ? options.get("skipNulls") : options.skipNulls, (options._ES5ProxyType ? options.get("encode") : options.encode) ? options._ES5ProxyType ? options.get("encoder") : options.encoder : null, options._ES5ProxyType ? options.get("filter") : options.filter, options._ES5ProxyType ? options.get("sort") : options.sort, options._ES5ProxyType ? options.get("allowDots") : options.allowDots, options._ES5ProxyType ? options.get("serializeDate") : options.serializeDate, options._ES5ProxyType ? options.get("format") : options.format, options._ES5ProxyType ? options.get("formatter") : options.formatter, options._ES5ProxyType ? options.get("encodeValuesOnly") : options.encodeValuesOnly, options._ES5ProxyType ? options.get("charset") : options.charset, sideChannel$1));
    }
    var joined = __callKey1(keys, "join", options._ES5ProxyType ? options.get("delimiter") : options.delimiter);
    var prefix = (options._ES5ProxyType ? options.get("addQueryPrefix") : options.addQueryPrefix) === true ? '?' : '';
    if (options._ES5ProxyType ? options.get("charsetSentinel") : options.charsetSentinel) {
      if ((options._ES5ProxyType ? options.get("charset") : options.charset) === 'iso-8859-1') {
        // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
        prefix += 'utf8=%26%2310003%3B&';
      } else {
        // encodeURIComponent('✓')
        prefix += 'utf8=%E2%9C%93&';
      }
    }
    return (joined._ES5ProxyType ? joined.get("length") : joined.length) > 0 ? prefix + joined : '';
  };

  var has = Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty;
  var isArray = Array.compatIsArray;
  var defaults = {
    allowDots: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils._ES5ProxyType ? utils.get("decode") : utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
  };
  var interpretNumericEntities = function interpretNumericEntities(str) {
    return __callKey2(str, "replace", /&#(\d+);/g, function ($0, numberStr) {
      return String.fromCharCode(parseInt(numberStr, 10));
    });
  };
  var parseArrayValue = function parseArrayValue(val, options) {
    if (val && typeof val === 'string' && (options._ES5ProxyType ? options.get("comma") : options.comma) && __callKey1(val, "indexOf", ',') > -1) {
      return __callKey1(val, "split", ',');
    }
    return val;
  };

  // This is what browsers will submit when the ✓ character occurs in an
  // application/x-www-form-urlencoded body and the encoding of the page containing
  // the form is iso-8859-1, or when the submitted form has an accept-charset
  // attribute of iso-8859-1. Presumably also with other charsets that do not contain
  // the ✓ character, such as us-ascii.
  var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

  // These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
  var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

  var parseValues = function parseQueryStringValues(str, options) {
    var obj = {
      __proto__: null
    };
    var cleanStr = (options._ES5ProxyType ? options.get("ignoreQueryPrefix") : options.ignoreQueryPrefix) ? __callKey2(str, "replace", /^\?/, '') : str;
    var limit = (options._ES5ProxyType ? options.get("parameterLimit") : options.parameterLimit) === Infinity ? undefined : options._ES5ProxyType ? options.get("parameterLimit") : options.parameterLimit;
    var parts = __callKey2(cleanStr, "split", options._ES5ProxyType ? options.get("delimiter") : options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;
    var charset = options._ES5ProxyType ? options.get("charset") : options.charset;
    if (options._ES5ProxyType ? options.get("charsetSentinel") : options.charsetSentinel) {
      for (i = 0; i < (parts._ES5ProxyType ? parts.get("length") : parts.length); ++i) {
        if (__callKey1(parts._ES5ProxyType ? parts.get(i) : parts[i], "indexOf", 'utf8=') === 0) {
          if ((parts._ES5ProxyType ? parts.get(i) : parts[i]) === charsetSentinel) {
            charset = 'utf-8';
          } else if ((parts._ES5ProxyType ? parts.get(i) : parts[i]) === isoSentinel) {
            charset = 'iso-8859-1';
          }
          skipIndex = i;
          i = parts._ES5ProxyType ? parts.get("length") : parts.length; // The eslint settings do not allow break;
        }
      }
    }

    for (i = 0; i < (parts._ES5ProxyType ? parts.get("length") : parts.length); ++i) {
      if (i === skipIndex) {
        continue;
      }
      var part = parts._ES5ProxyType ? parts.get(i) : parts[i];
      var bracketEqualsPos = __callKey1(part, "indexOf", ']=');
      var pos = bracketEqualsPos === -1 ? __callKey1(part, "indexOf", '=') : bracketEqualsPos + 1;
      var key, val;
      if (pos === -1) {
        key = __callKey4(options, "decoder", part, defaults._ES5ProxyType ? defaults.get("decoder") : defaults.decoder, charset, 'key');
        val = (options._ES5ProxyType ? options.get("strictNullHandling") : options.strictNullHandling) ? null : '';
      } else {
        key = __callKey4(options, "decoder", __callKey2(part, "slice", 0, pos), defaults._ES5ProxyType ? defaults.get("decoder") : defaults.decoder, charset, 'key');
        val = __callKey2(utils, "maybeMap", parseArrayValue(__callKey1(part, "slice", pos + 1), options), function (encodedVal) {
          return __callKey4(options, "decoder", encodedVal, defaults._ES5ProxyType ? defaults.get("decoder") : defaults.decoder, charset, 'value');
        });
      }
      if (val && (options._ES5ProxyType ? options.get("interpretNumericEntities") : options.interpretNumericEntities) && charset === 'iso-8859-1') {
        val = interpretNumericEntities(val);
      }
      if (__callKey1(part, "indexOf", '[]=') > -1) {
        val = isArray(val) ? [val] : val;
      }
      if (__callKey2(has, "call", obj, key)) {
        __setKey(obj, key, __callKey2(utils, "combine", obj._ES5ProxyType ? obj.get(key) : obj[key], val));
      } else {
        __setKey(obj, key, val);
      }
    }
    return obj;
  };
  var parseObject = function parseObject(chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);
    for (var i = (chain._ES5ProxyType ? chain.get("length") : chain.length) - 1; i >= 0; --i) {
      var obj;
      var root = chain._ES5ProxyType ? chain.get(i) : chain[i];
      if (root === '[]' && (options._ES5ProxyType ? options.get("parseArrays") : options.parseArrays)) {
        obj = __concat([], leaf);
      } else {
        obj = (options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) ? Object.create(null) : {};
        var cleanRoot = __callKey1(root, "charAt", 0) === '[' && __callKey1(root, "charAt", (root._ES5ProxyType ? root.get("length") : root.length) - 1) === ']' ? __callKey2(root, "slice", 1, -1) : root;
        var index = parseInt(cleanRoot, 10);
        if (!(options._ES5ProxyType ? options.get("parseArrays") : options.parseArrays) && cleanRoot === '') {
          obj = {
            0: leaf
          };
        } else if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && (options._ES5ProxyType ? options.get("parseArrays") : options.parseArrays) && index <= (options._ES5ProxyType ? options.get("arrayLimit") : options.arrayLimit)) {
          obj = [];
          __setKey(obj, index, leaf);
        } else if (cleanRoot !== '__proto__') {
          __setKey(obj, cleanRoot, leaf);
        }
      }
      leaf = obj;
    }
    return leaf;
  };
  var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
      return;
    }

    // Transform dot notation to bracket notation
    var key = (options._ES5ProxyType ? options.get("allowDots") : options.allowDots) ? __callKey2(givenKey, "replace", /\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = (options._ES5ProxyType ? options.get("depth") : options.depth) > 0 && __callKey1(brackets, "exec", key);
    var parent = segment ? __callKey2(key, "slice", 0, segment._ES5ProxyType ? segment.get("index") : segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
      // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
      if (!(options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) && __callKey2(has, "call", Object.prototype, parent)) {
        if (!(options._ES5ProxyType ? options.get("allowPrototypes") : options.allowPrototypes)) {
          return;
        }
      }
      keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((options._ES5ProxyType ? options.get("depth") : options.depth) > 0 && (segment = __callKey1(child, "exec", key)) !== null && i < (options._ES5ProxyType ? options.get("depth") : options.depth)) {
      i += 1;
      if (!(options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) && __callKey2(has, "call", Object.prototype, __callKey2(segment._ES5ProxyType ? segment.get(1) : segment[1], "slice", 1, -1))) {
        if (!(options._ES5ProxyType ? options.get("allowPrototypes") : options.allowPrototypes)) {
          return;
        }
      }
      keys.push(segment._ES5ProxyType ? segment.get(1) : segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
      keys.push('[' + __callKey1(key, "slice", segment._ES5ProxyType ? segment.get("index") : segment.index) + ']');
    }
    return parseObject(keys, val, options, valuesParsed);
  };
  var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
      return defaults;
    }
    if ((opts._ES5ProxyType ? opts.get("decoder") : opts.decoder) !== null && (opts._ES5ProxyType ? opts.get("decoder") : opts.decoder) !== undefined && typeof (opts._ES5ProxyType ? opts.get("decoder") : opts.decoder) !== 'function') {
      throw new TypeError('Decoder has to be a function.');
    }
    if (typeof (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'undefined' && (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'utf-8' && (opts._ES5ProxyType ? opts.get("charset") : opts.charset) !== 'iso-8859-1') {
      throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof (opts._ES5ProxyType ? opts.get("charset") : opts.charset) === 'undefined' ? defaults._ES5ProxyType ? defaults.get("charset") : defaults.charset : opts._ES5ProxyType ? opts.get("charset") : opts.charset;
    return {
      allowDots: typeof (opts._ES5ProxyType ? opts.get("allowDots") : opts.allowDots) === 'undefined' ? defaults._ES5ProxyType ? defaults.get("allowDots") : defaults.allowDots : !!(opts._ES5ProxyType ? opts.get("allowDots") : opts.allowDots),
      allowPrototypes: typeof (opts._ES5ProxyType ? opts.get("allowPrototypes") : opts.allowPrototypes) === 'boolean' ? opts._ES5ProxyType ? opts.get("allowPrototypes") : opts.allowPrototypes : defaults._ES5ProxyType ? defaults.get("allowPrototypes") : defaults.allowPrototypes,
      allowSparse: typeof (opts._ES5ProxyType ? opts.get("allowSparse") : opts.allowSparse) === 'boolean' ? opts._ES5ProxyType ? opts.get("allowSparse") : opts.allowSparse : defaults._ES5ProxyType ? defaults.get("allowSparse") : defaults.allowSparse,
      arrayLimit: typeof (opts._ES5ProxyType ? opts.get("arrayLimit") : opts.arrayLimit) === 'number' ? opts._ES5ProxyType ? opts.get("arrayLimit") : opts.arrayLimit : defaults._ES5ProxyType ? defaults.get("arrayLimit") : defaults.arrayLimit,
      charset: charset,
      charsetSentinel: typeof (opts._ES5ProxyType ? opts.get("charsetSentinel") : opts.charsetSentinel) === 'boolean' ? opts._ES5ProxyType ? opts.get("charsetSentinel") : opts.charsetSentinel : defaults._ES5ProxyType ? defaults.get("charsetSentinel") : defaults.charsetSentinel,
      comma: typeof (opts._ES5ProxyType ? opts.get("comma") : opts.comma) === 'boolean' ? opts._ES5ProxyType ? opts.get("comma") : opts.comma : defaults._ES5ProxyType ? defaults.get("comma") : defaults.comma,
      decoder: typeof (opts._ES5ProxyType ? opts.get("decoder") : opts.decoder) === 'function' ? opts._ES5ProxyType ? opts.get("decoder") : opts.decoder : defaults._ES5ProxyType ? defaults.get("decoder") : defaults.decoder,
      delimiter: typeof (opts._ES5ProxyType ? opts.get("delimiter") : opts.delimiter) === 'string' || __callKey1(utils, "isRegExp", opts._ES5ProxyType ? opts.get("delimiter") : opts.delimiter) ? opts._ES5ProxyType ? opts.get("delimiter") : opts.delimiter : defaults._ES5ProxyType ? defaults.get("delimiter") : defaults.delimiter,
      // eslint-disable-next-line no-implicit-coercion, no-extra-parens
      depth: typeof (opts._ES5ProxyType ? opts.get("depth") : opts.depth) === 'number' || (opts._ES5ProxyType ? opts.get("depth") : opts.depth) === false ? +(opts._ES5ProxyType ? opts.get("depth") : opts.depth) : defaults._ES5ProxyType ? defaults.get("depth") : defaults.depth,
      ignoreQueryPrefix: (opts._ES5ProxyType ? opts.get("ignoreQueryPrefix") : opts.ignoreQueryPrefix) === true,
      interpretNumericEntities: typeof (opts._ES5ProxyType ? opts.get("interpretNumericEntities") : opts.interpretNumericEntities) === 'boolean' ? opts._ES5ProxyType ? opts.get("interpretNumericEntities") : opts.interpretNumericEntities : defaults._ES5ProxyType ? defaults.get("interpretNumericEntities") : defaults.interpretNumericEntities,
      parameterLimit: typeof (opts._ES5ProxyType ? opts.get("parameterLimit") : opts.parameterLimit) === 'number' ? opts._ES5ProxyType ? opts.get("parameterLimit") : opts.parameterLimit : defaults._ES5ProxyType ? defaults.get("parameterLimit") : defaults.parameterLimit,
      parseArrays: (opts._ES5ProxyType ? opts.get("parseArrays") : opts.parseArrays) !== false,
      plainObjects: typeof (opts._ES5ProxyType ? opts.get("plainObjects") : opts.plainObjects) === 'boolean' ? opts._ES5ProxyType ? opts.get("plainObjects") : opts.plainObjects : defaults._ES5ProxyType ? defaults.get("plainObjects") : defaults.plainObjects,
      strictNullHandling: typeof (opts._ES5ProxyType ? opts.get("strictNullHandling") : opts.strictNullHandling) === 'boolean' ? opts._ES5ProxyType ? opts.get("strictNullHandling") : opts.strictNullHandling : defaults._ES5ProxyType ? defaults.get("strictNullHandling") : defaults.strictNullHandling
    };
  };
  var parse = function parse(str, opts) {
    var options = normalizeParseOptions(opts);
    if (str === '' || str === null || typeof str === 'undefined') {
      return (options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) ? Object.create(null) : {};
    }
    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = (options._ES5ProxyType ? options.get("plainObjects") : options.plainObjects) ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.compatKeys(tempObj);
    for (var i = 0; i < (keys._ES5ProxyType ? keys.get("length") : keys.length); ++i) {
      var key = keys._ES5ProxyType ? keys.get(i) : keys[i];
      var newObj = parseKeys(key, tempObj._ES5ProxyType ? tempObj.get(key) : tempObj[key], options, typeof str === 'string');
      obj = __callKey3(utils, "merge", obj, newObj, options);
    }
    if ((options._ES5ProxyType ? options.get("allowSparse") : options.allowSparse) === true) {
      return obj;
    }
    return __callKey1(utils, "compact", obj);
  };

  var lib = {
    formats: formats,
    parse: parse,
    stringify: stringify_1
  };

  var _interceptors;
  (location._ES5ProxyType ? location.get("protocol") : location.protocol) + "//apps.game.qq.com";
  __setKey(axios$1._ES5ProxyType ? axios$1.get("defaults") : axios$1.defaults, "withCredentials", true);
  __callKey2((_interceptors = axios$1._ES5ProxyType ? axios$1.get("interceptors") : axios$1.interceptors, _interceptors._ES5ProxyType ? _interceptors.get("response") : _interceptors.response), "use", function (response) {
    var data = response._ES5ProxyType ? response.get("data") : response.data;
    return data;
  }, function (error) {
    // response error callback
    return Promise.reject(error);
  });
  // send to IDE
  var sendToIDE = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee(params, domain) {
      var tempUrl, data;
      return __callKey2(regenerator, "wrap", function _callee$(_context) {
        while (1) {
          switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
            case 0:
              tempUrl = (Config._ES5ProxyType ? Config.get("ideApi") : Config.ideApi) ? Config._ES5ProxyType ? Config.get("ideApi") : Config.ideApi : __concat(__concat("", location._ES5ProxyType ? location.get("protocol") : location.protocol, "//"), domain, "/ide/");
              data = __callKey1(lib, "stringify", params);
              __setKey(_context, "next", 4);
              return axios$1({
                method: 'POST',
                headers: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true,
                data: data,
                url: tempUrl
              });
            case 4:
              return __callKey2(_context, "abrupt", "return", _context._ES5ProxyType ? _context.get("sent") : _context.sent);
            case 5:
            case "end":
              return __callKey0(_context, "stop");
          }
        }
      }, _callee);
    }));
    return function sendToIDE(_x, _x2) {
      return __callKey2(_ref, "apply", this, arguments);
    };
  }();
  /**
   * get activity info
   * @param params
   */
  var getActInfo = function getActInfo(params) {
    if (!(Config._ES5ProxyType ? Config.get("activityApi") : Config.activityApi)) {
      return Promise.reject("activityApi is not null");
    }
    var regex = /page\/.*/;
    var newUrl = __callKey2(Config._ES5ProxyType ? Config.get("activityApi") : Config.activityApi, "replace", regex, "page/" + (params._ES5ProxyType ? params.get("actId") : params.actId));
    return __callKey2(axios$1, "get", __concat("", newUrl), {
      withCredentials: true
    });
  };
  /**
   * get tg odp activity info
   * @param params
   * @returns
   */
  var getTgodpActInfo = function getTgodpActInfo(params) {
    var activityId = __callKey0(params._ES5ProxyType ? params.get("actId") : params.actId, "toString");
    var iActIdLength = activityId._ES5ProxyType ? activityId.get("length") : activityId.length;
    var folder = __callKey2(activityId, "slice", iActIdLength - 3, iActIdLength);
    return __callKey2(axios$1, "get", __concat(__concat(__concat(__concat("", location._ES5ProxyType ? location.get("protocol") : location.protocol, "//"), location._ES5ProxyType ? location.get("host") : location.host, "/comm-htdocs/js/ams/actDesc/"), folder, "/"), activityId, "/gmi_act.desc.js"), {
      withCredentials: true
    });
  };
  /**
   * get language package info
   */
  function getCurrentLangInfo() {
    return new Promise(function (resolve) {
      if (__callKey1(document, "getElementById", __concat("lang_", Config._ES5ProxyType ? Config.get("defaultLang") : Config.defaultLang))) {
        resolve((window._ES5ProxyType ? window.get("LANG") : window.LANG) || {});
      } else {
        loadScript({
          url: __concat(__concat("", Config._ES5ProxyType ? Config.get("langUrl") : Config.langUrl, "lang_"), Config._ES5ProxyType ? Config.get("defaultLang") : Config.defaultLang, ".js"),
          id: __concat("lang_", Config._ES5ProxyType ? Config.get("defaultLang") : Config.defaultLang),
          callback: function callback() {
            resolve((window._ES5ProxyType ? window.get("LANG") : window.LANG) || {});
          }
        });
      }
    });
  }
  /**
   * send flow http request
   */
  var sendToAME = function sendToAME(params, url) {
    var data = __callKey1(lib, "stringify", params);
    return axios$1({
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true,
      data: data,
      url: url
    });
  };

  var LANG = {
    "noFlow": "No relevant process information found",
    "abnormal": "Sorry, the system is busy. Please try again later!",
    "validError": "Parameter error, please check!",
    "loading": "Data loading",
    "claimed": "claimed",
    "unclaimed": "unclaimed",
    "winningTime": "Winning Time",
    "winningRegion": "Winning Region",
    "winningPrize": "Prize",
    "winningQuantities": "Prize Quantity",
    "status": "status",
    "systemError": "System error, please try again later!"
  };

  var _ref, _ref2;
  var userAgent = __callKey0(navigator._ES5ProxyType ? navigator.get("userAgent") : navigator.userAgent, "toLowerCase");
  var browser = {
    version: (_ref = __callKey1(userAgent, "match", /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, "0"], _ref._ES5ProxyType ? _ref.get(1) : _ref[1]),
    webkit: __callKey1(/webkit/, "test", userAgent),
    opera: __callKey1(/opera/, "test", userAgent),
    msie: __callKey1(/msie/, "test", userAgent) && !__callKey1(/opera/, "test", userAgent),
    mozilla: __callKey1(/mozilla/, "test", userAgent) && !__callKey1(/(compatible|webkit)/, "test", userAgent),
    tt: __callKey1(/tencenttraveler/, "test", userAgent),
    chrome: __callKey1(/chrome/, "test", userAgent),
    firefox: __callKey1(/firefox/, "test", userAgent),
    safari: __callKey1(/safari/, "test", userAgent),
    gecko: __callKey1(/gecko/, "test", userAgent),
    //@ts-ignore
    ie6: __callKey1(/msie/, "test", userAgent) && !__callKey1(/opera/, "test", userAgent) && __callKey2((_ref2 = __callKey1(userAgent, "match", /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, "0"], _ref2._ES5ProxyType ? _ref2.get(1) : _ref2[1]), "substr", 0, 1) == "6"
  };
  /**
   * check flow params
   * @param flow input flow info
   */
  function checkParams(flow) {
    if (flow && (flow._ES5ProxyType ? flow.get("actId") : flow.actId) && ((flow._ES5ProxyType ? flow.get("token") : flow.token) || (flow._ES5ProxyType ? flow.get("flowId") : flow.flowId))) {
      return true;
    }
    return false;
  }
  /**
   * set common info
   * @param config
   */
  function setCommonConfig(_x) {
    return __callKey2(_setCommonConfig, "apply", this, arguments);
  }
  /**
   * deal ide interface response
   * @param res content
   */
  function _setCommonConfig() {
    _setCommonConfig = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee(config) {
      var data;
      return __callKey4(regenerator, "wrap", function _callee$(_context) {
        while (1) {
          switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
            case 0:
              // merge custom config
              Object.compatAssign(Config, config);
              data = null;
              __setKey(_context, "prev", 2);
              __setKey(_context, "next", 5);
              return getCurrentLangInfo();
            case 5:
              data = _context._ES5ProxyType ? _context.get("sent") : _context.sent;
              __setKey(_context, "next", 11);
              break;
            case 8:
              __setKey(_context, "prev", 8);
              __setKey(_context, "t0", __callKey1(_context, "catch", 2));
              __callKey1(console, "error", _context._ES5ProxyType ? _context.get("t0") : _context.t0);
            case 11:
              __setKey(_context, "prev", 11);
              Object.compatAssign(LANG, data);
              return __callKey1(_context, "finish", 11);
            case 14:
            case "end":
              return __callKey0(_context, "stop");
          }
        }
      }, _callee, null, [[2, 8, 11, 14]]);
    }));
    return __callKey2(_setCommonConfig, "apply", this, arguments);
  }
  function dealIDEResponse(res) {
    var newRes = {
      iRet: (res._ES5ProxyType ? res.get("iRet") : res.iRet) === undefined ? res._ES5ProxyType ? res.get("ret") : res.ret : res._ES5ProxyType ? res.get("iRet") : res.iRet,
      sMsg: (res._ES5ProxyType ? res.get("sMsg") : res.sMsg) || (res._ES5ProxyType ? res.get("msg") : res.msg) || ((res._ES5ProxyType ? res.get("iRet") : res.iRet) != 0 ? LANG._ES5ProxyType ? LANG.get("abnormal") : LANG.abnormal : ''),
      sAmsSerial: (res._ES5ProxyType ? res.get("sAmsSerial") : res.sAmsSerial) || '',
      details: res
    };
    return newRes;
  }
  /**
   * check user now environment
   */
  function checkCurrentEnv() {
    if (__callKey1(location._ES5ProxyType ? location.get("href") : location.href, "indexOf", 'sTicket') > -1) {
      return 'ingame';
    }
  }
  /**
   * get url params
   */
  function getUrlParams(url) {
    var _url$split;
    var params = {};
    if (!url) {
      url = location._ES5ProxyType ? location.get("href") : location.href;
    }
    var queryString = (_url$split = __callKey1(url, "split", '?'), _url$split._ES5ProxyType ? _url$split.get(1) : _url$split[1]);
    //const hashString = url.split('#')[1];
    if (queryString) {
      var queryPairs = __callKey1(queryString, "split", '&');
      __callKey1(queryPairs, "forEach", function (pair) {
        var _pair$split = __callKey1(pair, "split", '='),
          _pair$split2 = _slicedToArray(_pair$split, 2),
          key = _pair$split2._ES5ProxyType ? _pair$split2.get(0) : _pair$split2[0],
          value = _pair$split2._ES5ProxyType ? _pair$split2.get(1) : _pair$split2[1];
        __setKey(params, decodeURIComponent(key), decodeURIComponent(value));
      });
    }
    // if (hashString) {
    //     const hashPairs = hashString.split('/?')[1].split('&');
    //     hashPairs.forEach(pair => {
    //         const [key, value] = pair.split('=');
    //         params[decodeURIComponent(key)] = decodeURIComponent(value);
    //     });
    // }
    return params;
  }
  /**
   * load script
   * @param url script url
   * @param callback  callback function
   * @param type  load charset
   */
  function loadScript(params) {
    var _document$getElements;
    var head = (_document$getElements = __callKey1(document, "getElementsByTagName", 'head'), _document$getElements._ES5ProxyType ? _document$getElements.get(0) : _document$getElements[0]);
    var script = __callKey1(document, "createElement", 'script');
    __setKey(script, "type", 'text/javascript');
    if (script._ES5ProxyType ? script.get("readyState") : script.readyState) {
      //IE
      __setKey(script, "onreadystatechange", function () {
        if ((this._ES5ProxyType ? this.get("readyState") : this.readyState) == 'complete' || (script._ES5ProxyType ? script.get("readyState") : script.readyState) == "loaded") {
          __setKey(script, "onreadystatechange", null);
          if (typeof (params._ES5ProxyType ? params.get("callback") : params.callback) === 'function') {
            __callKey0(params, "callback");
          }
        }
      });
    } else {
      //other browser
      __setKey(script, "onload", function () {
        if (typeof (params._ES5ProxyType ? params.get("callback") : params.callback) === 'function') {
          __callKey0(params, "callback");
        }
      });
    }
    __setKey(script, "src", params._ES5ProxyType ? params.get("url") : params.url);
    __setKey(script, "onerror", function () {
      if (typeof (params._ES5ProxyType ? params.get("callback") : params.callback) === 'function') {
        __callKey1(params, "callback", 'error');
      }
    });
    if (params._ES5ProxyType ? params.get("type") : params.type) {
      __setKey(script, "charset", params._ES5ProxyType ? params.get("type") : params.type);
    }
    if (params._ES5ProxyType ? params.get("id") : params.id) {
      __setKey(script, "id", params._ES5ProxyType ? params.get("id") : params.id);
    }
    __callKey1(head, "appendChild", script);
  }
  /**
   * Overload protection check
   * @returns
   */
  function ameCSRFToken() {
    var _getLoginInfo;
    var sAMEStr = checkCurrentEnv() === 'ingame' && (_getLoginInfo = getLoginInfo(), _getLoginInfo._ES5ProxyType ? _getLoginInfo.get("sTicket") : _getLoginInfo.sTicket) || 'a1b2c3';
    var hash = 5381;
    var len = sAMEStr._ES5ProxyType ? sAMEStr.get("length") : sAMEStr.length;
    for (var i = 0; i < len; ++i) {
      hash += (hash << 5) + __callKey0(__callKey1(sAMEStr, "charAt", i), "charCodeAt");
    }
    return hash & 0x7fffffff;
  }
  /**
   * Process the returned information from the AMS interface
   * @param url The URL to be processed
  */
  function dealAMSResponse(res) {
    /**
     * Return error code logic, prioritize modRet; if modRet is not available, take flowRet; if flowRet is not available, take res
     * res returns ret and msg
    */
    var temp_res = (res._ES5ProxyType ? res.get("modRet") : res.modRet) ? res._ES5ProxyType ? res.get("modRet") : res.modRet : (res._ES5ProxyType ? res.get("flowRet") : res.flowRet) ? res._ES5ProxyType ? res.get("flowRet") : res.flowRet : res;
    var newRes = {
      iRet: (temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) === undefined ? temp_res._ES5ProxyType ? temp_res.get("ret") : temp_res.ret : temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet,
      sMsg: (temp_res._ES5ProxyType ? temp_res.get("sMsg") : temp_res.sMsg) || (temp_res._ES5ProxyType ? temp_res.get("msg") : temp_res.msg) || ((res._ES5ProxyType ? res.get("iRet") : res.iRet) != 0 ? LANG._ES5ProxyType ? LANG.get("abnormal") : LANG.abnormal : ''),
      sAmsSerial: (temp_res._ES5ProxyType ? temp_res.get("sAMSSerial") : temp_res.sAMSSerial) || (temp_res._ES5ProxyType ? temp_res.get("sLogSerialNum") : temp_res.sLogSerialNum) || '',
      details: res
    };
    if (res._ES5ProxyType ? res.get("jData") : res.jData) {
      __setKey(newRes, "data", res._ES5ProxyType ? res.get("jData") : res.jData);
    }
    return newRes;
  }
  /**
   * Serialize a JSON object to a string
   * @param jsonObj The JSON object to be serialized
   * @returns The serialized string
  */
  function serialize(jsonObj) {
    var newJsonObj = null;
    if (typeof jsonObj === 'undefined' || typeof jsonObj === 'function') newJsonObj = '';
    if (typeof jsonObj === 'number') newJsonObj = __callKey0(jsonObj, "toString");
    if (typeof jsonObj === 'boolean') newJsonObj = jsonObj ? '1' : '0';
    if (_typeof(jsonObj) === 'object') {
      if (!jsonObj) newJsonObj = '';
      if (_instanceof(jsonObj, RegExp)) newJsonObj = __callKey0(jsonObj, "toString");
    }
    if (typeof jsonObj === 'string') newJsonObj = jsonObj;
    if (typeof newJsonObj === 'string') return encodeURIComponent(newJsonObj);
    var ret = [];
    if (_instanceof(jsonObj, Array)) {
      for (var i = 0; i < (jsonObj._ES5ProxyType ? jsonObj.get("length") : jsonObj.length); i++) {
        if (typeof (jsonObj._ES5ProxyType ? jsonObj.get(i) : jsonObj[i]) === 'undefined') continue;
        ret.push(_typeof(jsonObj._ES5ProxyType ? jsonObj.get(i) : jsonObj[i]) === 'object' ? '' : serialize(jsonObj._ES5ProxyType ? jsonObj.get(i) : jsonObj[i]));
      }
      return __callKey1(ret, "join", '|');
    } else {
      for (var _i in __iterableKey(jsonObj)) {
        if (typeof (jsonObj._ES5ProxyType ? jsonObj.get(_i) : jsonObj[_i]) === 'undefined') continue;
        newJsonObj = null;
        if (_typeof(jsonObj._ES5ProxyType ? jsonObj.get(_i) : jsonObj[_i]) === 'object') {
          if (_instanceof(jsonObj._ES5ProxyType ? jsonObj.get(_i) : jsonObj[_i], Array)) {
            newJsonObj = jsonObj._ES5ProxyType ? jsonObj.get(_i) : jsonObj[_i];
            ret.push(_i + '=' + serialize(newJsonObj));
          } else {
            ret.push(_i + '=');
          }
        } else {
          newJsonObj = jsonObj._ES5ProxyType ? jsonObj.get(_i) : jsonObj[_i];
          ret.push(_i + '=' + serialize(newJsonObj));
        }
      }
      return __callKey1(ret, "join", '&');
    }
  }
  /**
   * Get the value of a parameter in the URL
   * @param {string} pa The parameter name
   * @return {string} The parameter value
   */
  function urlRequest(pa) {
    var url = __callKey2(window.location._ES5ProxyType ? window.location.get("href") : window.location.href, "replace", /#+.*$/, '');
    var params = __callKey1(__callKey2(url, "substring", __callKey1(url, "indexOf", '?') + 1, url._ES5ProxyType ? url.get("length") : url.length), "split", '&');
    var param = {};
    for (var i = 0; i < (params._ES5ProxyType ? params.get("length") : params.length); i++) {
      var pos = __callKey1(params._ES5ProxyType ? params.get(i) : params[i], "indexOf", '='); // Find name=value
      var key = __callKey2(params._ES5ProxyType ? params.get(i) : params[i], "substring", 0, pos);
      var val = __callKey1(params._ES5ProxyType ? params.get(i) : params[i], "substring", pos + 1); // Extract value
      __setKey(param, key, val);
    }
    return typeof (param._ES5ProxyType ? param.get(pa) : param[pa]) === 'undefined' ? '' : param._ES5ProxyType ? param.get(pa) : param[pa];
  }
  /**
   * Determines whether a value is an integer, with optional minimum and maximum values.
   * @param n The value to check.
   * @param iMin Optional, the minimum value.
   * @param iMax Optional, the maximum value.
   * @returns True if the value is an integer and within the specified range, otherwise false.
   */
  function isInt(n, iMin, iMax) {
    // Check if n is a finite number, return false if not.
    if (!isFinite(n)) {
      return false;
    }
    // Check if n is an integer, return false if not.
    if (!__callKey1(/^[+-]?\d+$/, "test", n)) {
      return false;
    }
    // If iMin is specified and n is less than iMin, return false.
    if (iMin != undefined && parseInt(n) < parseInt(iMin)) {
      return false;
    }
    // If iMax is specified and n is greater than iMax, return false.
    if (iMax != undefined && parseInt(n) > parseInt(iMax)) {
      return false;
    }
    // Return true if n is an integer and within the specified range.
    return true;
  }
  /**
  * Removes an event listener from an element.
  * @param _el The element to remove the event listener from.
  * @param _type The type of the event to remove.
  * @param _fn The function to remove. Optional, if not specified, all functions of the specified type will be removed.
  */
  function removeEvent(_el, _type, _fn) {
    /**
     * Removes a single event listener from an element.
     * @param el The element to remove the event listener from.
     * @param type The type of the event to remove.
     * @param fn The function to remove.
     */
    var removeSingle = function removeSingle(el, type, fn) {
      // If the browser supports removeEventListener, use it to remove the event listener.
      if (window._ES5ProxyType ? window.get("removeEventListener") : window.removeEventListener) {
        var _ref3;
        __callKey3(el, "removeEventListener", type, (_ref3 = type + fn, el._ES5ProxyType ? el.get(_ref3) : el[_ref3]), false);
        __setKey(el, type + fn, null);
        //@ts-ignore
      }
      // If the browser supports detachEvent, use it to remove the event listener.
      //@ts-ignore
      else if (window._ES5ProxyType ? window.get("detachEvent") : window.detachEvent) {
        var _ref5;
        __callKey2(el, "detachEvent", "on" + type, (_ref5 = type + fn, el._ES5ProxyType ? el.get(_ref5) : el[_ref5]));
        __setKey(el, type + fn, null);
        return;
      }
      // Otherwise, set the on[type] property to null to remove the event listener.
      else {
        __setKey(el, "on" + type, null);
      }
    };
    // If _fn is not specified, remove all functions of the specified type.
    if ("undefined" == typeof _fn) {
      for (var k in __iterableKey(_el)) {
        if (0 == __callKey1(k, "indexOf", _type) && "function" == typeof (_el._ES5ProxyType ? _el.get(k) : _el[k])) {
          removeSingle(_el, _type, __callKey1(k, "substring", _type._ES5ProxyType ? _type.get("length") : _type.length));
        }
      }
    }
    // Otherwise, remove the specified function.
    else {
      removeSingle(_el, _type, _fn);
    }
  }
  function preventDefault(e) {
    if (e._ES5ProxyType ? e.get("preventDefault") : e.preventDefault) {
      __callKey0(e, "preventDefault");
    } else {
      __setKey(e, "returnValue", false);
    }
  }
  function stopPropagation(e) {
    if (e._ES5ProxyType ? e.get("stopPropagation") : e.stopPropagation) {
      __callKey0(e, "stopPropagation");
    } else {
      __setKey(e, "cancelBubble", true);
    }
  }
  /**
   * Adds an event listener to an element.
   * @param el The element to add the event listener to.
   * @param type The type of the event to listen for.
   * @param fn The function to call when the event is triggered.
   */
  function addEvent(el, type, fn) {
    // If the browser supports addEventListener, use it to add the event listener.
    if (window._ES5ProxyType ? window.get("addEventListener") : window.addEventListener) {
      var _ref7;
      // Store the function in a property of the element, so it can be removed later.
      __setKey(el, "e" + type + fn, fn);
      // Create a new function that calls the stored function and prevents the default action and propagation if the stored function returns false.
      __setKey(el, type + fn, function (e) {
        var _e = e || (window._ES5ProxyType ? window.get("event") : window.event),
          _r = __callKey1(el, "e" + type + fn, _e);
        if (_r == false) {
          preventDefault(_e);
          stopPropagation(_e);
        }
      });
      // Add the new function as the event listener.
      __callKey3(el, "addEventListener", type, (_ref7 = type + fn, el._ES5ProxyType ? el.get(_ref7) : el[_ref7]), false);
    }
    // If the browser supports attachEvent, use it to add the event listener.
    //@ts-ignore
    else if (window._ES5ProxyType ? window.get("attachEvent") : window.attachEvent) {
      var _ref9;
      // Store the function in a property of the element, so it can be removed later.
      __setKey(el, "e" + type + fn, fn);
      // Create a new function that calls the stored function and prevents the default action if the stored function returns false.
      __setKey(el, type + fn, function (e) {
        var _r = __callKey1(el, "e" + type + fn, window._ES5ProxyType ? window.get("event") : window.event);
        if (_r == false) preventDefault(window._ES5ProxyType ? window.get("event") : window.event);
      });
      // Add the new function as the event listener.
      __callKey2(el, "attachEvent", "on" + type, (_ref9 = type + fn, el._ES5ProxyType ? el.get(_ref9) : el[_ref9]));
      return;
    }
    // Otherwise, set the on[type] property to the function to add the event listener.
    else {
      __setKey(el, "on" + type, fn);
    }
  }
  /**
   * Sets the styles of an element.
   * @param ele The element to set the styles of.
   * @param styles An object containing the styles to set.
   */
  function setStyle(ele, styles) {
    for (var i in __iterableKey(styles)) {
      __setKey(ele._ES5ProxyType ? ele.get("style") : ele.style, i, styles._ES5ProxyType ? styles.get(i) : styles[i]);
    }
  }
  /**
  * Gets the computed style of an element.
  * @param el The element to get the style of.
  * @param prop The name of the style property to get.
  * @returns The value of the specified style property.
  */
  function getStyle(el, prop) {
    var _currentStyle;
    //@ts-ignore
    var viewCSS = typeof (document._ES5ProxyType ? document.get("defaultView") : document.defaultView) === 'function' ? __callKey0(document, "defaultView") : document._ES5ProxyType ? document.get("defaultView") : document.defaultView;
    if (viewCSS && (viewCSS._ES5ProxyType ? viewCSS.get("getComputedStyle") : viewCSS.getComputedStyle)) {
      var s = __callKey2(viewCSS, "getComputedStyle", el, null);
      return s && __callKey1(s, "getPropertyValue", prop);
    }
    return (el._ES5ProxyType ? el.get("currentStyle") : el.currentStyle) && ((_currentStyle = el._ES5ProxyType ? el.get("currentStyle") : el.currentStyle, _currentStyle._ES5ProxyType ? _currentStyle.get(prop) : _currentStyle[prop]) || null) || null;
  }
  /**
  * Gets the width of the page.
  * @returns The width of the page.
  */
  function getPageWidth() {
    var _body, _body2, _body3, _body4;
    //@ts-ignore
    return (window._ES5ProxyType ? window.get("innerWidth") : window.innerWidth) && (window._ES5ProxyType ? window.get("scrollMaxX") : window.scrollMaxX) ? (window._ES5ProxyType ? window.get("innerWidth") : window.innerWidth) + (window._ES5ProxyType ? window.get("scrollMaxX") : window.scrollMaxX) : (_body = document._ES5ProxyType ? document.get("body") : document.body, _body._ES5ProxyType ? _body.get("scrollWidth") : _body.scrollWidth) > (_body2 = document._ES5ProxyType ? document.get("body") : document.body, _body2._ES5ProxyType ? _body2.get("offsetWidth") : _body2.offsetWidth) ? (_body3 = document._ES5ProxyType ? document.get("body") : document.body, _body3._ES5ProxyType ? _body3.get("scrollWidth") : _body3.scrollWidth) : (_body4 = document._ES5ProxyType ? document.get("body") : document.body, _body4._ES5ProxyType ? _body4.get("offsetWidth") : _body4.offsetWidth);
  }
  /**
  * Gets the height of the window.
  * @returns The height of the window.
  */
  function getWinHeight() {
    var _documentElement, _documentElement2, _body5;
    return (window._ES5ProxyType ? window.get("innerHeight") : window.innerHeight) ? window._ES5ProxyType ? window.get("innerHeight") : window.innerHeight : (document._ES5ProxyType ? document.get("documentElement") : document.documentElement) && (_documentElement = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement._ES5ProxyType ? _documentElement.get("clientHeight") : _documentElement.clientHeight) ? (_documentElement2 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement2._ES5ProxyType ? _documentElement2.get("clientHeight") : _documentElement2.clientHeight) : (_body5 = document._ES5ProxyType ? document.get("body") : document.body, _body5._ES5ProxyType ? _body5.get("offsetHeight") : _body5.offsetHeight);
  }
  /**
  * Gets the width of the window.
  * @returns The width of the window.
  */
  function getWinWidth() {
    var _documentElement3, _documentElement4, _body6;
    return (window._ES5ProxyType ? window.get("innerWidth") : window.innerWidth) ? window._ES5ProxyType ? window.get("innerWidth") : window.innerWidth : (document._ES5ProxyType ? document.get("documentElement") : document.documentElement) && (_documentElement3 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement3._ES5ProxyType ? _documentElement3.get("clientWidth") : _documentElement3.clientWidth) ? (_documentElement4 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement4._ES5ProxyType ? _documentElement4.get("clientWidth") : _documentElement4.clientWidth) : (_body6 = document._ES5ProxyType ? document.get("body") : document.body, _body6._ES5ProxyType ? _body6.get("offsetWidth") : _body6.offsetWidth);
  }
  /**
  * Gets the height of the page.
  * @returns The height of the page.
  */
  function getPageHeight() {
    var _body7, _body8, _body9, _body10, _documentElement5, _documentElement6;
    //@ts-ignore
    var h = (window._ES5ProxyType ? window.get("innerHeight") : window.innerHeight) && (window._ES5ProxyType ? window.get("scrollMaxY") : window.scrollMaxY) ? (window._ES5ProxyType ? window.get("innerHeight") : window.innerHeight) + (window._ES5ProxyType ? window.get("scrollMaxY") : window.scrollMaxY) : (_body7 = document._ES5ProxyType ? document.get("body") : document.body, _body7._ES5ProxyType ? _body7.get("scrollHeight") : _body7.scrollHeight) > (_body8 = document._ES5ProxyType ? document.get("body") : document.body, _body8._ES5ProxyType ? _body8.get("offsetHeight") : _body8.offsetHeight) ? (_body9 = document._ES5ProxyType ? document.get("body") : document.body, _body9._ES5ProxyType ? _body9.get("scrollHeight") : _body9.scrollHeight) : (_body10 = document._ES5ProxyType ? document.get("body") : document.body, _body10._ES5ProxyType ? _body10.get("offsetHeight") : _body10.offsetHeight);
    return h > (_documentElement5 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement5._ES5ProxyType ? _documentElement5.get("scrollHeight") : _documentElement5.scrollHeight) ? h : (_documentElement6 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement6._ES5ProxyType ? _documentElement6.get("scrollHeight") : _documentElement6.scrollHeight);
  }
  /**
  * Gets the maximum width of the page.
  * @returns The maximum width of the page.
  */
  function getMaxW() {
    return getPageWidth() > getWinWidth() ? getPageWidth() : getWinWidth();
  }
  /**
  * Gets the maximum height of the page.
  * @returns The maximum height of the page.
  */
  function getMaxH() {
    return getPageHeight() > getWinHeight() ? getPageHeight() : getWinHeight();
  }

  /**
   * get login info
   */
  function getLoginInfo() {
    var loginInfo = {};
    if (checkCurrentEnv() === 'ingame') {
      var params = getUrlParams();
      __setKey(loginInfo, "sTicket", params._ES5ProxyType ? params.get("sTicket") : params.sTicket);
    }
    return loginInfo;
  }
  /**
   * get browser default language
   */
  function getDefaultLang() {
    // @ts-ignore
    var userLang = (navigator._ES5ProxyType ? navigator.get("language") : navigator.language) || (navigator._ES5ProxyType ? navigator.get("userLanguage") : navigator.userLanguage);
    var lang = 'en';
    if (__callKey1(/^zh\b/, "test", userLang)) {
      lang = 'cn';
    }
    return lang;
  }

  var Config = {
    langUrl: __concat("https://", location._ES5ProxyType ? location.get("host") : location.host, "/sgp/milo-next/lang/"),
    imagesUrl: __concat("https://", location._ES5ProxyType ? location.get("host") : location.host, "/sgp/milo-next/images/"),
    needPromiseCallback: false,
    rolePromise: '',
    ideApi: '',
    activityApi: '',
    gameId: '',
    customizeAreaStyle: false,
    defaultLang: getDefaultLang()
  };

  var Pagination$1 = {
    pageNow: "iPageNow",
    pageSize: "iPageSize"
  };
  var PersonInfo$2 = {
    query: 'iShowHistory'
  };

  var Pagination = {
    pageNow: "iPageNow",
    pageSize: "iPageSize"
  };
  var PersonInfo$1 = {
    query: 'iShow'
  };

  /**
   * params valid error
   */
  var ParamError = {
    iRet: -9999,
    sMsg: LANG._ES5ProxyType ? LANG.get("validError") : LANG.validError
  };
  var RoleData = {
    Farea: 'area',
    FPartition: 'partition',
    FareaName: 'areaName',
    Fcheckparam: 'checkparam',
    Fmd5str: 'md5str',
    FplatId: 'platId',
    FroleId: 'roleId',
    FroleName: 'roleName',
    sAmsNewRoleId: 'newRoleId'
  };
  function getRoleData(data) {
    var roleInfo = {};
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("Farea") : RoleData.Farea, data._ES5ProxyType ? data.get("Farea") : data.Farea);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("FPartition") : RoleData.FPartition, data._ES5ProxyType ? data.get("FPartition") : data.FPartition);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("FareaName") : RoleData.FareaName, decodeURIComponent(data._ES5ProxyType ? data.get("FareaName") : data.FareaName));
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("Fcheckparam") : RoleData.Fcheckparam, data._ES5ProxyType ? data.get("Fcheckparam") : data.Fcheckparam);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("Fmd5str") : RoleData.Fmd5str, data._ES5ProxyType ? data.get("Fmd5str") : data.Fmd5str);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("FplatId") : RoleData.FplatId, data._ES5ProxyType ? data.get("FplatId") : data.FplatId);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("FroleId") : RoleData.FroleId, data._ES5ProxyType ? data.get("FroleId") : data.FroleId);
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("FroleName") : RoleData.FroleName, decodeURIComponent(data._ES5ProxyType ? data.get("FroleName") : data.FroleName));
    __setKey(roleInfo, RoleData._ES5ProxyType ? RoleData.get("sAmsNewRoleId") : RoleData.sAmsNewRoleId, data._ES5ProxyType ? data.get("sAmsNewRoleId") : data.sAmsNewRoleId);
    return roleInfo;
  }
  /**
   * Pagination
   */
  function getPaginationData(plat) {
    return plat === 'ams' ? Pagination : Pagination$1;
  }
  /**
   * Person information
   */
  function getPersonInfo(plat) {
    return plat === 'ams' ? PersonInfo$1 : PersonInfo$2;
  }

  var apiLoaderLayerClassName = "__milo_loader_layer__";
  var defaultParams = {
    layerBgColor: "0,0,0",
    opacity: 0.5,
    // msg
    text: LANG._ES5ProxyType ? LANG.get("loading") : LANG.loading,
    // font color
    textColor: "#fff",
    // loading icon
    icon: "/loading.png"
  };
  /**
   * create dom content
   * @param params
   */
  function domContainer(params) {
    var winHeight = window._ES5ProxyType ? window.get("innerHeight") : window.innerHeight;
    var top = winHeight / 2;
    var dom = __concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat(__concat("\n<style>\n#", apiLoaderLayerClassName, "{font-size:12px;width:100%;height:"), winHeight * 1.1, "px;position: fixed;left:0;top:0;z-index:10000;background: rgba("), params._ES5ProxyType ? params.get("layerBgColor") : params.layerBgColor, ","), params._ES5ProxyType ? params.get("opacity") : params.opacity, ")}\n#"), apiLoaderLayerClassName, " #loading-con{width:100%;position:fixed;height:29px;text-align: center;display: block;margin:0 auto;margin-top:"), top, "px}\n#"), apiLoaderLayerClassName, " .loading-con--icon{height:29px;text-align: center;display: block;margin:0 auto;}\n#"), apiLoaderLayerClassName, " .loading-con--icon img{width:auto;height:100%;display:inline-block;animation: "), apiLoaderLayerClassName, "_rotate 1s 0s linear infinite;}\n#"), apiLoaderLayerClassName, " #loading-con p{text-align: center;color:"), params._ES5ProxyType ? params.get("textColor") : params.textColor, ";line-height: 40px; }\n@keyframes "), apiLoaderLayerClassName, "_rotate {\n  0% {transform: rotate(0deg); }\n  50% {transform: rotate(180deg); }\n  100% {transform: rotate(360deg);} \n}\n</style>\n<div id=\"loading-con\">\n  <span class=\"loading-con--icon\" style=\"\"><img src=\""), params._ES5ProxyType ? params.get("icon") : params.icon, "\"></span>\n  <p>"), params._ES5ProxyType ? params.get("text") : params.text, "</p>  \n</div>\n");
    return dom;
  }
  /**
   * created dom element
   * @param params
   */
  function createDom(params) {
    var wrapDom = __callKey1(document, "createElement", "div");
    __callKey2(wrapDom, "setAttribute", "id", apiLoaderLayerClassName);
    __setKey(wrapDom, "innerHTML", domContainer(params));
    __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", wrapDom);
  }
  /**
   * is show loading layer
   * @param {apiLoaderLayerParams} params - params
   */
  function showLoading(params) {
    var _a;
    if (_typeof(params) !== "object" && !params) {
      return;
    }
    __setKey(defaultParams, "icon", __concat("", Config._ES5ProxyType ? Config.get("imagesUrl") : Config.imagesUrl, "/loading.png"));
    var p = Object.compatAssign({}, defaultParams, params);
    var layer = __callKey1(document, "getElementById", apiLoaderLayerClassName);
    // if layer isn't dom, it will create new dom
    if (!layer) {
      createDom(p);
      return;
    }
    // isn't compaire dom element  same
    if ((layer._ES5ProxyType ? layer.get("outerHTML") : layer.outerHTML) === domContainer(p)) {
      if (!layer) {
        createDom(p);
      } else {
        __setKey(layer._ES5ProxyType ? layer.get("style") : layer.style, "display", "block");
      }
    } else {
      (_a = layer._ES5ProxyType ? layer.get("parentNode") : layer.parentNode) === null || _a === void 0 ? void 0 : __callKey1(_a, "removeChild", layer);
      createDom(p);
    }
  }
  /**
   * hide loading layer
   */
  function hideLoading() {
    var layer = __callKey1(document, "getElementById", apiLoaderLayerClassName);
    if (!layer) return;
    __setKey(layer._ES5ProxyType ? layer.get("style") : layer.style, "display", "none");
  }

  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey(obj, key, value);
    }
    return obj;
  }

  var LotteryRecord = /*#__PURE__*/function () {
    function LotteryRecord(plat, url, data, flowObj, callback) {
      _classCallCheck(this, LotteryRecord);
      // API request parameters
      __setKey(this, "flowObj", {
        actId: '',
        token: ''
      });
      // Pagination settings
      __setKey(this, "Pagination", {
        pageNow: 1,
        pageSize: 10 // Current page number
      });

      __setKey(this, "flowObj", flowObj);
      // Set the number of items per page
      __setKey(this._ES5ProxyType ? this.get("Pagination") : this.Pagination, "pageSize", (data._ES5ProxyType ? data.get("pageSize") : data.pageSize) || 10);
      // If customized, set pageNow to switch data
      __setKey(this._ES5ProxyType ? this.get("Pagination") : this.Pagination, "pageNow", (data._ES5ProxyType ? data.get("pageNow") : data.pageNow) || 1);
      __setKey(this, "callback", callback);
      // handle lottery record before send http request
      __callKey3(this, "handlerLotteryRecord", plat, url, data);
    }
    /**
     * deal with lottery data by ame or ide
     * @param plat ame or ide
     * @param url post url
     * @param data post data
     */
    _createClass(LotteryRecord, [{
      key: "postData",
      value: function postData(plat, url, data) {
        var _flowObj;
        var self = this;
        showLoading((_flowObj = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("loading") : _flowObj.loading));
        var sendFn = plat === 'ams' ? sendToAME : sendToIDE;
        __callKey1(sendFn(data, url), "then", function (res) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          hideLoading();
          var temp_res = plat === 'ams' ? dealAMSResponse(res) : dealIDEResponse(res);
          // in overseas lottery.history edited gift
          __setKey(temp_res, "data", (plat === 'ams' ? (_b = (_a = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("modRet") : _a.modRet) === null || _b === void 0 ? void 0 : _b._ES5ProxyType ? _b.get("myGiftList") : _b.myGiftList : (_e = (_d = (_c = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _c === void 0 ? void 0 : _c._ES5ProxyType ? _c.get("jData") : _c.jData) === null || _d === void 0 ? void 0 : _d._ES5ProxyType ? _d.get("gift") : _d.gift) === null || _e === void 0 ? void 0 : _e._ES5ProxyType ? _e.get("myGiftList") : _e.myGiftList) || []);
          __setKey(temp_res, "total", (plat === 'ams' ? (_g = (_f = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _f === void 0 ? void 0 : _f._ES5ProxyType ? _f.get("modRet") : _f.modRet) === null || _g === void 0 ? void 0 : _g._ES5ProxyType ? _g.get("pageTotal") : _g.pageTotal : (_l = (_k = (_j = (_h = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _h === void 0 ? void 0 : _h._ES5ProxyType ? _h.get("jData") : _h.jData) === null || _j === void 0 ? void 0 : _j._ES5ProxyType ? _j.get("gift") : _j.gift) === null || _k === void 0 ? void 0 : _k._ES5ProxyType ? _k.get("result") : _k.result) === null || _l === void 0 ? void 0 : _l._ES5ProxyType ? _l.get("nTotalInALL") : _l.nTotalInALL) || 1);
          if (plat === 'ide') {
            var _Pagination;
            __setKey(temp_res, "total", Math.ceil((temp_res._ES5ProxyType ? temp_res.get("total") : temp_res.total) / (_Pagination = self._ES5ProxyType ? self.get("Pagination") : self.Pagination, _Pagination._ES5ProxyType ? _Pagination.get("pageSize") : _Pagination.pageSize)));
          }
          __callKey2(self, "callback", temp_res, (temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0 ? 'success' : 'fail');
        });
      }
      /**
       * handle lottery record before send http request
       * @param plat ame or ide
       * @param url post url
       * @param data post data
       */
    }, {
      key: "handlerLotteryRecord",
      value: function handlerLotteryRecord(plat, url, data) {
        var _pagination, _Pagination2, _Pagination3;
        var _getPaginationData = getPaginationData(plat),
          pageNow = _getPaginationData._ES5ProxyType ? _getPaginationData.get("pageNow") : _getPaginationData.pageNow,
          pageSize = _getPaginationData._ES5ProxyType ? _getPaginationData.get("pageSize") : _getPaginationData.pageSize;
        // Get the data required by the platform
        var pagination = (_pagination = {}, _defineProperty(_pagination, pageNow, (_Pagination2 = this._ES5ProxyType ? this.get("Pagination") : this.Pagination, _Pagination2._ES5ProxyType ? _Pagination2.get("pageNow") : _Pagination2.pageNow)), _defineProperty(_pagination, pageSize, (_Pagination3 = this._ES5ProxyType ? this.get("Pagination") : this.Pagination, _Pagination3._ES5ProxyType ? _Pagination3.get("pageSize") : _Pagination3.pageSize)), _pagination);
        Object.compatAssign(data, pagination);
        // Remove user-provided data
        if (data._ES5ProxyType ? data.get("pageNow") : data.pageNow) {
          __deleteKey(data, "pageNow");
        }
        if (data._ES5ProxyType ? data.get("pageSize") : data.pageSize) {
          __deleteKey(data, "pageSize");
        }
        __callKey3(this, "postData", plat, url, data);
      }
    }]);
    return LotteryRecord;
  }();

  var PersonInfo = /*#__PURE__*/function () {
    /**
     * send user info
     * @param plat Platform (ame, ide)
     * @param url POST request URL
     * @param data POST data
     * @param flowObj Parameters passed in by the user when calling the function
     * @param callback Callback function passed in by the user when calling the function
     */
    function PersonInfo(plat, url, data, flowObj, callback) {
      _classCallCheck(this, PersonInfo);
      // api请求参数
      __setKey(this, "flowObj", {
        actId: '',
        token: '',
        customizeStyle: false
      });
      __setKey(this, "flowObj", flowObj);
      __setKey(this, "callback", callback);
      // Send request
      __callKey3(this, "handlerUserInfo", plat, url, data);
    }
    /**
     * handle user info by ame or ide
     * @param plat Platform (ame, ide)
     * @param url POST request URL
     * @param data POST data
     */
    _createClass(PersonInfo, [{
      key: "handlerUserInfo",
      value: function handlerUserInfo(plat, url, data) {
        // Remove user-provided data
        if (data._ES5ProxyType ? data.get("query") : data.query) {
          var _getPersonInfo = getPersonInfo(plat),
            query = _getPersonInfo._ES5ProxyType ? _getPersonInfo.get("query") : _getPersonInfo.query;
          // Get the data required by the platform
          var temp = _defineProperty({}, query, 1);
          Object.compatAssign(data, temp);
          __deleteKey(data, "query");
        }
        __callKey3(this, "postData", plat, url, data);
      }
      /**
       * send http request
       * @param plat Platform (ams, ide)
       * @param url POST request URL
       * @param data POST data
       */
    }, {
      key: "postData",
      value: function () {
        var _postData = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee(plat, url, data) {
          var self, sendFn;
          return __callKey3(regenerator, "wrap", function _callee$(_context) {
            var _flowObj;
            while (1) {
              switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
                case 0:
                  // Handle the issue of ID card number being required by the API
                  if (!(data._ES5ProxyType ? data.get("sIdentity") : data.sIdentity)) {
                    __setKey(data, "sIdentity", 11);
                  }
                  self = this; // Show loading
                  showLoading((_flowObj = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("loading") : _flowObj.loading));
                  sendFn = plat === 'ams' ? sendToAME : sendToIDE;
                  __callKey1(sendFn(data, url), "then", function (res) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    // Hide loading
                    hideLoading();
                    var temp_res = plat === 'ams' ? dealAMSResponse(res) : dealIDEResponse(res);
                    __setKey(temp_res, "data", (plat === 'ams' ? (_d = (_c = (_b = (_a = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("jData") : _a.jData) === null || _b === void 0 ? void 0 : _b._ES5ProxyType ? _b.get("lottery") : _b.lottery) === null || _c === void 0 ? void 0 : _c._ES5ProxyType ? _c.get("submit") : _c.submit) === null || _d === void 0 ? void 0 : _d._ES5ProxyType ? _d.get("jData") : _d.jData : (_h = (_g = (_f = (_e = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _e === void 0 ? void 0 : _e._ES5ProxyType ? _e.get("jData") : _e.jData) === null || _f === void 0 ? void 0 : _f._ES5ProxyType ? _f.get("lottery") : _f.lottery) === null || _g === void 0 ? void 0 : _g._ES5ProxyType ? _g.get("submit") : _g.submit) === null || _h === void 0 ? void 0 : _h._ES5ProxyType ? _h.get("jData") : _h.jData) || []);
                    __callKey2(self, "callback", temp_res, (temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0 ? 'success' : 'fail');
                  });
                case 6:
                case "end":
                  return __callKey0(_context, "stop");
              }
            }
          }, _callee, this);
        }));
        function postData(_x, _x2, _x3) {
          return __callKey2(_postData, "apply", this, arguments);
        }
        return postData;
      }()
    }]);
    return PersonInfo;
  }();

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? __callKey0(Object.setPrototypeOf, "bind") : function _setPrototypeOf(o, p) {
      __setKey(o, "__proto__", p);
      return o;
    };
    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    __setKey(subClass, "prototype", Object.create(superClass && (superClass._ES5ProxyType ? superClass.get("prototype") : superClass.prototype), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));
    Object.compatDefineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? __callKey0(Object.getPrototypeOf, "bind") : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var Filters = {
    upper: function upper(str) {
      return __callKey0(str, "toUpperCase");
    },
    lower: function lower(str) {
      return __callKey0(str, "toLowerCase");
    },
    reverse: function reverse(str) {
      return __callKey1(__callKey0(__callKey1(str, "split", ''), "reverse"), "join", '');
    },
    escape: function escape(str) {
      return __callKey2(__callKey2(__callKey2(__callKey2(str, "replace", /&(?!\w+;)/g, '&amp;'), "replace", /</g, '&lt;'), "replace", />/g, '&gt;'), "replace", /"/g, '&quot;');
    }
  };
  /**
   * Custom template rendering
   */
  var Tpl = /*#__PURE__*/function () {
    function Tpl() {
      var _this = this,
        _config;
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _classCallCheck(this, Tpl);
      __setKey(this, "config", {});
      var defaultConfig = {
        signs: {
          varSign: ['{{', '}}'],
          evalSign: ['{@', '@}'],
          endEvalSign: ['{/@', '@}'],
          commentSign: ['<!--', '-->'],
          noCommentSign: ['{#', '#}'] // Ignored comments
        },

        syntax: false // Syntax mode
      };

      __setKey(this, "config", Object.compatAssign({}, defaultConfig, config));
      // ['{{', '}}'] => /{{([\\s\\S]+?)}}/g Construct regex
      __callKey1(Object.compatKeys((_config = this._ES5ProxyType ? this.get("config") : this.config, _config._ES5ProxyType ? _config.get("signs") : _config.signs)), "forEach", function (key) {
        var _config2, _signs2, _config3, _config4, _signs4;
        (_config2 = _this._ES5ProxyType ? _this.get("config") : _this.config, _signs2 = _config2._ES5ProxyType ? _config2.get("signs") : _config2.signs, _signs2._ES5ProxyType ? _signs2.get(key) : _signs2[key]).splice(1, 0, '(.+?)');
        __setKey((_config3 = _this._ES5ProxyType ? _this.get("config") : _this.config, _config3._ES5ProxyType ? _config3.get("signs") : _config3.signs), key, new RegExp(__callKey1((_config4 = _this._ES5ProxyType ? _this.get("config") : _this.config, _signs4 = _config4._ES5ProxyType ? _config4.get("signs") : _config4.signs, _signs4._ES5ProxyType ? _signs4.get(key) : _signs4[key]), "join", ''), 'g'));
      });
    }
    /**
     * Syntax mode
     * @param str
     * @private
     */
    _createClass(Tpl, [{
      key: "syntax",
      value: function syntax(str) {
        var arr = __callKey1(__callKey0(str, "trim"), "split", /\s+/);
        var exp = str;
        if ((arr._ES5ProxyType ? arr.get(0) : arr[0]) === 'if') {
          exp = __concat("if ( ", __callKey1(__callKey1(arr, "slice", 1), "join", ' '), " ) {");
        } else if ((arr._ES5ProxyType ? arr.get(0) : arr[0]) === 'else') {
          exp = '} else {';
        } else if ((arr._ES5ProxyType ? arr.get(0) : arr[0]) === 'elif') {
          exp = __concat("} else if ( ", __callKey1(__callKey1(arr, "slice", 1), "join", ' '), " ) {");
        } else if ((arr._ES5ProxyType ? arr.get(0) : arr[0]) === 'each') {
          exp = __concat(__concat("for (var index = 0, len = ", arr._ES5ProxyType ? arr.get(1) : arr[1], ".length; index < len; index++) {var item = "), arr._ES5ProxyType ? arr.get(1) : arr[1], "[index]");
        }
        return exp;
      }
      // Template parsing
      /**
       * compileTpl() Template parsing
       * @param str HTML code of the template
       * @param data Data source
       */
    }, {
      key: "compileTpl",
      value: function compileTpl(str, data) {
        var _this2 = this,
          _config5,
          _signs5,
          _config6,
          _signs6,
          _config7,
          _signs7,
          _config8,
          _signs8,
          _config10,
          _signs9;
        var tpl = __callKey2(__callKey2(__callKey2(__callKey2(__callKey2(__callKey2(__callKey2(__callKey2(str, "replace", /\n/g, '') // Comments
        , "replace", (_config5 = this._ES5ProxyType ? this.get("config") : this.config, _signs5 = _config5._ES5ProxyType ? _config5.get("signs") : _config5.signs, _signs5._ES5ProxyType ? _signs5.get("noCommentSign") : _signs5.noCommentSign), function () {
          return '';
        }), "replace", (_config6 = this._ES5ProxyType ? this.get("config") : this.config, _signs6 = _config6._ES5ProxyType ? _config6.get("signs") : _config6.signs, _signs6._ES5ProxyType ? _signs6.get("commentSign") : _signs6.commentSign), function (match, p) {
          var exp = __callKey2(p, "replace", /[{<}>]/g, function (match) {
            return __concat("&*&", __callKey0(match, "charCodeAt"), "&*&");
          });
          return __concat("'+'<!-- ", exp, " -->'+'");
        }) // Variables/expressions
        , "replace", (_config7 = this._ES5ProxyType ? this.get("config") : this.config, _signs7 = _config7._ES5ProxyType ? _config7.get("signs") : _config7.signs, _signs7._ES5ProxyType ? _signs7.get("varSign") : _signs7.varSign), function (match, p) {
          var filterIndex = __callKey1(p, "indexOf", '|');
          var val = p;
          // Has filter
          if (filterIndex !== -1) {
            var arr = __callKey1(__callKey1(val, "split", '|'), "map", function (s) {
              return __callKey0(s, "trim");
            });
            var filters = __callKey1(arr, "slice", 1) || [];
            var oldVal = arr._ES5ProxyType ? arr.get(0) : arr[0];
            val = __callKey2(filters, "reduce", function (curVal, filterName) {
              if (!(Filters._ES5ProxyType ? Filters.get(filterName) : Filters[filterName])) {
                throw new Error(__concat("No ", filterName, " filter"));
              }
              return __concat(__concat("Filters['", filterName, "']("), curVal, ")");
            }, oldVal);
          }
          return __concat("'+(", val, ")+'");
        }) // Statements
        , "replace", (_config8 = this._ES5ProxyType ? this.get("config") : this.config, _signs8 = _config8._ES5ProxyType ? _config8.get("signs") : _config8.signs, _signs8._ES5ProxyType ? _signs8.get("evalSign") : _signs8.evalSign), function (match, p) {
          var _config9;
          var exp = __callKey2(__callKey2(p, "replace", '&gt;', '>'), "replace", '&lt;', '<');
          // Syntax mode
          exp = (_config9 = _this2._ES5ProxyType ? _this2.get("config") : _this2.config, _config9._ES5ProxyType ? _config9.get("syntax") : _config9.syntax) ? __callKey1(_this2, "syntax", exp) : exp;
          return __concat("'; ", exp, "; tpl += '");
        }) // Syntax mode (end tag)
        , "replace", (_config10 = this._ES5ProxyType ? this.get("config") : this.config, _signs9 = _config10._ES5ProxyType ? _config10.get("signs") : _config10.signs, _signs9._ES5ProxyType ? _signs9.get("endEvalSign") : _signs9.endEvalSign), function () {
          return '\'} tpl += \'';
        }), "replace", /&*&(.*?)&\*&/g, function (match, p) {
          return String.fromCharCode(p);
        }) // Carriage return
        , "replace", /\r/g, '');
        // Execute code. This method cannot be replaced by others. If eslint reports an error, please ignore it.
        var func = new Function('data', __concat("var tpl='", tpl, "'; return tpl;"));
        return func(data);
      }
      /**
       * Compilation entry point
       * @param tplStr HTML code of the template
       * @param data Data source
       */
    }, {
      key: "compile",
      value: function compile(tplStr, data) {
        try {
          return __callKey2(this, "compileTpl", tplStr, data);
        } catch (err) {
          __callKey1(console, "warn", err);
        }
      }
    }]);
    return Tpl;
  }();

  var Honey = /*#__PURE__*/function () {
    function Honey() {
      _classCallCheck(this, Honey);
    }
    _createClass(Honey, null, [{
      key: "tpl",
      value: function tpl(config) {
        return new Tpl(config);
      }
    }]);
    return Honey;
  }();

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }
  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }
  var BroadCast = /*#__PURE__*/function (_Honey) {
    _inherits(BroadCast, _Honey);
    var _super = _createSuper(BroadCast);
    function BroadCast(plat, flow, flowObj, callback) {
      var _flowObj, _functions;
      var _this;
      _classCallCheck(this, BroadCast);
      var _a;
      _this = __callKey1(_super, "call", this);
      __setKey(_this, "flowObj", {
        actId: '',
        token: '',
        customizeStyle: false
      });
      // Loop time
      __setKey(_this, "time", 50);
      __setKey(_this, "flowObj", flowObj);
      __setKey(_this, "time", (_flowObj = _this._ES5ProxyType ? _this.get("flowObj") : _this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("time") : _flowObj.time) || (_this._ES5ProxyType ? _this.get("time") : _this.time));
      __setKey(_this, "callback", callback);
      var moduleId = plat === 'ide' ? flow._ES5ProxyType ? flow.get("iModuleId") : flow.iModuleId : (flow._ES5ProxyType ? flow.get("sExtModuleId") : flow.sExtModuleId) ? flow._ES5ProxyType ? flow.get("sExtModuleId") : flow.sExtModuleId : (_a = (_functions = flow._ES5ProxyType ? flow.get("functions") : flow.functions, _functions._ES5ProxyType ? _functions.get(0) : _functions[0])) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("sExtModuleId") : _a.sExtModuleId;
      // Get carousel data
      __callKey1(_this, "getBroadCastData", moduleId);
      return _this;
    }
    /**
     * Get carousel data
     * @param iModuleId Lottery module ID
     */
    _createClass(BroadCast, [{
      key: "getBroadCastData",
      value: function getBroadCastData(iModuleId) {
        var self = this;
        try {
          loadScript({
            url: __concat(__concat(__concat("", location._ES5ProxyType ? location.get("protocol") : location.protocol, "//gameact.qq.com/ams/lottery/v2.0/"), parseInt(iModuleId) % 100, "/"), iModuleId, "_broadcast.js"),
            callback: function callback(res) {
              var _ref, _ref2, _$, _length;
              var data = (_ref = 'Broadcast_' + iModuleId, _ref2 = window._ES5ProxyType ? window.get(_ref) : window[_ref]) || [];
              var tpl_html = '';
              // Check if the user needs a custom structure. If so, use the user-defined structure by default.
              //@ts-ignore
              if ((_$ = $("#milo-broadcast-tpl"), _length = _$._ES5ProxyType ? _$.get("length") : _$.length) > 0) {
                //@ts-ignore
                tpl_html = __callKey0($("#milo-broadcast-tpl"), "html");
              }
              // Render the data
              var _html = __callKey2(__callKey0(Honey, "tpl"), "compile", tpl_html, data);
              //@ts-ignore
              __callKey1($("#milo-broadcast-container"), "html", _html);
              // Add loop animation
              __callKey0(self, "addAnimation");
            }
          });
        } catch (e) {
          __callKey2(self, "callback", {
            iRet: '-9999',
            sMsg: 'Sorry, the system is busy. Please try again later!'
          }, 'fail');
        }
      }
      /**
       * Copy repeated data
       * @param box The box element to copy the data to
       * @param container The container element containing the data to be copied
       */
    }, {
      key: "repeatData",
      value: function repeatData(box, container) {
        var loopHtml = '';
        // Calculate the number of loops needed
        // @ts-ignore
        var loopLength = parseInt((box._ES5ProxyType ? box.get("scrollHeight") : box.scrollHeight) / (container._ES5ProxyType ? container.get("scrollHeight") : container.scrollHeight)) + 1;
        for (var i = 0; i < loopLength; i++) {
          loopHtml += container._ES5ProxyType ? container.get("innerHTML") : container.innerHTML;
        }
        var loopNode = __callKey1(document, "createElement", 'ul');
        // Copy the user-defined styles to the copied element
        //@ts-ignore
        __setKey(loopNode, "className", __callKey1($("#milo-broadcast-container"), "attr", 'class') || '');
        __setKey(loopNode, "innerHTML", loopHtml);
        __callKey1(box, "appendChild", loopNode);
      }
      /**
       * Add loop animation
       */
    }, {
      key: "addAnimation",
      value: function addAnimation() {
        var self = this;
        var container = __callKey1(document, "getElementById", "milo-broadcast-container");
        var box = __callKey1(document, "getElementById", "milo-broadcast");
        // Copy repeated data to prevent scrolling from stopping
        __callKey2(this, "repeatData", box, container);
        __setKey(box, "scrollTop", 0);
        var timer = setInterval(function () {
          __callKey2(self, "rollStart", box, container);
        }, self._ES5ProxyType ? self.get("time") : self.time);
        __setKey(box, "onmouseover", function () {
          clearInterval(timer);
        });
        __setKey(box, "onmouseout", function () {
          timer = setInterval(function () {
            __callKey2(self, "rollStart", box, container);
          }, self._ES5ProxyType ? self.get("time") : self.time);
        });
      }
      /**
       * Reset the content top to zero and start looping again
       */
    }, {
      key: "rollStart",
      value: function rollStart(box, container) {
        if ((box._ES5ProxyType ? box.get("scrollTop") : box.scrollTop) >= (container._ES5ProxyType ? container.get("scrollHeight") : container.scrollHeight)) {
          __setKey(box, "scrollTop", 0);
        } else {
          __setKeyPostfixIncrement(box, "scrollTop");
        }
      }
    }]);
    return BroadCast;
  }(Honey);

  var IDELogicHandler = /*#__PURE__*/function () {
    function IDELogicHandler(plat, flowObj, actInfo, flow, callback) {
      _classCallCheck(this, IDELogicHandler);
      // plat： ide、ams
      __setKey(this, "plat", '');
      // get activity information
      __setKey(this, "actInfo", {});
      // current flow info
      __setKey(this, "flow", {});
      __setKey(this, "flowObj", {});
      __setKey(this, "plat", plat);
      __setKey(this, "actInfo", actInfo);
      __setKey(this, "flow", flow);
      __setKey(this, "flowObj", flowObj);
      __setKey(this, "callback", callback);
      __callKey0(this, "postData");
    }
    /**
     * merge flow sData and userinfo
     * @param com
     */
    _createClass(IDELogicHandler, [{
      key: "mergeDataToIDE",
      value: function mergeDataToIDE() {
        var _flow, _flow2, _flowObj;
        var data = {
          iChartId: (_flow = this._ES5ProxyType ? this.get("flow") : this.flow, _flow._ES5ProxyType ? _flow.get("flowId") : _flow.flowId),
          sIdeToken: (_flow2 = this._ES5ProxyType ? this.get("flow") : this.flow, _flow2._ES5ProxyType ? _flow2.get("sIdeToken") : _flow2.sIdeToken),
          sLanguage: Config._ES5ProxyType ? Config.get("defaultLang") : Config.defaultLang
        };
        // merge login info
        Object.compatAssign(data, getLoginInfo());
        // merge flow sData
        if (_flowObj = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("sData") : _flowObj.sData) {
          var _flowObj2;
          Object.compatAssign(data, (_flowObj2 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj2._ES5ProxyType ? _flowObj2.get("sData") : _flowObj2.sData));
        }
        return data;
      }
      /**
       * post request
       * @param roleInfo: game role info
       */
    }, {
      key: "postData",
      value: function () {
        var _postData = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee(roleInfo) {
          var data, modName;
          return __callKey3(regenerator, "wrap", function _callee$(_context) {
            var _actInfo, _actInfo2, _actInfo3, _flow3, _actInfo4, _actInfo5, _actInfo6;
            while (1) {
              switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
                case 0:
                  data = __callKey0(this, "mergeDataToIDE"); // merge role Info
                  if (roleInfo) {
                    Object.compatAssign(data, roleInfo);
                  }
                  __callKey2(console, "log", "[ Milo postData data:]", data);
                  // if this flow need gopenid，post data will added needGopenid\isPreengage params
                  if ((_actInfo = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo._ES5ProxyType ? _actInfo.get("sAccountType") : _actInfo.sAccountType) === "5" || (_actInfo2 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo2._ES5ProxyType ? _actInfo2.get("sAccountType") : _actInfo2.sAccountType) === "6") {
                    __setKey(data, "needGopenid", 1);
                  } else if ((_actInfo3 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo3._ES5ProxyType ? _actInfo3.get("sAccountType") : _actInfo3.sAccountType) === "7") {
                    __setKey(data, "isPreengage", 1);
                    __setKey(data, "needGopenid", 1);
                  }
                  modName = (this._ES5ProxyType ? this.get("flow") : this.flow) && (_flow3 = this._ES5ProxyType ? this.get("flow") : this.flow, _flow3._ES5ProxyType ? _flow3.get("sTplType") : _flow3.sTplType) || '';
                  if (!(modName && __callKey1(modName, "indexOf", "history") > -1)) {
                    __setKey(_context, "next", 11);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo history start]");
                  new LotteryRecord('ide', (_actInfo4 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo4._ES5ProxyType ? _actInfo4.get("sAmeMobileUrl") : _actInfo4.sAmeMobileUrl), data, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 11:
                  if (!(modName && __callKey1(modName, "indexOf", "submit_info") > -1)) {
                    __setKey(_context, "next", 17);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo submit_info start]");
                  new PersonInfo('ide', (_actInfo5 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo5._ES5ProxyType ? _actInfo5.get("sAmeMobileUrl") : _actInfo5.sAmeMobileUrl), data, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 17:
                  if (!(modName && __callKey1(modName, "indexOf", "broad") > -1)) {
                    __setKey(_context, "next", 21);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo broad start]");
                  new BroadCast('ide', this._ES5ProxyType ? this.get("flow") : this.flow, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 21:
                  /*     else if(modName && modName.indexOf("buy") > -1){
                           console.log("[ Milo buy start]");
                           new BuyV2('ide', '', data, this.flow, this.flowObj, this.callback);
                           return;
                       }*/
                  // other flows request
                  __callKey3(this, "sendCustomFlowRequest", (_actInfo6 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo6._ES5ProxyType ? _actInfo6.get("sAmeMobileUrl") : _actInfo6.sAmeMobileUrl), data, modName);
                case 22:
                case "end":
                  return __callKey0(_context, "stop");
              }
            }
          }, _callee, this);
        }));
        function postData(_x) {
          return __callKey2(_postData, "apply", this, arguments);
        }
        return postData;
      }()
      /**
       * custom flow request
       * @param url ame url
       * @param data send to ame data
       * @param modName flow tpl name
       */
    }, {
      key: "sendCustomFlowRequest",
      value: function sendCustomFlowRequest(url, data, modName) {
        var _flowObj3, _actInfo7;
        // check show loading        
        showLoading((_flowObj3 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj3._ES5ProxyType ? _flowObj3.get("loading") : _flowObj3.loading));
        var _this = this;
        __callKey1(sendToIDE(data, (_actInfo7 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo7._ES5ProxyType ? _actInfo7.get("sAmeMobileUrl") : _actInfo7.sAmeMobileUrl)), "then", function (res) {
          var _flow4, _flow5;
          var _a, _b, _c, _d;
          hideLoading();
          // deal IDE interface response
          var temp_res = dealIDEResponse(res);
          if ((_flow4 = _this._ES5ProxyType ? _this.get("flow") : _this.flow, _flow4._ES5ProxyType ? _flow4.get("sTplType") : _flow4.sTplType) && __callKey1((_flow5 = _this._ES5ProxyType ? _this.get("flow") : _this.flow, _flow5._ES5ProxyType ? _flow5.get("sTplType") : _flow5.sTplType), "indexOf", 'bindarea') > -1) {
            if ((temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0) {
              if ((_b = (_a = temp_res === null || temp_res === void 0 ? void 0 : temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("jData") : _a.jData) === null || _b === void 0 ? void 0 : _b._ES5ProxyType ? _b.get("bindarea") : _b.bindarea) {
                __setKey(temp_res, "data", getRoleData((_d = (_c = temp_res === null || temp_res === void 0 ? void 0 : temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _c === void 0 ? void 0 : _c._ES5ProxyType ? _c.get("jData") : _c.jData) === null || _d === void 0 ? void 0 : _d._ES5ProxyType ? _d.get("bindarea") : _d.bindarea));
              }
            }
          }
          __callKey2(console, "log", "[ Milo sendToAME response:]", temp_res);
          // return about request flow info
          __callKey2(_this, "callback", temp_res, (temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0 ? 'success' : 'fail');
        });
      }
    }]);
    return IDELogicHandler;
  }();

  var AMSLogicHandler = /*#__PURE__*/function () {
    function AMSLogicHandler(plat, flowObj, actInfo, flow, callback) {
      _classCallCheck(this, AMSLogicHandler);
      // Platform IDE and AMS
      __setKey(this, "plat", '');
      // Get configuration information
      __setKey(this, "actInfo", {});
      // current flow info
      __setKey(this, "flow", {});
      __setKey(this, "flowObj", {});
      __setKey(this, "plat", plat);
      __setKey(this, "actInfo", actInfo);
      __setKey(this, "flow", flow);
      __setKey(this, "flowObj", flowObj);
      __setKey(this, "callback", callback);
      __callKey0(this, "postData");
    }
    /**
     * Merge and submit AMS URL
     * @param com
     */
    _createClass(AMSLogicHandler, [{
      key: "mergeUrlToAME",
      value: function mergeUrlToAME(com) {
        var _actInfo, _actInfo2;
        var url = __concat(__concat(__concat("", location._ES5ProxyType ? location.get("protocol") : location.protocol, "//"), (_actInfo = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo._ES5ProxyType ? _actInfo.get("sAmeMobileUrl") : _actInfo.sAmeMobileUrl), "/ame?"), serialize(Object.compatAssign(Object.compatAssign({}, com), {
          sSDID: (_actInfo2 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo2._ES5ProxyType ? _actInfo2.get("sSDID") : _actInfo2.sSDID)
        })));
        return url;
      }
      /**
       * Merge and submit AMS data
       * @param com
       */
    }, {
      key: "mergeDataToAME",
      value: function mergeDataToAME(com) {
        var _flow, _flowObj;
        // Use EAS library to get relevant EAS parameters
        var extCodeData = {
          e_code: urlRequest('e_code') || 0,
          g_code: urlRequest('g_code') || 0,
          eas_url: encodeURIComponent(document.location._ES5ProxyType ? document.location.get("href") : document.location.href),
          eas_refer: encodeURIComponent(document._ES5ProxyType ? document.get("referrer") : document.referrer)
        };
        var data = Object.compatAssign(Object.compatAssign({}, com), {
          iFlowId: (_flow = this._ES5ProxyType ? this.get("flow") : this.flow, _flow._ES5ProxyType ? _flow.get("flowId") : _flow.flowId),
          gtk: ameCSRFToken(),
          sLanguage: Config._ES5ProxyType ? Config.get("defaultLang") : Config.defaultLang
        });
        Object.compatAssign(data, extCodeData);
        // Merge login info
        Object.compatAssign(data, getLoginInfo());
        // Pass through user-defined parameters
        if (_flowObj = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("sData") : _flowObj.sData) {
          var _flowObj2;
          Object.compatAssign(data, (_flowObj2 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj2._ES5ProxyType ? _flowObj2.get("sData") : _flowObj2.sData));
        }
        return data;
      }
    }, {
      key: "postData",
      value: function () {
        var _postData = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee(roleInfo) {
          var _a, com, url, data, modName;
          return __callKey3(regenerator, "wrap", function _callee$(_context) {
            var _actInfo3, _actInfo4, _actInfo5, _actInfo6, _actInfo7, _actInfo8, _flow2, _functions;
            while (1) {
              switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
                case 0:
                  com = {
                    sServiceType: (_actInfo3 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo3._ES5ProxyType ? _actInfo3.get("sServiceType") : _actInfo3.sServiceType),
                    iActivityId: (_actInfo4 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo4._ES5ProxyType ? _actInfo4.get("iActivityId") : _actInfo4.iActivityId),
                    sServiceDepartment: (_actInfo5 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo5._ES5ProxyType ? _actInfo5.get("sServiceDepartment") : _actInfo5.sServiceDepartment)
                  }; // Process sending AME url request
                  url = __callKey1(this, "mergeUrlToAME", com); // Process sending AME data request
                  data = __callKey1(this, "mergeDataToAME", com); // Merge role information
                  if (roleInfo) {
                    Object.compatAssign(data, roleInfo);
                  }
                  // Special handling of role id for the Three Kingdoms business
                  if ((data._ES5ProxyType ? data.get("sServiceType") : data.sServiceType) === 'sg') {
                    __setKey(data, "sRoleId", encodeURIComponent(data._ES5ProxyType ? data.get("sRoleId") : data.sRoleId));
                  }
                  __callKey2(console, "log", "[ Milo postData url:]", url);
                  __callKey2(console, "log", "[ Milo postData data:]", data);
                  // If gopenid is required, the development calling this interface needs to pass the specified value
                  if ((_actInfo6 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo6._ES5ProxyType ? _actInfo6.get("sAccountType") : _actInfo6.sAccountType) === "5" || (_actInfo7 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo7._ES5ProxyType ? _actInfo7.get("sAccountType") : _actInfo7.sAccountType) === "6") {
                    __setKey(data, "needGopenid", 1);
                  } else if ((_actInfo8 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo8._ES5ProxyType ? _actInfo8.get("sAccountType") : _actInfo8.sAccountType) === "7") {
                    __setKey(data, "isPreengage", 1);
                    __setKey(data, "needGopenid", 1);
                  }
                  modName = ((_a = (_flow2 = this._ES5ProxyType ? this.get("flow") : this.flow, _functions = _flow2._ES5ProxyType ? _flow2.get("functions") : _flow2.functions, _functions._ES5ProxyType ? _functions.get(0) : _functions[0])) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("method") : _a.method) || '';
                  if (!(__callKey1(modName, "indexOf", 'lottery2.myGiftList') > -1)) {
                    __setKey(_context, "next", 15);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo LotteryRecord start]");
                  new LotteryRecord('ams', url, data, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 15:
                  if (!(modName == "lottery2.personInfo3")) {
                    __setKey(_context, "next", 21);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo personInfo3 start]");
                  new PersonInfo('ams', url, data, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 21:
                  if (!(modName == "lottery2.broadcast")) {
                    __setKey(_context, "next", 25);
                    break;
                  }
                  __callKey1(console, "log", "[ Milo broadcast start]");
                  new BroadCast('ams', this._ES5ProxyType ? this.get("flow") : this.flow, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("callback") : this.callback);
                  return __callKey1(_context, "abrupt", "return");
                case 25:
                  // other flows request
                  __callKey3(this, "sendCustomFlowRequest", url, data, modName);
                case 26:
                case "end":
                  return __callKey0(_context, "stop");
              }
            }
          }, _callee, this);
        }));
        function postData(_x) {
          return __callKey2(_postData, "apply", this, arguments);
        }
        return postData;
      }()
      /**
       * custom flow request
       * @param url ame url
       * @param data send to ame data
       * @param modName flow tpl name
       */
    }, {
      key: "sendCustomFlowRequest",
      value: function sendCustomFlowRequest(url, data, modName) {
        var _flowObj3;
        showLoading((_flowObj3 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj3._ES5ProxyType ? _flowObj3.get("loading") : _flowObj3.loading));
        // Process sending AME data
        var _this = this;
        __callKey1(__callKey1(sendToAME(data, url), "then", function (res) {
          var _a, _b, _c;
          __callKey1(console, "log", "[ Milo sendToAME end]");
          hideLoading();
          // Process AME response information
          var temp_res = dealAMSResponse(res);
          if (modName == "bindArea_v2.bindAreaCommit") {
            if ((temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0) {
              if ((_c = (_b = (_a = temp_res === null || temp_res === void 0 ? void 0 : temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("modRet") : _a.modRet) === null || _b === void 0 ? void 0 : _b._ES5ProxyType ? _b.get("jData") : _b.jData) === null || _c === void 0 ? void 0 : _c._ES5ProxyType ? _c.get("data") : _c.data) {
                var _details, _modRet, _jData;
                __setKey(temp_res, "data", getRoleData((_details = temp_res._ES5ProxyType ? temp_res.get("details") : temp_res.details, _modRet = _details._ES5ProxyType ? _details.get("modRet") : _details.modRet, _jData = _modRet._ES5ProxyType ? _modRet.get("jData") : _modRet.jData, _jData._ES5ProxyType ? _jData.get("data") : _jData.data)));
              }
            }
          }
          __callKey2(console, "log", "[ Milo sendToAME response:]", temp_res);
          // return about request flow info
          __callKey2(_this, "callback", temp_res, (temp_res._ES5ProxyType ? temp_res.get("iRet") : temp_res.iRet) == 0 ? 'success' : 'fail');
        }), "catch", function () {
          hideLoading();
          __callKey2(_this, "callback", {
            iRet: -9997,
            sMsg: "Network Error"
          }, 'fail');
        });
      }
    }]);
    return AMSLogicHandler;
  }();

  var globalActInfo = [];
  var Flow = /*#__PURE__*/function () {
    function Flow() {
      _classCallCheck(this, Flow);
      // plation ide、ams
      __setKey(this, "plat", 'ide');
      // actvity info
      __setKey(this, "actInfo", {});
      // flow id
      __setKey(this, "flowId", '');
      // flow config info
      __setKey(this, "flow", {});
      __setKey(this, "flowObj", {});
    }
    /**
     * flow success/fail callback
     */
    _createClass(Flow, [{
      key: "callback",
      value: function callback(ParamError, type) {}
      /**
       * Determine which platform to use based on actId and token
       */
    }, {
      key: "getActionInfo",
      value: function () {
        var _getActionInfo = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee() {
          var sendFn;
          return __callKey3(regenerator, "wrap", function _callee$(_context) {
            var _flowObj;
            while (1) {
              switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
                case 0:
                  sendFn = (this._ES5ProxyType ? this.get("plat") : this.plat) === 'ide' ? getActInfo : getTgodpActInfo;
                  __setKey(_context, "next", 3);
                  return sendFn(this._ES5ProxyType ? this.get("flowObj") : this.flowObj);
                case 3:
                  __setKey(this, "actInfo", _context._ES5ProxyType ? _context.get("sent") : _context.sent);
                  __setKey(globalActInfo, (_flowObj = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj._ES5ProxyType ? _flowObj.get("actId") : _flowObj.actId), this._ES5ProxyType ? this.get("actInfo") : this.actInfo);
                case 5:
                case "end":
                  return __callKey0(_context, "stop");
              }
            }
          }, _callee, this);
        }));
        function getActionInfo() {
          return __callKey2(_getActionInfo, "apply", this, arguments);
        }
        return getActionInfo;
      }()
      /**
       * get platform
       */
    }, {
      key: "getPlat",
      value: function getPlat() {
        var _flowObj2;
        // Check the platform
        var actIdRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*_)[a-zA-Z0-9_]+$/; // actId only contains underscores, letters, and numbers
        if (__callKey1(actIdRegex, "test", (_flowObj2 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj2._ES5ProxyType ? _flowObj2.get("actId") : _flowObj2.actId))) {
          __setKey(this, "plat", 'ide');
        } else {
          __setKey(this, "plat", 'ams');
        }
      }
      // init
    }, {
      key: "init",
      value: function () {
        var _init = _asyncToGenerator( /*#__PURE__*/__callKey1(regenerator, "mark", function _callee2(flow) {
          var _a, _b, flowList, flowId, tokenList;
          return __callKey4(regenerator, "wrap", function _callee2$(_context2) {
            var _this$flowObj$actId, _flowObj3, _this$flowObj$actId3, _flowObj4, _actInfo, _flowObj5, _flowObj6, _ref, _flow, _Object$compatKeys, _flow3;
            while (1) {
              switch (__setKey(_context2, "prev", _context2._ES5ProxyType ? _context2.get("next") : _context2.next)) {
                case 0:
                  __setKey(this, "flowObj", flow);
                  // check flow params
                  __callKey1(console, "log", "[ Milo checkParams start ]");
                  if (!checkParams(this._ES5ProxyType ? this.get("flowObj") : this.flowObj)) {
                    __setKey(_context2, "next", 31);
                    break;
                  }
                  //add cached with setting file in tgodp
                  __callKey1(console, "log", "[ Milo checkParams end ]");
                  // get platform
                  __callKey0(this, "getPlat");
                  if (!(_this$flowObj$actId = (_flowObj3 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj3._ES5ProxyType ? _flowObj3.get("actId") : _flowObj3.actId), globalActInfo._ES5ProxyType ? globalActInfo.get(_this$flowObj$actId) : globalActInfo[_this$flowObj$actId])) {
                    __setKey(_context2, "next", 9);
                    break;
                  }
                  __setKey(this, "actInfo", (_this$flowObj$actId3 = (_flowObj4 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj4._ES5ProxyType ? _flowObj4.get("actId") : _flowObj4.actId), globalActInfo._ES5ProxyType ? globalActInfo.get(_this$flowObj$actId3) : globalActInfo[_this$flowObj$actId3]));
                  __setKey(_context2, "next", 18);
                  break;
                case 9:
                  __setKey(_context2, "prev", 9);
                  __setKey(_context2, "next", 12);
                  return __callKey0(this, "getActionInfo");
                case 12:
                  __setKey(_context2, "next", 18);
                  break;
                case 14:
                  __setKey(_context2, "prev", 14);
                  __setKey(_context2, "t0", __callKey1(_context2, "catch", 9));
                  __callKey2(this, "callback", {
                    iRet: -9997,
                    sMsg: LANG._ES5ProxyType ? LANG.get("systemError") : LANG.systemError
                  }, 'fail');
                  return __callKey1(_context2, "abrupt", "return");
                case 18:
                  flowList = (_actInfo = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo._ES5ProxyType ? _actInfo.get("flows") : _actInfo.flows);
                  flowId = (_flowObj5 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj5._ES5ProxyType ? _flowObj5.get("flowId") : _flowObj5.flowId);
                  if (_flowObj6 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj6._ES5ProxyType ? _flowObj6.get("token") : _flowObj6.token) {
                    var _actInfo2, _actInfo3, _this$flowObj$token, _flowObj7;
                    // the activity from tgodp, it has alias; the activity from ide, it has tokens, so we need to check it again
                    tokenList = (this._ES5ProxyType ? this.get("plat") : this.plat) === 'ams' ? (_actInfo2 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo2._ES5ProxyType ? _actInfo2.get("alias") : _actInfo2.alias) : (_actInfo3 = this._ES5ProxyType ? this.get("actInfo") : this.actInfo, _actInfo3._ES5ProxyType ? _actInfo3.get("tokens") : _actInfo3.tokens);
                    flowId = (_this$flowObj$token = (_flowObj7 = this._ES5ProxyType ? this.get("flowObj") : this.flowObj, _flowObj7._ES5ProxyType ? _flowObj7.get("token") : _flowObj7.token), tokenList._ES5ProxyType ? tokenList.get(_this$flowObj$token) : tokenList[_this$flowObj$token]);
                  }
                  // when tgodp create flows has f_ prefix, so we need to check it again
                  __setKey(this, "flow", ((this._ES5ProxyType ? this.get("plat") : this.plat) === 'ams' ? (_ref = "f_" + flowId, flowList._ES5ProxyType ? flowList.get(_ref) : flowList[_ref]) : flowList._ES5ProxyType ? flowList.get(flowId) : flowList[flowId]) || {});
                  // if this created by tgodp, but this flow is premuim flow, so we need to get ide flow
                  if ((_flow = this._ES5ProxyType ? this.get("flow") : this.flow, _flow._ES5ProxyType ? _flow.get("sEditType") : _flow.sEditType) === 'ide') {
                    var _flow2, _flows2;
                    flowId = (_flow2 = this._ES5ProxyType ? this.get("flow") : this.flow, _flow2._ES5ProxyType ? _flow2.get("mapid") : _flow2.mapid);
                    __setKey(this, "flow", ((_b = (_a = this._ES5ProxyType ? this.get("actInfo") : this.actInfo) === null || _a === void 0 ? void 0 : _a._ES5ProxyType ? _a.get("ide") : _a.ide) === null || _b === void 0 ? void 0 : (_flows2 = _b._ES5ProxyType ? _b.get("flows") : _b.flows, _flows2._ES5ProxyType ? _flows2.get(flowId) : _flows2[flowId])) || {});
                  }
                  // check flow data is empty
                  if (!((_Object$compatKeys = Object.compatKeys(this._ES5ProxyType ? this.get("flow") : this.flow), _Object$compatKeys._ES5ProxyType ? _Object$compatKeys.get("length") : _Object$compatKeys.length) === 0)) {
                    __setKey(_context2, "next", 26);
                    break;
                  }
                  __callKey2(this, "callback", {
                    iRet: -9999,
                    sMsg: LANG._ES5ProxyType ? LANG.get("noFlow") : LANG.noFlow
                  }, 'fail');
                  return __callKey1(_context2, "abrupt", "return");
                case 26:
                  __setKey(this._ES5ProxyType ? this.get("flow") : this.flow, "flowId", flowId);
                  // when this activity from tgodp, it has ams\ide two types, so we need to check it again
                  __setKey(this, "plat", (_flow3 = this._ES5ProxyType ? this.get("flow") : this.flow, _flow3._ES5ProxyType ? _flow3.get("sEditType") : _flow3.sEditType) === 'ams' ? 'ams' : 'ide');
                  if ((this._ES5ProxyType ? this.get("plat") : this.plat) === 'ide') {
                    __setKey(this._ES5ProxyType ? this.get("flow") : this.flow, "chartId", flowId);
                    __callKey1(console, "log", "[ Milo IDELogicHandler start ]");
                    new IDELogicHandler(this._ES5ProxyType ? this.get("plat") : this.plat, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("actInfo") : this.actInfo, this._ES5ProxyType ? this.get("flow") : this.flow, this._ES5ProxyType ? this.get("callback") : this.callback);
                  } else {
                    __callKey1(console, "log", "[ Milo AMSLogicHandler start ]");
                    new AMSLogicHandler(this._ES5ProxyType ? this.get("plat") : this.plat, this._ES5ProxyType ? this.get("flowObj") : this.flowObj, this._ES5ProxyType ? this.get("actInfo") : this.actInfo, this._ES5ProxyType ? this.get("flow") : this.flow, this._ES5ProxyType ? this.get("callback") : this.callback);
                  }
                  __setKey(_context2, "next", 32);
                  break;
                case 31:
                  __callKey1(this, "callback", ParamError);
                case 32:
                case "end":
                  return __callKey0(_context2, "stop");
              }
            }
          }, _callee2, this, [[9, 14]]);
        }));
        function init(_x) {
          return __callKey2(_init, "apply", this, arguments);
        }
        return init;
      }()
    }]);
    return Flow;
  }();
  function emit(flow) {
    var flwindowfo = new Flow();
    // if user set need promise, they will be set needPromiseCallback=true, default return by callback
    if ((Config._ES5ProxyType ? Config.get("needPromiseCallback") : Config.needPromiseCallback) || (flow._ES5ProxyType ? flow.get("needPromiseCallback") : flow.needPromiseCallback)) {
      return new Promise(function (resolve) {
        __setKey(flwindowfo, "callback", function (msg, type) {
          resolve(msg);
        });
        // flow init
        __callKey1(flwindowfo, "init", flow);
      });
    } else {
      __setKey(flwindowfo, "callback", function (result, type) {
        if (type === 'success') {
          return __callKey1(flow, 'success', result);
        } else if (type === 'onPayClose') {
          return __callKey1(flow, 'onPayClose', result);
        } else {
          return __callKey1(flow, 'fail', result);
        }
      });
      // flow init
      __callKey1(flwindowfo, "init", flow);
    }
  }

  function pagination(_ref) {
    var _ref$pages = _ref._ES5ProxyType ? _ref.get("pages") : _ref.pages,
      pages = _ref$pages === void 0 ? 10 : _ref$pages,
      _ref$currentPage = _ref._ES5ProxyType ? _ref.get("currentPage") : _ref.currentPage,
      currentPage = _ref$currentPage === void 0 ? 1 : _ref$currentPage,
      _ref$element = _ref._ES5ProxyType ? _ref.get("element") : _ref.element,
      element = _ref$element === void 0 ? '.my-page' : _ref$element,
      callback = _ref._ES5ProxyType ? _ref.get("callback") : _ref.callback;
    intercept();
    var myPageEl = __callKey1(document, "querySelector", element);
    var htmlStrArr = [];
    for (var i = 0; i < pages; i++) {
      htmlStrArr.push(__concat("<li class=\"my-page-cell\">", i + 1, "</li>"));
    }
    if (pages > 7) {
      htmlStrArr.splice(5, (htmlStrArr._ES5ProxyType ? htmlStrArr.get("length") : htmlStrArr.length) - 6, "<li class='my-page-omit'>...</li>");
    }
    var htmlStr = __callKey1(htmlStrArr, "join", "");
    var pageHtmlStr = __concat("<div class=\"my-page-prev\"><</div>\n        <ul class=\"my-page-group\">", htmlStr, "</ul>\n        <div class=\"my-page-next\">></div>");
    __setKey(myPageEl, "innerHTML", pageHtmlStr);
    clickPageFun(currentPage);
    var btns = __callKey1(document, "querySelectorAll", __concat("", element, " div"));
    __callKey1(btns, "forEach", function (el) {
      __setKey(el, "onclick", switchPage);
    });
    __setKey(myPageEl, "onclick", function (e) {
      var target = e._ES5ProxyType ? e.get("target") : e.target;
      var classNameArr = __callKey1(target._ES5ProxyType ? target.get("className") : target.className, "split", " ");
      if (__callKey1(classNameArr, "indexOf", "my-page-cell") !== -1) {
        clickPageFun(Number(target._ES5ProxyType ? target.get("innerText") : target.innerText));
      }
    });
    function switchPage(e) {
      var _target;
      var ele = __callKey1(document, "querySelector", __concat("", element, " .my-page-checked"));
      var text = ele._ES5ProxyType ? ele.get("innerText") : ele.innerText;
      var page = parseInt(text) - 0;
      var classNameArr = __callKey1((_target = e._ES5ProxyType ? e.get("target") : e.target, _target._ES5ProxyType ? _target.get("className") : _target.className), "split", " ");
      if (__callKey1(classNameArr, "indexOf", "my-page-prev") !== -1) {
        clickPageFun(page - 1);
      } else if (__callKey1(classNameArr, "indexOf", "my-page-next") !== -1) {
        clickPageFun(page + 1);
      }
    }
    function clickPageFun(page) {
      page = Number(page);
      if (pages > 7) {
        var newEl = '';
        if (page <= 4) {
          newEl = __concat("\n                <li class=\"my-page-cell\">1</li>\n                <li class=\"my-page-cell\">2</li>\n                <li class=\"my-page-cell\">3</li>\n                <li class=\"my-page-cell\">4</li>\n                <li class=\"my-page-cell\">5</li>\n                <li class=\"my-page-omit\">...</li>\n                <li class=\"my-page-cell\">", pages, "</li>");
        } else if (page >= 5 && page < pages - 3) {
          newEl = __concat(__concat(__concat(__concat("\n                <li class=\"my-page-cell\">1</li>\n                <li class=\"my-page-omit\">...</li>\n                <li class=\"my-page-cell\">", page - 1, "</li>\n                <li class=\"my-page-cell\">"), page, "</li>\n                <li class=\"my-page-cell\">"), page + 1, "</li>\n                <li class=\"my-page-omit\">...</li>\n                <li class=\"my-page-cell\">"), pages, "</li>");
        } else if (page >= pages - 3) {
          newEl = __concat(__concat(__concat(__concat(__concat("\n                <li class=\"my-page-cell\">1</li>\n                <li class=\"my-page-omit\">...</li>\n                <li class=\"my-page-cell\">", pages - 4, "</li>\n                <li class=\"my-page-cell\">"), pages - 3, "</li>\n                <li class=\"my-page-cell\">"), pages - 2, "</li>\n                <li class=\"my-page-cell\">"), pages - 1, "</li>\n                <li class=\"my-page-cell\">"), pages, "</li>");
        }
        __setKey(__callKey1(document, "querySelector", __concat("", element, " .my-page-group")), "innerHTML", newEl);
      }
      var pageCellELs = __callKey1(document, "querySelectorAll", __concat("", element, " .my-page-cell"));
      __callKey1(pageCellELs, "forEach", function (el) {
        if ((el._ES5ProxyType ? el.get("innerText") : el.innerText) == page) {
          __callKey1(el._ES5ProxyType ? el.get("classList") : el.classList, "add", 'my-page-checked');
        } else {
          __callKey1(el._ES5ProxyType ? el.get("classList") : el.classList, "remove", 'my-page-checked');
        }
      });
      forbidden(page);
      callback && callback(page);
    }
    function forbidden(page) {
      var prveEl = __callKey1(document, "querySelector", __concat("", element, " .my-page-prev"));
      var nextEl = __callKey1(document, "querySelector", __concat("", element, " .my-page-next"));
      if (page === 1) {
        __callKey1(prveEl._ES5ProxyType ? prveEl.get("classList") : prveEl.classList, "add", 'my-page-forbid');
      } else {
        __callKey1(prveEl._ES5ProxyType ? prveEl.get("classList") : prveEl.classList, "remove", 'my-page-forbid');
      }
      if (page === pages) {
        __callKey1(nextEl._ES5ProxyType ? nextEl.get("classList") : nextEl.classList, "add", 'my-page-forbid');
      } else {
        __callKey1(nextEl._ES5ProxyType ? nextEl.get("classList") : nextEl.classList, "remove", 'my-page-forbid');
      }
    }
    function intercept() {
      var _document$querySelect;
      if (!pages || pages === 0 || Math.floor(pages) != pages) {
        throw "The 'pages' parameter in my-page must be a non-zero integer.";
      }
      if (!currentPage || currentPage === 0 || Math.floor(currentPage) !== currentPage) {
        throw "The 'currentPage' parameter in my-page must be a non-zero integer.";
      }
      if ((_document$querySelect = __callKey1(document, "querySelectorAll", element), _document$querySelect._ES5ProxyType ? _document$querySelect.get("length") : _document$querySelect.length) === 0) {
        throw "The element '" + element + "' does not exist.";
      }
      if (currentPage > pages) {
        throw "The current page does not exist.";
      }
    }
  }

  /*! js-cookie v3.0.5 | MIT */
  /* eslint-disable no-var */
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in __iterableKey(source)) {
        __setKey(target, key, source._ES5ProxyType ? source.get(key) : source[key]);
      }
    }
    return target;
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function read(value) {
      if ((value._ES5ProxyType ? value.get(0) : value[0]) === '"') {
        value = __callKey2(value, "slice", 1, -1);
      }
      return __callKey2(value, "replace", /(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function write(value) {
      return __callKey2(encodeURIComponent(value), "replace", /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
    }
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init(converter, defaultAttributes) {
    function set(name, value, attributes) {
      if (typeof document === 'undefined') {
        return;
      }
      attributes = assign({}, defaultAttributes, attributes);
      if (typeof (attributes._ES5ProxyType ? attributes.get("expires") : attributes.expires) === 'number') {
        __setKey(attributes, "expires", new Date(Date.now() + (attributes._ES5ProxyType ? attributes.get("expires") : attributes.expires) * 864e5));
      }
      if (attributes._ES5ProxyType ? attributes.get("expires") : attributes.expires) {
        __setKey(attributes, "expires", __callKey0(attributes._ES5ProxyType ? attributes.get("expires") : attributes.expires, "toUTCString"));
      }
      name = __callKey2(__callKey2(encodeURIComponent(name), "replace", /%(2[346B]|5E|60|7C)/g, decodeURIComponent), "replace", /[()]/g, escape);
      var stringifiedAttributes = '';
      for (var attributeName in __iterableKey(attributes)) {
        var _attributes$attribute;
        if (!(attributes._ES5ProxyType ? attributes.get(attributeName) : attributes[attributeName])) {
          continue;
        }
        stringifiedAttributes += '; ' + attributeName;
        if ((attributes._ES5ProxyType ? attributes.get(attributeName) : attributes[attributeName]) === true) {
          continue;
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + (_attributes$attribute = __callKey1(attributes._ES5ProxyType ? attributes.get(attributeName) : attributes[attributeName], "split", ';'), _attributes$attribute._ES5ProxyType ? _attributes$attribute.get(0) : _attributes$attribute[0]);
      }
      return __setKey(document, "cookie", name + '=' + __callKey2(converter, "write", value, name) + stringifiedAttributes);
    }
    function get(name) {
      if (typeof document === 'undefined' || arguments.length && !name) {
        return;
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = (document._ES5ProxyType ? document.get("cookie") : document.cookie) ? __callKey1(document._ES5ProxyType ? document.get("cookie") : document.cookie, "split", '; ') : [];
      var jar = {};
      for (var i = 0; i < (cookies._ES5ProxyType ? cookies.get("length") : cookies.length); i++) {
        var parts = __callKey1(cookies._ES5ProxyType ? cookies.get(i) : cookies[i], "split", '=');
        var value = __callKey1(__callKey1(parts, "slice", 1), "join", '=');
        try {
          var found = decodeURIComponent(parts._ES5ProxyType ? parts.get(0) : parts[0]);
          __setKey(jar, found, __callKey2(converter, "read", value, found));
          if (name === found) {
            break;
          }
        } catch (e) {}
      }
      return name ? jar._ES5ProxyType ? jar.get(name) : jar[name] : jar;
    }
    return Object.create({
      set: set,
      get: get,
      remove: function remove(name, attributes) {
        set(name, '', assign({}, attributes, {
          expires: -1
        }));
      },
      withAttributes: function withAttributes(attributes) {
        return init(this._ES5ProxyType ? this.get("converter") : this.converter, assign({}, this._ES5ProxyType ? this.get("attributes") : this.attributes, attributes));
      },
      withConverter: function withConverter(converter) {
        return init(assign({}, this._ES5ProxyType ? this.get("converter") : this.converter, converter), this._ES5ProxyType ? this.get("attributes") : this.attributes);
      }
    }, {
      attributes: {
        value: Object.freeze(defaultAttributes)
      },
      converter: {
        value: Object.freeze(converter)
      }
    });
  }
  var api = init(defaultConverter, {
    path: '/'
  });

  var fixIECenter,
    oOverLay,
    popType = '',
    fMsgClose = null,
    fixOverlay = null,
    dialogElement = null,
    lastFocus = null,
    focusHandle = null,
    escCloseHandle = null,
    bOverlay = false,
    isLongPopBox = false,
    dialogOpen = false,
    isIE = browser._ES5ProxyType ? browser.get("msie") : browser.msie,
    isIE6 = (browser._ES5ProxyType ? browser.get("msie") : browser.msie) && (browser._ES5ProxyType ? browser.get("version") : browser.version) == '6.0',
    isIE9 = (browser._ES5ProxyType ? browser.get("msie") : browser.msie) && (browser._ES5ProxyType ? browser.get("version") : browser.version) == '9.0';
  var Dialog = {
    // show dialog
    show: function show(p) {
      // Set default parameters
      var _p = _typeof(p) === 'object' ? p : {},
        _sAuto = 'auto';
      __setKey(this, "id", (_p._ES5ProxyType ? _p.get("id") : _p.id) || null);
      __setKey(this, "bgcolor", (_p._ES5ProxyType ? _p.get("bgcolor") : _p.bgcolor) || '#111');
      __setKey(this, "opacity", (_p._ES5ProxyType ? _p.get("opacity") : _p.opacity) || 70);
      __setKey(this, "src", (_p._ES5ProxyType ? _p.get("src") : _p.src) || null);
      __setKey(this, "fixed", (_p._ES5ProxyType ? _p.get("fixed") : _p.fixed) || false);
      __setKey(this, "iTop", (_p._ES5ProxyType ? _p.get("iTop") : _p.iTop) || _sAuto);
      __setKey(this, "iWidth", (_p._ES5ProxyType ? _p.get("iWidth") : _p.iWidth) || _sAuto);
      __setKey(this, "iHeight", (_p._ES5ProxyType ? _p.get("iHeight") : _p.iHeight) || _sAuto);
      __setKey(this, "sMsg", (_p._ES5ProxyType ? _p.get("sMsg") : _p.sMsg) || null);
      __setKey(this, "sClass", (_p._ES5ProxyType ? _p.get("sClass") : _p.sClass) || null);
      __setKey(this, "sStyles", (_p._ES5ProxyType ? _p.get("sStyle") : _p.sStyle) || 'padding:10px;border:4px solid #dedede;background-color:#fff');
      __setKey(this, "sTime", (_p._ES5ProxyType ? _p.get("sTime") : _p.sTime) || null);
      __setKey(this, "delayPop", (_p._ES5ProxyType ? _p.get("delayPop") : _p.delayPop) || false);
      __setKey(this, "sPzIndex", (_p._ES5ProxyType ? _p.get("PopzIndex") : _p.PopzIndex) || 9999);
      __setKey(this, "isNoAccessible", (_p._ES5ProxyType ? _p.get("isNoAccessible") : _p.isNoAccessible) || false);
      // Set minimum z-index
      if ((this._ES5ProxyType ? this.get("sPzIndex") : this.sPzIndex) < 9) {
        __setKey(this, "sPzIndex", 9);
      }
      // Set callback functions
      __setKey(this, "onPopupCallback", (_p._ES5ProxyType ? _p.get("onPopupCallback") : _p.onPopupCallback) || null);
      __setKey(this, "onCloseCallback", (_p._ES5ProxyType ? _p.get("onCloseCallback") : _p.onCloseCallback) || null);
      __setKey(this, "hasFrame", (_p._ES5ProxyType ? _p.get("bFrame") : _p.bFrame) || false);
      // Handle string parameter
      if (typeof p == "string" && p != null && p != '') {
        __setKey(this, "id", p);
      }
      // Handle case with four arguments
      if (arguments.length == 4) {
        __setKey(this, "src", arguments[0]);
        __setKey(this, "iWidth", arguments[1]);
        __setKey(this, "iHeight", arguments[2]);
      }
      // Check if parameters are valid
      if ((this._ES5ProxyType ? this.get("id") : this.id) == null && (this._ES5ProxyType ? this.get("src") : this.src) == null && (this._ES5ProxyType ? this.get("sMsg") : this.sMsg) == null) {
        return;
      }
      if (dialogOpen) {
        __callKey1(this, "hide", {
          isNoCloseOverLay: true
        });
      }
      // Initialize popup based on parameter type
      if ((this._ES5ProxyType ? this.get("src") : this.src) != null) {
        __setKey(this, "id", '_PopupIframe_');
        popType = 'iframe';
        return __callKey0(this, "popupInit");
      }
      if ((this._ES5ProxyType ? this.get("sMsg") : this.sMsg) != null) {
        __setKey(this, "id", '_PopupMsg_');
        popType = 'message';
        return __callKey0(this, "popupInit");
      }
      if ((this._ES5ProxyType ? this.get("id") : this.id) != null) {
        dialogElement = __callKey1(document, "getElementById", this._ES5ProxyType ? this.get("id") : this.id);
        __callKey2(dialogElement, "setAttribute", "data-milodialog", "1");
        popType = 'dialog';
        return __callKey0(this, "popupInit");
      }
    },
    popupInit: function popupInit() {
      var _callBack = this._ES5ProxyType ? this.get("onPopupCallback") : this.onPopupCallback,
        _zIndex = this._ES5ProxyType ? this.get("sPzIndex") : this.sPzIndex,
        _that = this,
        _oIfrWrap,
        _oIframe,
        _oMsg,
        _class,
        _msgCloseTime;
      if (typeof _callBack === 'function') {
        _callBack();
      }
      if (oOverLay === undefined) {
        oOverLay = __callKey1(document, "getElementById", '_overlay_');
      }
      if (!bOverlay) {
        if (oOverLay) {
          setStyle(oOverLay, {
            backgroundColor: this._ES5ProxyType ? this.get("bgcolor") : this.bgcolor,
            zIndex: _zIndex - 1,
            display: 'block'
          });
        } else {
          __callKey0(this, "overlay");
        }
      }
      if (popType === 'iframe') {
        if (!__callKey1(document, "getElementById", '_PopupIframe_')) {
          _oIfrWrap = __callKey1(document, "createElement", 'div');
          __callKey2(oOverLay._ES5ProxyType ? oOverLay.get("parentNode") : oOverLay.parentNode, "insertBefore", _oIfrWrap, oOverLay);
        } else {
          var _document$getElementB;
          _oIfrWrap = (_document$getElementB = __callKey1(document, "getElementById", '_PopupIframe_'), _document$getElementB._ES5ProxyType ? _document$getElementB.get("parentNode") : _document$getElementB.parentNode);
        }
        __setKey(_oIfrWrap._ES5ProxyType ? _oIfrWrap.get("style") : _oIfrWrap.style, "display", 'none');
        _oIframe = __callKey1(document, "createElement", 'iframe');
        __callKey2(_oIframe, "setAttribute", 'allowtransparency', 'true');
        __callKey2(_oIframe, "setAttribute", 'scrolling', 'no');
        __callKey2(_oIframe, "setAttribute", 'frameborder', '0');
        __callKey2(_oIframe, "setAttribute", 'height', this._ES5ProxyType ? this.get("iHeight") : this.iHeight);
        __callKey2(_oIframe, "setAttribute", 'width', this._ES5ProxyType ? this.get("iWidth") : this.iWidth);
        __callKey2(_oIframe, "setAttribute", 'id', '_PopupIframe_');
        __setKey(_oIframe, "src", this._ES5ProxyType ? this.get("src") : this.src);
        if (_oIframe._ES5ProxyType ? _oIframe.get("attachEvent") : _oIframe.attachEvent) {
          __callKey2(_oIframe, "attachEvent", 'onload', function () {
            __callKey1(_that, "ifrAutoHeight", _oIframe);
          });
        } else {
          __setKey(_oIframe, "onload", function () {
            __callKey1(_that, "ifrAutoHeight", _oIframe);
          });
        }
        if (!(this._ES5ProxyType ? this.get("delayPop") : this.delayPop)) {
          __setKey(_oIfrWrap._ES5ProxyType ? _oIfrWrap.get("style") : _oIfrWrap.style, "display", 'block');
        }
        __setKey(_oIfrWrap, "innerHTML", '');
        __callKey1(_oIfrWrap, "appendChild", _oIframe);
        dialogElement = _oIfrWrap;
      }
      if (popType === 'message') {
        if (!__callKey1(document, "getElementById", '_PopupMsg_')) {
          _oMsg = __callKey1(document, "createElement", 'div');
          __callKey2(_oMsg, "setAttribute", 'id', '_PopupMsg_');
          __callKey2(oOverLay._ES5ProxyType ? oOverLay.get("parentNode") : oOverLay.parentNode, "insertBefore", _oMsg, oOverLay);
        } else {
          _oMsg = __callKey1(document, "getElementById", '_PopupMsg_');
        }
        __setKey(_oMsg._ES5ProxyType ? _oMsg.get("style") : _oMsg.style, "cssText", this._ES5ProxyType ? this.get("sStyles") : this.sStyles);
        if ((this._ES5ProxyType ? this.get("sClass") : this.sClass) != null) {
          _class = isIE ? 'className' : 'class';
          __callKey2(_oMsg, "setAttribute", _class, this._ES5ProxyType ? this.get("sClass") : this.sClass);
        }
        __setKey(_oMsg._ES5ProxyType ? _oMsg.get("style") : _oMsg.style, "display", 'none');
        __setKey(_oMsg, "innerHTML", this._ES5ProxyType ? this.get("sMsg") : this.sMsg);
        if (!(this._ES5ProxyType ? this.get("delayPop") : this.delayPop)) {
          __setKey(_oMsg._ES5ProxyType ? _oMsg.get("style") : _oMsg.style, "display", 'block');
        }
        if ((this._ES5ProxyType ? this.get("sTime") : this.sTime) != null) {
          if (!dialogOpen) {
            clearTimeout(_msgCloseTime);
          }
          _msgCloseTime = setTimeout(function () {
            __callKey0(_that, "hide");
          }, this._ES5ProxyType ? this.get("sTime") : this.sTime);
        } else {
          fMsgClose = function fMsgClose(e) {
            var targ;
            e = e || (window._ES5ProxyType ? window.get("event") : window.event);
            targ = (e._ES5ProxyType ? e.get("target") : e.target) || (e._ES5ProxyType ? e.get("srcElement") : e.srcElement);
            if ((targ._ES5ProxyType ? targ.get("id") : targ.id) === '_overlay_') {
              stopPropagation(e);
              __callKey0(_that, "hide");
            }
          };
          addEvent(oOverLay, 'click', fMsgClose);
        }
        dialogElement = _oMsg;
      }
      if (this._ES5ProxyType ? this.get("delayPop") : this.delayPop) {
        __setKey(dialogElement._ES5ProxyType ? dialogElement.get("style") : dialogElement.style, "display", 'none');
      } else {
        __setKey(dialogElement._ES5ProxyType ? dialogElement.get("style") : dialogElement.style, "display", 'block');
      }
      setStyle(dialogElement, {
        visibility: 'visible',
        position: 'absolute',
        zIndex: _zIndex,
        left: '50%',
        top: '50%'
      });
      __callKey2(dialogElement, "setAttribute", 'role', 'dialog');
      __setKey(dialogElement, "tabIndex", -1);
      if (!(this._ES5ProxyType ? this.get("isNoAccessible") : this.isNoAccessible)) {
        focusHandle = function focusHandle(e) {
          var targ;
          e = e || (window._ES5ProxyType ? window.get("event") : window.event);
          targ = (e._ES5ProxyType ? e.get("target") : e.target) || (e._ES5ProxyType ? e.get("srcElement") : e.srcElement);
          if (dialogOpen && !__callKey1(dialogElement, "contains", targ) && !__callKey1(dialogElement, "getAttribute", "data-milodialog")) {
            stopPropagation(e);
            setStyle(dialogElement, {
              display: 'block',
              visibility: 'visible'
            });
            setTimeout(function () {
              try {
                if (dialogElement && (dialogElement._ES5ProxyType ? dialogElement.get("offsetHeight") : dialogElement.offsetHeight) > 0) {
                  __callKey0(dialogElement, "focus");
                }
              } catch (e) {}
            }, 250);
          }
        };
        lastFocus = document._ES5ProxyType ? document.get("activeElement") : document.activeElement;
        __setKey(document, "onfocus", focusHandle);
        if (document._ES5ProxyType ? document.get("addEventListener") : document.addEventListener) {
          __callKey3(document, "addEventListener", 'focus', focusHandle, true);
        } else {
          //@ts-ignore
          __setKey(document, "onfocusin", focusHandle);
        }
        escCloseHandle = function escCloseHandle(e) {
          var code;
          e = e || (window._ES5ProxyType ? window.get("event") : window.event);
          code = (e._ES5ProxyType ? e.get("keyCode") : e.keyCode) || (e._ES5ProxyType ? e.get("which") : e.which);
          if (dialogOpen && code == 27 && !(this._ES5ProxyType ? this.get("isNoAccessible") : this.isNoAccessible)) {
            __callKey0(_that, "hide");
          }
        };
        addEvent(document, 'keyup', escCloseHandle);
      }
      if (!(this._ES5ProxyType ? this.get("delayPop") : this.delayPop)) {
        __callKey0(this, "adjust");
      }
    },
    popup: function popup() {
      var _obj = dialogElement,
        _oIfrWrap;
      if (this._ES5ProxyType ? this.get("delayPop") : this.delayPop) {
        if (popType === 'iframe') {
          var _document$getElementB2;
          _oIfrWrap = (_document$getElementB2 = __callKey1(document, "getElementById", '_PopupIframe_'), _document$getElementB2._ES5ProxyType ? _document$getElementB2.get("parentNode") : _document$getElementB2.parentNode);
          __setKey(_oIfrWrap._ES5ProxyType ? _oIfrWrap.get("style") : _oIfrWrap.style, "display", 'block');
        }
        __setKey(_obj._ES5ProxyType ? _obj.get("style") : _obj.style, "display", 'block');
      }
      __callKey0(this, "adjust");
    },
    adjust: function adjust() {
      var _h = getWinHeight(),
        _imh = getMaxH(),
        _rt = null,
        _st = null,
        _that = this,
        _obj = dialogElement,
        _iw,
        _ih,
        _iTop,
        _iPh;
      if (oOverLay === undefined) {
        oOverLay = __callKey1(document, "getElementById", '_overlay_');
      }
      if (_obj) {
        _iw = _obj._ES5ProxyType ? _obj.get("offsetWidth") : _obj.offsetWidth;
        _ih = _obj._ES5ProxyType ? _obj.get("offsetHeight") : _obj.offsetHeight;
        if (this._ES5ProxyType ? this.get("fixed") : this.fixed) {
          if (isInt(this._ES5ProxyType ? this.get("iTop") : this.iTop)) {
            setStyle(_obj, {
              top: (this._ES5ProxyType ? this.get("iTop") : this.iTop) + 'px',
              marginTop: 0
            });
          } else {
            __setKey(_obj._ES5ProxyType ? _obj.get("style") : _obj.style, "marginTop", '-' + _ih / 2 + 'px');
          }
          setStyle(_obj, {
            position: 'absolute',
            marginLeft: '-' + _iw / 2 + 'px'
          });
        } else {
          if (_ih >= _h) {
            isLongPopBox = true;
            if (isInt(this._ES5ProxyType ? this.get("iTop") : this.iTop)) {
              _iTop = this._ES5ProxyType ? this.get("iTop") : this.iTop;
            } else {
              var _body, _documentElement;
              _iTop = (_body = document._ES5ProxyType ? document.get("body") : document.body, _body._ES5ProxyType ? _body.get("scrollTop") : _body.scrollTop) || (_documentElement = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement._ES5ProxyType ? _documentElement.get("scrollTop") : _documentElement.scrollTop) || 0;
              _iTop = _iTop + 50;
            }
            setStyle(_obj, {
              position: 'absolute',
              top: _iTop + 'px',
              marginLeft: '-' + _iw / 2 + 'px',
              marginTop: 0
            });
            _iPh = _ih + _iTop;
            __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "height", Math.max(_iPh, _imh) + 'px');
          } else {
            isLongPopBox = false;
            //@ts-ignore
            isIE6 || (document._ES5ProxyType ? document.get("documentMode") : document.documentMode) < 7 ? __setKey(_obj._ES5ProxyType ? _obj.get("style") : _obj.style, "position", 'absolute') : __setKey(_obj._ES5ProxyType ? _obj.get("style") : _obj.style, "position", 'fixed');
            setStyle(_obj, {
              marginTop: '-' + _ih / 2 + 'px',
              marginLeft: '-' + _iw / 2 + 'px'
            });
          }
        }
        fixOverlay = function fixOverlay() {
          if (_rt) {
            clearTimeout(_rt);
          }
          _rt = setTimeout(function () {
            __callKey0(_that, "fix_Overlay");
          }, 250);
        };
        addEvent(window, 'resize', fixOverlay);
        if (isIE || (browser._ES5ProxyType ? browser.get("safari") : browser.safari)) {
          __callKey0(this, "fix_Overlay");
          if (isIE6) {
            __callKey0(this, "fixIE6_Center");
            fixIECenter = function fixIECenter() {
              if (_st) {
                clearTimeout(_st);
              }
              _st = setTimeout(function () {
                __callKey0(_that, "fixIE6_Center");
              }, 250);
            };
            addEvent(window, 'scroll', fixIECenter);
          }
        }
      }
      dialogOpen = true;
    },
    fix_Overlay: function fix_Overlay() {
      var _w = getMaxW(),
        _h = getMaxH(),
        _wh = getWinHeight(),
        _obj = dialogElement,
        _ih,
        _iTop;
      if (oOverLay === undefined) {
        oOverLay = __callKey1(document, "getElementById", '_overlay_');
      }
      //@ts-ignore
      if (isIE9 && (!(document._ES5ProxyType ? document.get("documentMode") : document.documentMode) || (document._ES5ProxyType ? document.get("documentMode") : document.documentMode) > 8)) {
        _w = _w - 17 < 0 ? 0 : _w - 3;
      }
      _h = _h - 3 < 0 ? 0 : _h - 3;
      try {
        _ih = _obj._ES5ProxyType ? _obj.get("offsetHeight") : _obj.offsetHeight;
      } catch (e) {
        _ih = this._ES5ProxyType ? this.get("iHeight") : this.iHeight;
        _obj = __callKey1(document, "getElementById", '_PopupIframe_');
      }
      if (_ih >= _wh) {
        isLongPopBox = true;
        if (isInt(this._ES5ProxyType ? this.get("iTop") : this.iTop)) {
          _iTop = this._ES5ProxyType ? this.get("iTop") : this.iTop;
        } else {
          var _body2, _documentElement2;
          _iTop = (_body2 = document._ES5ProxyType ? document.get("body") : document.body, _body2._ES5ProxyType ? _body2.get("scrollTop") : _body2.scrollTop) || (_documentElement2 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement2._ES5ProxyType ? _documentElement2.get("scrollTop") : _documentElement2.scrollTop);
          _iTop = _iTop + 50;
        }
        setStyle(_obj, {
          position: 'absolute',
          top: _iTop + 'px',
          marginTop: '0'
        });
      } else {
        isLongPopBox = false;
      }
      if (isIE) {
        __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "width", _w + 'px');
      }
      __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "height", _h + 'px');
    },
    fixIE6_Center: function fixIE6_Center() {
      var _iScrollTop,
        _obj = dialogElement;
      if (!isLongPopBox) {
        if (!(this._ES5ProxyType ? this.get("fixed") : this.fixed)) {
          var _body3, _documentElement3;
          _iScrollTop = (_body3 = document._ES5ProxyType ? document.get("body") : document.body, _body3._ES5ProxyType ? _body3.get("scrollTop") : _body3.scrollTop) || (_documentElement3 = document._ES5ProxyType ? document.get("documentElement") : document.documentElement, _documentElement3._ES5ProxyType ? _documentElement3.get("scrollTop") : _documentElement3.scrollTop);
          //@ts-ignore
          __setKey(dialogElement._ES5ProxyType ? dialogElement.get("style") : dialogElement.style, "marginTop", parseInt(_iScrollTop - (_obj._ES5ProxyType ? _obj.get("offsetHeight") : _obj.offsetHeight) / 2, 10) + 'px');
        }
      }
    },
    ifrAutoHeight: function ifrAutoHeight(ele) {
      var _bh, _dh, _win, _h;
      if ((this._ES5ProxyType ? this.get("iHeight") : this.iHeight) != 'auto') {
        return;
      }
      _win = dialogElement;
      try {
        var _contentWindow, _document, _body4, _scrollHeight, _contentWindow2, _document2, _documentElement4, _scrollHeight2;
        _bh = (_contentWindow = _win._ES5ProxyType ? _win.get("contentWindow") : _win.contentWindow, _document = _contentWindow._ES5ProxyType ? _contentWindow.get("document") : _contentWindow.document, _body4 = _document._ES5ProxyType ? _document.get("body") : _document.body, _scrollHeight = _body4._ES5ProxyType ? _body4.get("scrollHeight") : _body4.scrollHeight);
        _dh = (_contentWindow2 = _win._ES5ProxyType ? _win.get("contentWindow") : _win.contentWindow, _document2 = _contentWindow2._ES5ProxyType ? _contentWindow2.get("document") : _contentWindow2.document, _documentElement4 = _document2._ES5ProxyType ? _document2.get("documentElement") : _document2.documentElement, _scrollHeight2 = _documentElement4._ES5ProxyType ? _documentElement4.get("scrollHeight") : _documentElement4.scrollHeight);
        _h = Math.max(_bh, _dh);
        //@ts-ignore
        __setKey(this, "iHeight", __setKey(win, "height", _h));
      } catch (e) {}
      setStyle(_win, {
        marginTop: '-' + (_win._ES5ProxyType ? _win.get("offsetHeight") : _win.offsetHeight) / 2 + 'px',
        marginLeft: '-' + (_win._ES5ProxyType ? _win.get("offsetWidth") : _win.offsetWidth) / 2 + 'px'
      });
      __callKey0(this, "fix_Overlay");
    },
    hide: function hide(p) {
      var _p = _typeof(p) === 'object' ? p : {},
        _callBack = this._ES5ProxyType ? this.get("onCloseCallback") : this.onCloseCallback,
        _cancleCallback = (_p._ES5ProxyType ? _p.get("cancleCallback") : _p.cancleCallback) || false,
        _isNoCloseOverLay = (_p._ES5ProxyType ? _p.get("isNoCloseOverLay") : _p.isNoCloseOverLay) || false;
      if (oOverLay === undefined) {
        oOverLay = __callKey1(document, "getElementById", '_overlay_');
      }
      if (fixOverlay !== null) {
        removeEvent(window, 'resize', fixOverlay);
      }
      if (isIE6 && fixIECenter != null) {
        removeEvent(window, 'scroll', fixIECenter);
      }
      if (fMsgClose !== null) {
        removeEvent(oOverLay, 'click', fMsgClose);
      }
      if (escCloseHandle !== null) {
        removeEvent(document, 'keyup', escCloseHandle);
      }
      if (typeof _callBack === 'function' && !_cancleCallback) {
        _callBack();
      }
      dialogOpen = false;
      if (!(this._ES5ProxyType ? this.get("isNoAccessible") : this.isNoAccessible)) {
        if (focusHandle !== null) {
          if (document._ES5ProxyType ? document.get("removeEventListener") : document.removeEventListener) {
            __callKey3(document, "removeEventListener", 'focus', focusHandle, false);
          } else {
            __setKey(document, "onfocus", null);
          }
          if (__setKey(document, "onfocus", focusHandle)) {
            __setKey(document, "onfocus", null);
          }
        }
        if (lastFocus && (lastFocus._ES5ProxyType ? lastFocus.get("offsetHeight") : lastFocus.offsetHeight) > 0) {
          __callKey0(lastFocus, "focus");
        }
      }
      if (dialogElement === null) {
        switch (popType) {
          case "message":
            dialogElement = __callKey1(document, "getElementById", '_PopupMsg_');
          case "iframe":
            dialogElement = __callKey1(document, "getElementById", '_PopupIframe_');
          case "dialog":
            dialogElement = __callKey1(document, "getElementById", this._ES5ProxyType ? this.get("id") : this.id);
          default:
            return;
        }
      }
      __setKey(dialogElement._ES5ProxyType ? dialogElement.get("style") : dialogElement.style, "display", 'none');
      if (!_isNoCloseOverLay) {
        __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "display", 'none');
      }
      bOverlay = false;
      return;
    },
    overlay: function overlay() {
      var _h = getMaxH(),
        _zIndex = (this._ES5ProxyType ? this.get("sPzIndex") : this.sPzIndex) - 1,
        _op = this._ES5ProxyType ? this.get("opacity") : this.opacity,
        _it,
        _ib,
        _w;
      if (isIE) {
        _it = parseInt(getStyle(document._ES5ProxyType ? document.get("body") : document.body, 'marginTop'), 10);
        _ib = parseInt(getStyle(document._ES5ProxyType ? document.get("body") : document.body, 'marginBottom'), 10);
        _h = _h + _it + _ib;
      }
      oOverLay = __callKey1(document, "createElement", 'div');
      __callKey2(oOverLay, "setAttribute", 'id', '_overlay_');
      setStyle(oOverLay, {
        backgroundColor: this._ES5ProxyType ? this.get("bgcolor") : this.bgcolor,
        borderTop: '1px solid ' + (this._ES5ProxyType ? this.get("bgcolor") : this.bgcolor),
        position: 'absolute',
        height: _h + 'px',
        zIndex: _zIndex,
        width: '100%',
        left: '0',
        top: '0'
      });
      if (isIE6 || (this._ES5ProxyType ? this.get("hasFrame") : this.hasFrame)) {
        _w = getMaxW();
        __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "width", _w + 'px');
        __setKey(oOverLay, "innerHTML", '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;filter:alpha(opacity=0);z-index:9" src="javascript:void(0)"></iframe>');
      }
      //@ts-ignore
      if (isIE && (!(document._ES5ProxyType ? document.get("documentMode") : document.documentMode) || (document._ES5ProxyType ? document.get("documentMode") : document.documentMode) < 9)) {
        __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "filter", 'Alpha(opacity=' + _op + ')');
      } else {
        __setKey(oOverLay._ES5ProxyType ? oOverLay.get("style") : oOverLay.style, "opacity", _op / 100);
      }
      bOverlay = true;
      return __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", oOverLay);
    }
  };

  // Template parsing
  function tpl() {
    return __callKey0(Honey, "tpl");
  }
  var cookie = api;
  var dialog = Dialog;

  exports.checkCurrentEnv = checkCurrentEnv;
  exports.cookie = cookie;
  exports.dialog = dialog;
  exports.emit = emit;
  exports.getUrlParams = getUrlParams;
  exports.loadScript = loadScript;
  exports.pagination = pagination;
  exports.setCommonConfig = setCommonConfig;
  exports.tpl = tpl;
  exports.urlRequest = urlRequest;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=milo.es5.js.map
