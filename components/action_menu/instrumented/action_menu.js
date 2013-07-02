if (typeof __$coverObject === "undefined"){
	if (typeof window !== "undefined") window.__$coverObject = {};
	else if (typeof global !== "undefined") global.__$coverObject = {};
	else throw new Error("cannot find the global scope");
}
var __$coverInit = function(name, code){
	if (!__$coverObject[name]) __$coverObject[name] = {__code: code};
};
var __$coverInitRange = function(name, range){
	if (!__$coverObject[name][range]) __$coverObject[name][range] = 0;
};
var __$coverCall = function(name, range){
	__$coverObject[name][range]++;
};
__$coverInit("action_menu.js", "\n'use strict';\n\nvar utils = this.utils || {};\n\nutils.ActionMenu = (function() {\n\n  // This constant is essential to resolve what is the path of the CSS file\n  // that defines the animations\n  var FILE_NAME = 'action_menu';\n\n  function getPath() {\n    var path = document.querySelector('[src*=\"' + FILE_NAME + '.js\"]').src;\n    return path.substring(0, path.lastIndexOf('/') + 1);\n  }\n\n  var actionMenus = Object.create(null);\n  var counter = 0;\n\n  /*\n   * ActionMenu constructor\n   *\n   * @param{Object} DOMElement with data type action\n   *\n   */\n  var Action = function(container) {\n    this.container = container;\n    container.dataset.id = ++counter;\n\n    this.callbacks = Object.create(null);\n\n    container.addEventListener('click', this);\n    container.addEventListener('animationend', this);\n  };\n\n  Action.prototype = {\n    /*\n     * Returns the identifier\n     */\n    get id() {\n      return this.container.id;\n    },\n\n    /*\n     * Shows the action menu\n     */\n    show: function am_show() {\n      this.container.classList.remove('hidden');\n      this.container.classList.add('onviewport');\n    },\n\n    /*\n     * Hides the action menu\n     */\n    hide: function am_hide() {\n      this.container.classList.remove('onviewport');\n    },\n\n    /*\n     * Authors can add an event listener to handle clicks over the component.\n     * An onclick event handler is also supported.\n     *\n     * @param{String} Event type (only implemented \"click\" event)\n     *\n     * @param{Function} Callback that will be invoked when the event occurs\n     *\n     */\n    addEventListener: function am_addEventListener(type, callback) {\n      if (type !== 'click' || typeof callback !== 'function') {\n        return;\n      }\n\n      this.callbacks[callback] = callback;\n    },\n\n    /*\n     * Authors can remove event listeners\n     *\n     * @param{String} Event type (only implemented \"click\" event)\n     *\n     * @param{Function} Callback that will be removed\n     *\n     */\n    removeEventListener: function am_removeEventListener(type, callback) {\n      if (type === 'click' && typeof callback === 'function') {\n        delete this.callbacks[callback];\n      }\n    },\n\n    /*\n     * This method is called when a \"click\" or \"animationend\" event occurs\n     *\n     * @param{Object} The DOM Event to register\n     */\n    handleEvent: function am_handleEvent(evt) {\n      switch (evt.type) {\n        case 'click':\n          evt.stopPropagation();\n          evt.preventDefault();\n\n          if (evt.target.tagName !== 'BUTTON') {\n            return;\n          }\n\n          // The component is auto-closed\n          window.setTimeout(this.hide.bind(this));\n\n          typeof this.onclick === 'function' && this.onclick(evt);\n          var callbacks = this.callbacks;\n          Object.keys(callbacks).forEach(function(callback) {\n            setTimeout(function() {\n              callbacks[callback](evt);\n            });\n          });\n\n        break;\n\n        case 'animationend':\n          var eventName = 'actionmenu-showed';\n\n          if (evt.animationName === 'hide') {\n            this.container.classList.add('hidden');\n            eventName = 'actionmenu-hidden';\n          }\n\n          window.dispatchEvent(new CustomEvent(eventName));\n\n        break;\n      }\n    },\n\n    /*\n     * Variables are deleted and listeners unregistered\n     */\n    destroy: function am_destroy() {\n      if (!this.container) {\n        return;\n      }\n\n      this.container.removeEventListener('click', this);\n      this.container.removeEventListener('animationend', this);\n      this.container.parentNode.removeChild(this.container);\n      this.container = this.callbacks = this.onclick = null;\n    }\n  };\n\n  function addStyleSheet() {\n    var link = document.createElement('link');\n    link.type = 'text/css';\n    link.rel = 'stylesheet';\n    link.href = getPath() + 'action_menu_behavior.css';\n    document.head.appendChild(link);\n  }\n\n  function initialize() {\n    addStyleSheet();\n\n    // Looking for all actions in the DOM\n    var elements =\n              document.querySelectorAll('[role=\"dialog\"][data-type=\"action\"]');\n    Array.prototype.forEach.call(elements, function(element) {\n      utils.ActionMenu.bind(element);\n    });\n  }\n\n  // Initializing the library\n  if (document.readyState === 'complete') {\n    initialize();\n  } else {\n    document.addEventListener('DOMContentLoaded', function loaded() {\n      document.removeEventListener('DOMContentLoaded', loaded);\n      initialize();\n    });\n  }\n\n  function destroy() {\n    Object.keys(actionMenus).forEach(function destroying(id) {\n      actionMenus[id].destroy();\n    });\n    actionMenus = Object.create(null);\n    counter = 0;\n  }\n\n  function build(descriptor) {\n    var form = document.createElement('form');\n    form.setAttribute('role', 'dialog');\n    form.dataset.type = 'action';\n    form.classList.add('hidden');\n    if (descriptor.id) {\n      form.id = descriptor.id;\n    }\n\n    var section = document.createElement('section');\n    var h1 = document.createElement('h1');\n    h1.textContent = descriptor.title || '';\n    section.appendChild(h1);\n    form.appendChild(section);\n\n    var actions = descriptor.actions;\n    if (actions) {\n      var menu = document.createElement('menu');\n      menu.classList.add('actions');\n\n      actions.forEach(function(action) {\n        var button = document.createElement('button');\n        button.id = action.id;\n        button.textContent = action.title;\n        menu.appendChild(button);\n        var classes = action.classList;\n        if (!classes) {\n          return;\n        }\n\n        // Populating class list\n        (classes.trim().split(/\\s+/g)).forEach(function(clazz) {\n          button.classList.add(clazz);\n        });\n      });\n\n      form.appendChild(menu);\n    }\n\n    return form;\n  }\n\n  return {\n    /*\n     * Returns an action menu object.\n     */\n    get: function get(id) {\n      var elem = document.getElementById(id);\n\n      if (!elem) {\n        return;\n      }\n\n      return actionMenus[elem.dataset.id];\n    },\n\n    /*\n     * Binds a DOM Element to the behaviour supported by action menus and\n     * implemented by this library.\n     *\n     * @param{Object} DOMElement or selector that represents the action menu form\n     */\n    bind: function bind(elem) {\n      elem = typeof elem === 'object' ? elem : document.querySelector(elem);\n\n      var out = actionMenus[elem.dataset.id];\n      if (out) {\n        return out;\n      }\n\n      out = new Action(elem);\n      actionMenus[elem.dataset.id] = out;\n\n      return out;\n    },\n\n    /*\n     * Creates a new action menu UI component.\n     *\n     * @param{Object} {\n     *                  id: \"action menu identifier\",\n     *                  title: \"action menu title\",\n     *                  actions: [\n     *                    { id: \"button identifier\", title: \"button text\",\n     *                      classList: \"whitespace-separated lists of classes\"}\n     *                  ]\n     *                }\n     */\n    create: function create(descriptor) {\n      return build(descriptor || {});\n    },\n\n    /*\n     * Releases memory removing listeners and deleting variables.\n     */\n    destroy: destroy\n  };\n\n})();\n");
__$coverInitRange("action_menu.js", "1:13");
__$coverInitRange("action_menu.js", "16:44");
__$coverInitRange("action_menu.js", "47:7168");
__$coverInitRange("action_menu.js", "192:221");
__$coverInitRange("action_menu.js", "226:382");
__$coverInitRange("action_menu.js", "387:424");
__$coverInitRange("action_menu.js", "428:443");
__$coverInitRange("action_menu.js", "550:803");
__$coverInitRange("action_menu.js", "808:3673");
__$coverInitRange("action_menu.js", "3678:3904");
__$coverInitRange("action_menu.js", "3909:4207");
__$coverInitRange("action_menu.js", "4242:4477");
__$coverInitRange("action_menu.js", "4482:4665");
__$coverInitRange("action_menu.js", "4670:5777");
__$coverInitRange("action_menu.js", "5782:7161");
__$coverInitRange("action_menu.js", "251:321");
__$coverInitRange("action_menu.js", "327:378");
__$coverInitRange("action_menu.js", "589:615");
__$coverInitRange("action_menu.js", "621:653");
__$coverInitRange("action_menu.js", "660:696");
__$coverInitRange("action_menu.js", "703:744");
__$coverInitRange("action_menu.js", "750:798");
__$coverInitRange("action_menu.js", "895:919");
__$coverInitRange("action_menu.js", "1010:1051");
__$coverInitRange("action_menu.js", "1059:1101");
__$coverInitRange("action_menu.js", "1192:1237");
__$coverInitRange("action_menu.js", "1629:1709");
__$coverInitRange("action_menu.js", "1718:1753");
__$coverInitRange("action_menu.js", "1695:1701");
__$coverInitRange("action_menu.js", "2042:2147");
__$coverInitRange("action_menu.js", "2108:2139");
__$coverInitRange("action_menu.js", "2356:3249");
__$coverInitRange("action_menu.js", "2408:2429");
__$coverInitRange("action_menu.js", "2441:2461");
__$coverInitRange("action_menu.js", "2474:2543");
__$coverInitRange("action_menu.js", "2598:2637");
__$coverInitRange("action_menu.js", "2650:2705");
__$coverInitRange("action_menu.js", "2717:2747");
__$coverInitRange("action_menu.js", "2759:2915");
__$coverInitRange("action_menu.js", "2926:2931");
__$coverInitRange("action_menu.js", "2525:2531");
__$coverInitRange("action_menu.js", "2823:2901");
__$coverInitRange("action_menu.js", "2861:2885");
__$coverInitRange("action_menu.js", "2973:3008");
__$coverInitRange("action_menu.js", "3021:3164");
__$coverInitRange("action_menu.js", "3177:3225");
__$coverInitRange("action_menu.js", "3236:3241");
__$coverInitRange("action_menu.js", "3069:3107");
__$coverInitRange("action_menu.js", "3121:3152");
__$coverInitRange("action_menu.js", "3373:3418");
__$coverInitRange("action_menu.js", "3427:3476");
__$coverInitRange("action_menu.js", "3484:3540");
__$coverInitRange("action_menu.js", "3548:3601");
__$coverInitRange("action_menu.js", "3609:3662");
__$coverInitRange("action_menu.js", "3404:3410");
__$coverInitRange("action_menu.js", "3709:3750");
__$coverInitRange("action_menu.js", "3756:3778");
__$coverInitRange("action_menu.js", "3784:3807");
__$coverInitRange("action_menu.js", "3813:3863");
__$coverInitRange("action_menu.js", "3869:3900");
__$coverInitRange("action_menu.js", "3937:3952");
__$coverInitRange("action_menu.js", "4001:4094");
__$coverInitRange("action_menu.js", "4100:4203");
__$coverInitRange("action_menu.js", "4165:4195");
__$coverInitRange("action_menu.js", "4288:4300");
__$coverInitRange("action_menu.js", "4317:4473");
__$coverInitRange("action_menu.js", "4389:4445");
__$coverInitRange("action_menu.js", "4453:4465");
__$coverInitRange("action_menu.js", "4507:4605");
__$coverInitRange("action_menu.js", "4611:4644");
__$coverInitRange("action_menu.js", "4650:4661");
__$coverInitRange("action_menu.js", "4572:4597");
__$coverInitRange("action_menu.js", "4703:4744");
__$coverInitRange("action_menu.js", "4750:4785");
__$coverInitRange("action_menu.js", "4791:4819");
__$coverInitRange("action_menu.js", "4825:4853");
__$coverInitRange("action_menu.js", "4859:4915");
__$coverInitRange("action_menu.js", "4922:4969");
__$coverInitRange("action_menu.js", "4975:5012");
__$coverInitRange("action_menu.js", "5018:5057");
__$coverInitRange("action_menu.js", "5063:5086");
__$coverInitRange("action_menu.js", "5092:5117");
__$coverInitRange("action_menu.js", "5124:5156");
__$coverInitRange("action_menu.js", "5162:5755");
__$coverInitRange("action_menu.js", "5762:5773");
__$coverInitRange("action_menu.js", "4886:4909");
__$coverInitRange("action_menu.js", "5183:5224");
__$coverInitRange("action_menu.js", "5232:5261");
__$coverInitRange("action_menu.js", "5270:5718");
__$coverInitRange("action_menu.js", "5727:5749");
__$coverInitRange("action_menu.js", "5313:5358");
__$coverInitRange("action_menu.js", "5368:5389");
__$coverInitRange("action_menu.js", "5399:5432");
__$coverInitRange("action_menu.js", "5442:5466");
__$coverInitRange("action_menu.js", "5476:5506");
__$coverInitRange("action_menu.js", "5516:5558");
__$coverInitRange("action_menu.js", "5602:5708");
__$coverInitRange("action_menu.js", "5542:5548");
__$coverInitRange("action_menu.js", "5669:5696");
__$coverInitRange("action_menu.js", "5878:5916");
__$coverInitRange("action_menu.js", "5925:5960");
__$coverInitRange("action_menu.js", "5969:6004");
__$coverInitRange("action_menu.js", "5946:5952");
__$coverInitRange("action_menu.js", "6266:6335");
__$coverInitRange("action_menu.js", "6344:6382");
__$coverInitRange("action_menu.js", "6390:6427");
__$coverInitRange("action_menu.js", "6436:6458");
__$coverInitRange("action_menu.js", "6466:6500");
__$coverInitRange("action_menu.js", "6509:6519");
__$coverInitRange("action_menu.js", "6409:6419");
__$coverInitRange("action_menu.js", "7016:7046");
__$coverCall('action_menu.js', '1:13');
'use strict';
__$coverCall('action_menu.js', '16:44');
var utils = this.utils || {};
__$coverCall('action_menu.js', '47:7168');
utils.ActionMenu = function () {
    __$coverCall('action_menu.js', '192:221');
    var FILE_NAME = 'action_menu';
    __$coverCall('action_menu.js', '226:382');
    function getPath() {
        __$coverCall('action_menu.js', '251:321');
        var path = document.querySelector('[src*="' + FILE_NAME + '.js"]').src;
        __$coverCall('action_menu.js', '327:378');
        return path.substring(0, path.lastIndexOf('/') + 1);
    }
    __$coverCall('action_menu.js', '387:424');
    var actionMenus = Object.create(null);
    __$coverCall('action_menu.js', '428:443');
    var counter = 0;
    __$coverCall('action_menu.js', '550:803');
    var Action = function (container) {
        __$coverCall('action_menu.js', '589:615');
        this.container = container;
        __$coverCall('action_menu.js', '621:653');
        container.dataset.id = ++counter;
        __$coverCall('action_menu.js', '660:696');
        this.callbacks = Object.create(null);
        __$coverCall('action_menu.js', '703:744');
        container.addEventListener('click', this);
        __$coverCall('action_menu.js', '750:798');
        container.addEventListener('animationend', this);
    };
    __$coverCall('action_menu.js', '808:3673');
    Action.prototype = {
        get id() {
            __$coverCall('action_menu.js', '895:919');
            return this.container.id;
        },
        show: function am_show() {
            __$coverCall('action_menu.js', '1010:1051');
            this.container.classList.remove('hidden');
            __$coverCall('action_menu.js', '1059:1101');
            this.container.classList.add('onviewport');
        },
        hide: function am_hide() {
            __$coverCall('action_menu.js', '1192:1237');
            this.container.classList.remove('onviewport');
        },
        addEventListener: function am_addEventListener(type, callback) {
            __$coverCall('action_menu.js', '1629:1709');
            if (type !== 'click' || typeof callback !== 'function') {
                __$coverCall('action_menu.js', '1695:1701');
                return;
            }
            __$coverCall('action_menu.js', '1718:1753');
            this.callbacks[callback] = callback;
        },
        removeEventListener: function am_removeEventListener(type, callback) {
            __$coverCall('action_menu.js', '2042:2147');
            if (type === 'click' && typeof callback === 'function') {
                __$coverCall('action_menu.js', '2108:2139');
                delete this.callbacks[callback];
            }
        },
        handleEvent: function am_handleEvent(evt) {
            __$coverCall('action_menu.js', '2356:3249');
            switch (evt.type) {
            case 'click':
                __$coverCall('action_menu.js', '2408:2429');
                evt.stopPropagation();
                __$coverCall('action_menu.js', '2441:2461');
                evt.preventDefault();
                __$coverCall('action_menu.js', '2474:2543');
                if (evt.target.tagName !== 'BUTTON') {
                    __$coverCall('action_menu.js', '2525:2531');
                    return;
                }
                __$coverCall('action_menu.js', '2598:2637');
                window.setTimeout(this.hide.bind(this));
                __$coverCall('action_menu.js', '2650:2705');
                typeof this.onclick === 'function' && this.onclick(evt);
                __$coverCall('action_menu.js', '2717:2747');
                var callbacks = this.callbacks;
                __$coverCall('action_menu.js', '2759:2915');
                Object.keys(callbacks).forEach(function (callback) {
                    __$coverCall('action_menu.js', '2823:2901');
                    setTimeout(function () {
                        __$coverCall('action_menu.js', '2861:2885');
                        callbacks[callback](evt);
                    });
                });
                __$coverCall('action_menu.js', '2926:2931');
                break;
            case 'animationend':
                __$coverCall('action_menu.js', '2973:3008');
                var eventName = 'actionmenu-showed';
                __$coverCall('action_menu.js', '3021:3164');
                if (evt.animationName === 'hide') {
                    __$coverCall('action_menu.js', '3069:3107');
                    this.container.classList.add('hidden');
                    __$coverCall('action_menu.js', '3121:3152');
                    eventName = 'actionmenu-hidden';
                }
                __$coverCall('action_menu.js', '3177:3225');
                window.dispatchEvent(new CustomEvent(eventName));
                __$coverCall('action_menu.js', '3236:3241');
                break;
            }
        },
        destroy: function am_destroy() {
            __$coverCall('action_menu.js', '3373:3418');
            if (!this.container) {
                __$coverCall('action_menu.js', '3404:3410');
                return;
            }
            __$coverCall('action_menu.js', '3427:3476');
            this.container.removeEventListener('click', this);
            __$coverCall('action_menu.js', '3484:3540');
            this.container.removeEventListener('animationend', this);
            __$coverCall('action_menu.js', '3548:3601');
            this.container.parentNode.removeChild(this.container);
            __$coverCall('action_menu.js', '3609:3662');
            this.container = this.callbacks = this.onclick = null;
        }
    };
    __$coverCall('action_menu.js', '3678:3904');
    function addStyleSheet() {
        __$coverCall('action_menu.js', '3709:3750');
        var link = document.createElement('link');
        __$coverCall('action_menu.js', '3756:3778');
        link.type = 'text/css';
        __$coverCall('action_menu.js', '3784:3807');
        link.rel = 'stylesheet';
        __$coverCall('action_menu.js', '3813:3863');
        link.href = getPath() + 'action_menu_behavior.css';
        __$coverCall('action_menu.js', '3869:3900');
        document.head.appendChild(link);
    }
    __$coverCall('action_menu.js', '3909:4207');
    function initialize() {
        __$coverCall('action_menu.js', '3937:3952');
        addStyleSheet();
        __$coverCall('action_menu.js', '4001:4094');
        var elements = document.querySelectorAll('[role="dialog"][data-type="action"]');
        __$coverCall('action_menu.js', '4100:4203');
        Array.prototype.forEach.call(elements, function (element) {
            __$coverCall('action_menu.js', '4165:4195');
            utils.ActionMenu.bind(element);
        });
    }
    __$coverCall('action_menu.js', '4242:4477');
    if (document.readyState === 'complete') {
        __$coverCall('action_menu.js', '4288:4300');
        initialize();
    } else {
        __$coverCall('action_menu.js', '4317:4473');
        document.addEventListener('DOMContentLoaded', function loaded() {
            __$coverCall('action_menu.js', '4389:4445');
            document.removeEventListener('DOMContentLoaded', loaded);
            __$coverCall('action_menu.js', '4453:4465');
            initialize();
        });
    }
    __$coverCall('action_menu.js', '4482:4665');
    function destroy() {
        __$coverCall('action_menu.js', '4507:4605');
        Object.keys(actionMenus).forEach(function destroying(id) {
            __$coverCall('action_menu.js', '4572:4597');
            actionMenus[id].destroy();
        });
        __$coverCall('action_menu.js', '4611:4644');
        actionMenus = Object.create(null);
        __$coverCall('action_menu.js', '4650:4661');
        counter = 0;
    }
    __$coverCall('action_menu.js', '4670:5777');
    function build(descriptor) {
        __$coverCall('action_menu.js', '4703:4744');
        var form = document.createElement('form');
        __$coverCall('action_menu.js', '4750:4785');
        form.setAttribute('role', 'dialog');
        __$coverCall('action_menu.js', '4791:4819');
        form.dataset.type = 'action';
        __$coverCall('action_menu.js', '4825:4853');
        form.classList.add('hidden');
        __$coverCall('action_menu.js', '4859:4915');
        if (descriptor.id) {
            __$coverCall('action_menu.js', '4886:4909');
            form.id = descriptor.id;
        }
        __$coverCall('action_menu.js', '4922:4969');
        var section = document.createElement('section');
        __$coverCall('action_menu.js', '4975:5012');
        var h1 = document.createElement('h1');
        __$coverCall('action_menu.js', '5018:5057');
        h1.textContent = descriptor.title || '';
        __$coverCall('action_menu.js', '5063:5086');
        section.appendChild(h1);
        __$coverCall('action_menu.js', '5092:5117');
        form.appendChild(section);
        __$coverCall('action_menu.js', '5124:5156');
        var actions = descriptor.actions;
        __$coverCall('action_menu.js', '5162:5755');
        if (actions) {
            __$coverCall('action_menu.js', '5183:5224');
            var menu = document.createElement('menu');
            __$coverCall('action_menu.js', '5232:5261');
            menu.classList.add('actions');
            __$coverCall('action_menu.js', '5270:5718');
            actions.forEach(function (action) {
                __$coverCall('action_menu.js', '5313:5358');
                var button = document.createElement('button');
                __$coverCall('action_menu.js', '5368:5389');
                button.id = action.id;
                __$coverCall('action_menu.js', '5399:5432');
                button.textContent = action.title;
                __$coverCall('action_menu.js', '5442:5466');
                menu.appendChild(button);
                __$coverCall('action_menu.js', '5476:5506');
                var classes = action.classList;
                __$coverCall('action_menu.js', '5516:5558');
                if (!classes) {
                    __$coverCall('action_menu.js', '5542:5548');
                    return;
                }
                __$coverCall('action_menu.js', '5602:5708');
                classes.trim().split(/\s+/g).forEach(function (clazz) {
                    __$coverCall('action_menu.js', '5669:5696');
                    button.classList.add(clazz);
                });
            });
            __$coverCall('action_menu.js', '5727:5749');
            form.appendChild(menu);
        }
        __$coverCall('action_menu.js', '5762:5773');
        return form;
    }
    __$coverCall('action_menu.js', '5782:7161');
    return {
        get: function get(id) {
            __$coverCall('action_menu.js', '5878:5916');
            var elem = document.getElementById(id);
            __$coverCall('action_menu.js', '5925:5960');
            if (!elem) {
                __$coverCall('action_menu.js', '5946:5952');
                return;
            }
            __$coverCall('action_menu.js', '5969:6004');
            return actionMenus[elem.dataset.id];
        },
        bind: function bind(elem) {
            __$coverCall('action_menu.js', '6266:6335');
            elem = typeof elem === 'object' ? elem : document.querySelector(elem);
            __$coverCall('action_menu.js', '6344:6382');
            var out = actionMenus[elem.dataset.id];
            __$coverCall('action_menu.js', '6390:6427');
            if (out) {
                __$coverCall('action_menu.js', '6409:6419');
                return out;
            }
            __$coverCall('action_menu.js', '6436:6458');
            out = new Action(elem);
            __$coverCall('action_menu.js', '6466:6500');
            actionMenus[elem.dataset.id] = out;
            __$coverCall('action_menu.js', '6509:6519');
            return out;
        },
        create: function create(descriptor) {
            __$coverCall('action_menu.js', '7016:7046');
            return build(descriptor || {});
        },
        destroy: destroy
    };
}();