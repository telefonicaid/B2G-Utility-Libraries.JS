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
__$coverInit("templates.js", "/*\n *  Module: Templates\n *\n *  Product: Open Web Device\n *\n *  Copyright(c) 2015 Telefónica I+D S.A.U.\n *\n *  LICENSE: Apache 2.0\n *\n *  @author Open Web Devices Team @ Telefónica\n *\n *  The module allows to work with HTML templates in client-side JS environments\n *\n *  @example\n *\n *   <ul id=\"theList\">\n *    <template>\n *     <li>\n *      <dl>\n *         <dt>${name}</dt>\n *         <dd class=\"img\"><img src=\"${contactImg}\"></dd>\n *      </dl>\n *     </li>\n *    </template>\n *   </ul>\n *\n *   var myObj = { name: 'Nice Name!', contactImg: 'myImg.jpg' };\n *   utils.templates.append('#theList',myObj);\n *\n */\n\n\nvar utils = window.utils || {};\n\nif (!utils.templates) {\n  (function() {\n    var Templates = utils.templates = {};\n\n    const TEMPLATE_SELECTOR = 'template';\n\n    /**\n     *  Returns a target HTMLElement from a selector or HTMLElement itself\n     *\n     *  @param {HTMLElement or Selector} element target element.\n     *\n     *  @return {HTMLElement} HTMLElement according to the selector or itself.\n     *\n     *\n     */\n    function getTarget(element) {\n      var target = element;\n      if (!element.tagName) {\n        target = document.querySelector(element);\n      }\n\n      return target;\n    }\n\n    /**\n    *    Given a target HTML element which contains a template set\n    *    returns the template that will have to be applied over the data\n    *\n    *    @param {HTMLElement} target which contains the template.\n    *    @param {Object} data to be used on the template.\n    *\n    *    @return {HTMLElement} HTMLElement with the template.\n    *\n    */\n    function getTemplate(target, data) {\n      var template;\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      var total = templates.length;\n\n      var multi = false;\n      if (total > 1) {\n        multi = true;\n      }\n\n      var evaluation;\n\n      for (var c = 0; c < total; c++) {\n        var condition = templates.item(c).dataset.condition;\n\n        if (condition) {\n          evaluation = get(data, condition);\n          if (evaluation) {\n            template = templates.item(c);\n            break;\n          }\n        } else {\n          // Just to be sure that if there is no a condition\n          // something will be selected\n          template = templates.item(c);\n        }\n      } // Iteration trying to find a template\n\n      return {template: template, isMulti: multi};\n    }\n\n    /**\n     *   Returns a function used to replace data on a template\n     *\n     *   @param {Object} data the data to be used on the template.\n     *\n     *   @return {function} to be used.\n     *\n     */\n    function templateReplace(data) {\n      return function(text, property) {\n        var out = get(data, property);\n        if (typeof out === 'undefined') {\n          out = text;\n        }\n        return out;\n      }\n    }\n\n    /**\n     *   Look recursively for an object field or subfield.\n     *\n     *   @param {Object} data the object where looking into.\n     *\n     *   @param {String} path dotted (Java-package-like) path to the field\n     *   to be retrieved.\n     *\n     *   @return {AnyType} data into the given field.\n     *\n     */\n    function get(data, path) {\n\n      function doGet(pdata, fields) {\n        var out;\n        var data = pdata;\n        if (typeof pdata === 'function') {\n          data = pdata();\n        }\n\n        // Base case: goal reached\n        if (fields.length === 0) {\n          out = data;\n        // Recursive case: access the field and look into\n        } else if (data !== null && typeof data !== 'undefined') {\n          var field = fields.shift();\n          if (typeof data[field] === 'function') {\n            out = doGet(data[field](), fields);\n          }\n          else {\n            out = doGet(data[field], fields);\n          }\n        }\n        return out;\n      }\n\n      var fieldList = path.split('.');\n      return doGet(data, fieldList);\n    }\n\n    /**\n     *  Adds (append or prepend) a new instance HTMLElement (or array of)\n     *  of a template\n     *  The template is assumed to be a child of the element\n     *  passed as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement} ele container lement that contains the template\n     *  and which will contain the new instance. Can be an HTMLElement\n     *  or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @param {String} mode oneOf ('A','P').\n     *\n     *  @return {HTMLElement} (or last element if data is an array).\n     *\n     *\n     */\n    function add(element, data, mode) {\n      // It is supported both the element itself or a selector\n      var target = getTarget(element);\n      var newElem;\n\n      var theData = [data];\n      if (data instanceof Array) {\n        theData = data;\n      }\n\n      // Optimization to avoid trying to find a template when\n      // only one is needed\n      var multiTemplate = true;\n      var template;\n      var idx = 0;\n      theData.forEach(function(oneData) {\n        // Pseudo-field with the index\n        oneData._idx_ = idx++;\n        // A suitable template for the data is firstly found\n         if (multiTemplate === true) {\n         var tresult = getTemplate(target, oneData);\n          template = tresult.template;\n          if (tresult.isMulti === false) {\n            multiTemplate = false;\n          }\n        }\n\n        if (template) {\n          newElem = this.render(template, oneData);\n\n          if (mode === 'A') {\n             target.appendChild(newElem);\n          } else if (mode === 'P') { // Append mode\n            if (target.firstChild) {\n              target.insertBefore(newElem, target.firstChild);\n            } else {\n              target.appendChild(newElem);\n            }\n          } // prepend mode\n\n        } // if template\n\n      }.bind(this)); // forEach data\n\n      return newElem;\n    }\n\n\n    /**\n     *  Appends a new instance HTMLElement (or array of) of a template\n     *\n     *  The template is assumed to be a child of the element passed\n     *  as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement or String} ele container element that\n     *  contains the template and which will contain the new instance.\n     *  Can be an HTMLElement or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @return {HTMLelement} (or last element if data is an array).\n     *\n     *\n     */\n    Templates.append = function(element, data) {\n      var f = add.bind(this);\n\n      return f(element, data, 'A');\n    };\n\n\n    /**\n     *   Prepends a new instance (or array of) of a template\n     *\n     *   The template is assumed to be a child of the element passed\n     *   as parameter\n     *\n     *   @param {HTMLElement or String} ele container element that\n     *   contains the template and which will contain the new instance.\n     *   Can be an HTMLElement or a CSS selector.\n     *\n     *   @param {Object or Array} data with the data displayed.\n     *\n     *   @return {HTMLElement} added.\n     *\n     *\n     */\n    Templates.prepend = function(element, data) {\n       var f = add.bind(this);\n\n      return f(element, data, 'P');\n    };\n\n\n    /**\n     *  Renders the content specified by a template with object data\n     *\n     *  @param {HTMLElement} eleTemplate the template itself.\n     *  @param {Object} data the data to be used.\n     *\n     *  @return {HTMLElement} according to the template and with the data.\n     *\n     *\n     */\n    Templates.render = function(eleTemplate, data) {\n      var newElem = document.importNode(eleTemplate.content.firstElementChild,\n                                        true);\n      var inner = newElem.innerHTML;\n\n      // Replace function\n      var replaceFunction = templateReplace(data);\n\n      var pattern = /\\$\\{([^}]+)\\}/g;\n      var ninner = inner.replace(pattern, replaceFunction);\n\n      newElem.innerHTML = ninner;\n\n      var attrs = newElem.attributes;\n\n      var total = attrs.length;\n      for (var c = 0; c < total; c++) {\n        var val = attrs[c].value;\n        var nval = val.replace(pattern, replaceFunction);\n\n        newElem.setAttribute(attrs[c].name, nval);\n      }\n\n      if (!newElem.id) {\n        if (data.id) {\n          newElem.id = data.id;\n        }\n      }\n\n      return newElem;\n    };\n\n    /**\n     *  Clears a container element\n     *\n     *  @param {HTMLElement or String} element (selector or HTML element).\n     *\n     *\n     */\n    Templates.clear = function(element) {\n      var target = getTarget(element);\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      target.innerHTML = '';\n\n      var total = templates.length;\n      for (var c = 0; c < total; c++) {\n        target.appendChild(templates.item(c));\n      }\n    };\n  }) ();\n} // window.templates\n");
__$coverInitRange("templates.js", "616:646");
__$coverInitRange("templates.js", "649:8838");
__$coverInitRange("templates.js", "675:8836");
__$coverInitRange("templates.js", "693:729");
__$coverInitRange("templates.js", "736:772");
__$coverInitRange("templates.js", "1042:1214");
__$coverInitRange("templates.js", "1580:2387");
__$coverInitRange("templates.js", "2601:2819");
__$coverInitRange("templates.js", "3145:3894");
__$coverInitRange("templates.js", "4565:5883");
__$coverInitRange("templates.js", "6495:6612");
__$coverInitRange("templates.js", "7121:7240");
__$coverInitRange("templates.js", "7548:8363");
__$coverInitRange("templates.js", "8517:8827");
__$coverInitRange("templates.js", "1078:1098");
__$coverInitRange("templates.js", "1106:1186");
__$coverInitRange("templates.js", "1195:1208");
__$coverInitRange("templates.js", "1138:1178");
__$coverInitRange("templates.js", "1623:1635");
__$coverInitRange("templates.js", "1643:1701");
__$coverInitRange("templates.js", "1710:1738");
__$coverInitRange("templates.js", "1747:1764");
__$coverInitRange("templates.js", "1772:1817");
__$coverInitRange("templates.js", "1826:1840");
__$coverInitRange("templates.js", "1849:2290");
__$coverInitRange("templates.js", "2338:2381");
__$coverInitRange("templates.js", "1797:1809");
__$coverInitRange("templates.js", "1891:1942");
__$coverInitRange("templates.js", "1953:2282");
__$coverInitRange("templates.js", "1980:2013");
__$coverInitRange("templates.js", "2025:2114");
__$coverInitRange("templates.js", "2055:2083");
__$coverInitRange("templates.js", "2097:2102");
__$coverInitRange("templates.js", "2244:2272");
__$coverInitRange("templates.js", "2640:2818");
__$coverInitRange("templates.js", "2682:2711");
__$coverInitRange("templates.js", "2721:2785");
__$coverInitRange("templates.js", "2795:2805");
__$coverInitRange("templates.js", "2765:2775");
__$coverInitRange("templates.js", "3179:3811");
__$coverInitRange("templates.js", "3820:3851");
__$coverInitRange("templates.js", "3859:3888");
__$coverInitRange("templates.js", "3219:3226");
__$coverInitRange("templates.js", "3236:3252");
__$coverInitRange("templates.js", "3262:3331");
__$coverInitRange("templates.js", "3377:3783");
__$coverInitRange("templates.js", "3793:3803");
__$coverInitRange("templates.js", "3307:3321");
__$coverInitRange("templates.js", "3414:3424");
__$coverInitRange("templates.js", "3561:3587");
__$coverInitRange("templates.js", "3599:3773");
__$coverInitRange("templates.js", "3652:3686");
__$coverInitRange("templates.js", "3729:3761");
__$coverInitRange("templates.js", "4670:4701");
__$coverInitRange("templates.js", "4709:4720");
__$coverInitRange("templates.js", "4729:4749");
__$coverInitRange("templates.js", "4757:4816");
__$coverInitRange("templates.js", "4915:4939");
__$coverInitRange("templates.js", "4947:4959");
__$coverInitRange("templates.js", "4967:4978");
__$coverInitRange("templates.js", "4986:5838");
__$coverInitRange("templates.js", "5863:5877");
__$coverInitRange("templates.js", "4794:4808");
__$coverInitRange("templates.js", "5069:5090");
__$coverInitRange("templates.js", "5162:5382");
__$coverInitRange("templates.js", "5393:5801");
__$coverInitRange("templates.js", "5201:5243");
__$coverInitRange("templates.js", "5255:5282");
__$coverInitRange("templates.js", "5294:5372");
__$coverInitRange("templates.js", "5339:5360");
__$coverInitRange("templates.js", "5419:5459");
__$coverInitRange("templates.js", "5472:5774");
__$coverInitRange("templates.js", "5505:5532");
__$coverInitRange("templates.js", "5598:5762");
__$coverInitRange("templates.js", "5637:5684");
__$coverInitRange("templates.js", "5721:5748");
__$coverInitRange("templates.js", "6546:6568");
__$coverInitRange("templates.js", "6577:6605");
__$coverInitRange("templates.js", "7174:7196");
__$coverInitRange("templates.js", "7205:7233");
__$coverInitRange("templates.js", "7603:7721");
__$coverInitRange("templates.js", "7729:7758");
__$coverInitRange("templates.js", "7793:7836");
__$coverInitRange("templates.js", "7845:7875");
__$coverInitRange("templates.js", "7883:7935");
__$coverInitRange("templates.js", "7944:7970");
__$coverInitRange("templates.js", "7979:8009");
__$coverInitRange("templates.js", "8018:8042");
__$coverInitRange("templates.js", "8050:8234");
__$coverInitRange("templates.js", "8243:8333");
__$coverInitRange("templates.js", "8342:8356");
__$coverInitRange("templates.js", "8092:8116");
__$coverInitRange("templates.js", "8126:8174");
__$coverInitRange("templates.js", "8185:8226");
__$coverInitRange("templates.js", "8270:8325");
__$coverInitRange("templates.js", "8295:8315");
__$coverInitRange("templates.js", "8561:8592");
__$coverInitRange("templates.js", "8600:8658");
__$coverInitRange("templates.js", "8667:8688");
__$coverInitRange("templates.js", "8697:8725");
__$coverInitRange("templates.js", "8733:8820");
__$coverInitRange("templates.js", "8775:8812");
__$coverCall('templates.js', '616:646');
var utils = window.utils || {};
__$coverCall('templates.js', '649:8838');
if (!utils.templates) {
    __$coverCall('templates.js', '675:8836');
    (function () {
        __$coverCall('templates.js', '693:729');
        var Templates = utils.templates = {};
        __$coverCall('templates.js', '736:772');
        const TEMPLATE_SELECTOR = 'template';
        __$coverCall('templates.js', '1042:1214');
        function getTarget(element) {
            __$coverCall('templates.js', '1078:1098');
            var target = element;
            __$coverCall('templates.js', '1106:1186');
            if (!element.tagName) {
                __$coverCall('templates.js', '1138:1178');
                target = document.querySelector(element);
            }
            __$coverCall('templates.js', '1195:1208');
            return target;
        }
        __$coverCall('templates.js', '1580:2387');
        function getTemplate(target, data) {
            __$coverCall('templates.js', '1623:1635');
            var template;
            __$coverCall('templates.js', '1643:1701');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '1710:1738');
            var total = templates.length;
            __$coverCall('templates.js', '1747:1764');
            var multi = false;
            __$coverCall('templates.js', '1772:1817');
            if (total > 1) {
                __$coverCall('templates.js', '1797:1809');
                multi = true;
            }
            __$coverCall('templates.js', '1826:1840');
            var evaluation;
            __$coverCall('templates.js', '1849:2290');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '1891:1942');
                var condition = templates.item(c).dataset.condition;
                __$coverCall('templates.js', '1953:2282');
                if (condition) {
                    __$coverCall('templates.js', '1980:2013');
                    evaluation = get(data, condition);
                    __$coverCall('templates.js', '2025:2114');
                    if (evaluation) {
                        __$coverCall('templates.js', '2055:2083');
                        template = templates.item(c);
                        __$coverCall('templates.js', '2097:2102');
                        break;
                    }
                } else {
                    __$coverCall('templates.js', '2244:2272');
                    template = templates.item(c);
                }
            }
            __$coverCall('templates.js', '2338:2381');
            return {
                template: template,
                isMulti: multi
            };
        }
        __$coverCall('templates.js', '2601:2819');
        function templateReplace(data) {
            __$coverCall('templates.js', '2640:2818');
            return function (text, property) {
                __$coverCall('templates.js', '2682:2711');
                var out = get(data, property);
                __$coverCall('templates.js', '2721:2785');
                if (typeof out === 'undefined') {
                    __$coverCall('templates.js', '2765:2775');
                    out = text;
                }
                __$coverCall('templates.js', '2795:2805');
                return out;
            };
        }
        __$coverCall('templates.js', '3145:3894');
        function get(data, path) {
            __$coverCall('templates.js', '3179:3811');
            function doGet(pdata, fields) {
                __$coverCall('templates.js', '3219:3226');
                var out;
                __$coverCall('templates.js', '3236:3252');
                var data = pdata;
                __$coverCall('templates.js', '3262:3331');
                if (typeof pdata === 'function') {
                    __$coverCall('templates.js', '3307:3321');
                    data = pdata();
                }
                __$coverCall('templates.js', '3377:3783');
                if (fields.length === 0) {
                    __$coverCall('templates.js', '3414:3424');
                    out = data;
                } else if (data !== null && typeof data !== 'undefined') {
                    __$coverCall('templates.js', '3561:3587');
                    var field = fields.shift();
                    __$coverCall('templates.js', '3599:3773');
                    if (typeof data[field] === 'function') {
                        __$coverCall('templates.js', '3652:3686');
                        out = doGet(data[field](), fields);
                    } else {
                        __$coverCall('templates.js', '3729:3761');
                        out = doGet(data[field], fields);
                    }
                }
                __$coverCall('templates.js', '3793:3803');
                return out;
            }
            __$coverCall('templates.js', '3820:3851');
            var fieldList = path.split('.');
            __$coverCall('templates.js', '3859:3888');
            return doGet(data, fieldList);
        }
        __$coverCall('templates.js', '4565:5883');
        function add(element, data, mode) {
            __$coverCall('templates.js', '4670:4701');
            var target = getTarget(element);
            __$coverCall('templates.js', '4709:4720');
            var newElem;
            __$coverCall('templates.js', '4729:4749');
            var theData = [data];
            __$coverCall('templates.js', '4757:4816');
            if (data instanceof Array) {
                __$coverCall('templates.js', '4794:4808');
                theData = data;
            }
            __$coverCall('templates.js', '4915:4939');
            var multiTemplate = true;
            __$coverCall('templates.js', '4947:4959');
            var template;
            __$coverCall('templates.js', '4967:4978');
            var idx = 0;
            __$coverCall('templates.js', '4986:5838');
            theData.forEach(function (oneData) {
                __$coverCall('templates.js', '5069:5090');
                oneData._idx_ = idx++;
                __$coverCall('templates.js', '5162:5382');
                if (multiTemplate === true) {
                    __$coverCall('templates.js', '5201:5243');
                    var tresult = getTemplate(target, oneData);
                    __$coverCall('templates.js', '5255:5282');
                    template = tresult.template;
                    __$coverCall('templates.js', '5294:5372');
                    if (tresult.isMulti === false) {
                        __$coverCall('templates.js', '5339:5360');
                        multiTemplate = false;
                    }
                }
                __$coverCall('templates.js', '5393:5801');
                if (template) {
                    __$coverCall('templates.js', '5419:5459');
                    newElem = this.render(template, oneData);
                    __$coverCall('templates.js', '5472:5774');
                    if (mode === 'A') {
                        __$coverCall('templates.js', '5505:5532');
                        target.appendChild(newElem);
                    } else if (mode === 'P') {
                        __$coverCall('templates.js', '5598:5762');
                        if (target.firstChild) {
                            __$coverCall('templates.js', '5637:5684');
                            target.insertBefore(newElem, target.firstChild);
                        } else {
                            __$coverCall('templates.js', '5721:5748');
                            target.appendChild(newElem);
                        }
                    }
                }
            }.bind(this));
            __$coverCall('templates.js', '5863:5877');
            return newElem;
        }
        __$coverCall('templates.js', '6495:6612');
        Templates.append = function (element, data) {
            __$coverCall('templates.js', '6546:6568');
            var f = add.bind(this);
            __$coverCall('templates.js', '6577:6605');
            return f(element, data, 'A');
        };
        __$coverCall('templates.js', '7121:7240');
        Templates.prepend = function (element, data) {
            __$coverCall('templates.js', '7174:7196');
            var f = add.bind(this);
            __$coverCall('templates.js', '7205:7233');
            return f(element, data, 'P');
        };
        __$coverCall('templates.js', '7548:8363');
        Templates.render = function (eleTemplate, data) {
            __$coverCall('templates.js', '7603:7721');
            var newElem = document.importNode(eleTemplate.content.firstElementChild, true);
            __$coverCall('templates.js', '7729:7758');
            var inner = newElem.innerHTML;
            __$coverCall('templates.js', '7793:7836');
            var replaceFunction = templateReplace(data);
            __$coverCall('templates.js', '7845:7875');
            var pattern = /\$\{([^}]+)\}/g;
            __$coverCall('templates.js', '7883:7935');
            var ninner = inner.replace(pattern, replaceFunction);
            __$coverCall('templates.js', '7944:7970');
            newElem.innerHTML = ninner;
            __$coverCall('templates.js', '7979:8009');
            var attrs = newElem.attributes;
            __$coverCall('templates.js', '8018:8042');
            var total = attrs.length;
            __$coverCall('templates.js', '8050:8234');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '8092:8116');
                var val = attrs[c].value;
                __$coverCall('templates.js', '8126:8174');
                var nval = val.replace(pattern, replaceFunction);
                __$coverCall('templates.js', '8185:8226');
                newElem.setAttribute(attrs[c].name, nval);
            }
            __$coverCall('templates.js', '8243:8333');
            if (!newElem.id) {
                __$coverCall('templates.js', '8270:8325');
                if (data.id) {
                    __$coverCall('templates.js', '8295:8315');
                    newElem.id = data.id;
                }
            }
            __$coverCall('templates.js', '8342:8356');
            return newElem;
        };
        __$coverCall('templates.js', '8517:8827');
        Templates.clear = function (element) {
            __$coverCall('templates.js', '8561:8592');
            var target = getTarget(element);
            __$coverCall('templates.js', '8600:8658');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '8667:8688');
            target.innerHTML = '';
            __$coverCall('templates.js', '8697:8725');
            var total = templates.length;
            __$coverCall('templates.js', '8733:8820');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '8775:8812');
                target.appendChild(templates.item(c));
            }
        };
    }());
}