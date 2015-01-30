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
__$coverInit("templates.js", "/*\n *  Module: Templates\n *\n *  Product: Open Web Device\n *\n *  Copyright(c) 2015 Telefónica I+D S.A.U.\n *\n *  LICENSE: Apache 2.0\n *\n *  @author Open Web Devices Team @ Telefónica\n *\n *  The module allows to work with HTML templates in client-side JS environments\n *\n *  @example\n *\n *   <ul id=\"theList\">\n *    <template>\n *     <li>\n *      <dl>\n *         <dt>#name#</dt>\n *         <dd class=\"img\"><img src=\"#contactImg#\"></dd>\n *      </dl>\n *     </li>\n *    </template>\n *   </ul>\n *\n *   var myObj = { name: 'Nice Name!', contactImg: 'myImg.jpg' };\n *   utils.templates.append('#theList',myObj);\n *\n */\n\n\nvar utils = window.utils || {};\n\nif (!utils.templates) {\n  (function() {\n    var Templates = utils.templates = {};\n\n    const TEMPLATE_SELECTOR = 'template';\n\n    /**\n     *  Returns a target HTMLElement from a selector or HTMLElement itself\n     *\n     *  @param {HTMLElement or Selector} element target element.\n     *\n     *  @return {HTMLElement} HTMLElement according to the selector or itself.\n     *\n     *\n     */\n    function getTarget(element) {\n      var target = element;\n      if (!element.tagName) {\n        target = document.querySelector(element);\n      }\n\n      return target;\n    }\n\n    /**\n    *    Given a target HTML element which contains a template set\n    *    returns the template that will have to be applied over the data\n    *\n    *    @param {HTMLElement} target which contains the template.\n    *    @param {Object} data to be used on the template.\n    *\n    *    @return {HTMLElement} HTMLElement with the template.\n    *\n    */\n    function getTemplate(target, data) {\n      var template;\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      var total = templates.length;\n\n      var multi = false;\n      if (total > 1) {\n        multi = true;\n      }\n\n      var evaluation;\n\n      for (var c = 0; c < total; c++) {\n        var condition = templates.item(c).dataset.condition;\n\n        if (condition) {\n          evaluation = get(data, condition);\n          if (evaluation) {\n            template = templates.item(c);\n            break;\n          }\n        } else {\n          // Just to be sure that if there is no a condition\n          // something will be selected\n          template = templates.item(c);\n        }\n      } // Iteration trying to find a template\n\n      return {template: template, isMulti: multi};\n    }\n\n    /**\n     *   Returns a function used to replace data on a template\n     *\n     *   @param {Object} data the data to be used on the template.\n     *\n     *   @return {function} to be used.\n     *\n     */\n    function templateReplace(data) {\n      return function(text, property) {\n        var out = get(data, property);\n        if (typeof out === 'undefined') {\n          out = text;\n        }\n        return out;\n      }\n    }\n\n    /**\n     *   Look recursively for an object field or subfield.\n     *\n     *   @param {Object} data the object where looking into.\n     *\n     *   @param {String} path dotted (Java-package-like) path to the field\n     *   to be retrieved.\n     *\n     *   @return {AnyType} data into the given field.\n     *\n     */\n    function get(data, path) {\n\n      function doGet(pdata, fields) {\n        var out;\n        var data = pdata;\n        if (typeof pdata === 'function') {\n          data = pdata();\n        }\n\n        // Base case: goal reached\n        if (fields.length === 0) {\n          out = data;\n        // Recursive case: access the field and look into\n        } else if (data !== null && typeof data !== 'undefined') {\n          var field = fields.shift();\n          if (typeof data[field] === 'function') {\n            out = doGet(data[field](), fields);\n          }\n          else {\n            out = doGet(data[field], fields);\n          }\n        }\n        return out;\n      }\n\n      var fieldList = path.split('.');\n      return doGet(data, fieldList);\n    }\n\n    /**\n     *  Adds (append or prepend) a new instance HTMLElement (or array of)\n     *  of a template\n     *  The template is assumed to be a child of the element\n     *  passed as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement} ele container lement that contains the template\n     *  and which will contain the new instance. Can be an HTMLElement\n     *  or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @param {String} mode oneOf ('A','P').\n     *\n     *  @return {HTMLElement} (or last element if data is an array).\n     *\n     *\n     */\n    function add(element, data, mode) {\n      // It is supported both the element itself or a selector\n      var target = getTarget(element);\n      var newElem;\n\n      var theData = [data];\n      if (data instanceof Array) {\n        theData = data;\n      }\n\n      // Optimization to avoid trying to find a template when\n      // only one is needed\n      var multiTemplate = true;\n      var template;\n      var idx = 0;\n      theData.forEach(function(oneData) {\n        // Pseudo-field with the index\n        oneData._idx_ = idx++;\n        // A suitable template for the data is firstly found\n         if (multiTemplate === true) {\n         var tresult = getTemplate(target, oneData);\n          template = tresult.template;\n          if (tresult.isMulti === false) {\n            multiTemplate = false;\n          }\n        }\n\n        if (template) {\n          newElem = this.render(template, oneData);\n\n          if (mode === 'A') {\n             target.appendChild(newElem);\n          } else if (mode === 'P') { // Append mode\n            if (target.firstChild) {\n              target.insertBefore(newElem, target.firstChild);\n            } else {\n              target.appendChild(newElem);\n            }\n          } // prepend mode\n\n        } // if template\n\n      }.bind(this)); // forEach data\n\n      return newElem;\n    }\n\n\n    /**\n     *  Appends a new instance HTMLElement (or array of) of a template\n     *\n     *  The template is assumed to be a child of the element passed\n     *  as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement or String} ele container element that\n     *  contains the template and which will contain the new instance.\n     *  Can be an HTMLElement or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @return {HTMLelement} (or last element if data is an array).\n     *\n     *\n     */\n    Templates.append = function(element, data) {\n      var f = add.bind(this);\n\n      return f(element, data, 'A');\n    };\n\n\n    /**\n     *   Prepends a new instance (or array of) of a template\n     *\n     *   The template is assumed to be a child of the element passed\n     *   as parameter\n     *\n     *   @param {HTMLElement or String} ele container element that\n     *   contains the template and which will contain the new instance.\n     *   Can be an HTMLElement or a CSS selector.\n     *\n     *   @param {Object or Array} data with the data displayed.\n     *\n     *   @return {HTMLElement} added.\n     *\n     *\n     */\n    Templates.prepend = function(element, data) {\n       var f = add.bind(this);\n\n      return f(element, data, 'P');\n    };\n\n\n    /**\n     *  Renders the content specified by a template with object data\n     *\n     *  @param {HTMLElement} eleTemplate the template itself.\n     *  @param {Object} data the data to be used.\n     *\n     *  @return {HTMLElement} according to the template and with the data.\n     *\n     *\n     */\n    Templates.render = function(eleTemplate, data) {\n      var newElem = document.importNode(eleTemplate.content.firstElementChild,\n                                        true);\n      var inner = newElem.innerHTML;\n\n      // Replace function\n      var replaceFunction = templateReplace(data);\n\n      var pattern = /#(\\w+[\\w.]*)#/g;\n      var ninner = inner.replace(pattern, replaceFunction);\n\n      newElem.innerHTML = ninner;\n\n      var attrs = newElem.attributes;\n\n      var total = attrs.length;\n      for (var c = 0; c < total; c++) {\n        var val = attrs[c].value;\n        var nval = val.replace(pattern, replaceFunction);\n\n        newElem.setAttribute(attrs[c].name, nval);\n      }\n\n      if (!newElem.id) {\n        if (data.id) {\n          newElem.id = data.id;\n        }\n      }\n\n      return newElem;\n    };\n\n    /**\n     *  Clears a container element\n     *\n     *  @param {HTMLElement or String} element (selector or HTML element).\n     *\n     *\n     */\n    Templates.clear = function(element) {\n      var target = getTarget(element);\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      target.innerHTML = '';\n\n      var total = templates.length;\n      for (var c = 0; c < total; c++) {\n        target.appendChild(templates.item(c));\n      }\n    };\n  }) ();\n} // window.templates\n");
__$coverInitRange("templates.js", "614:644");
__$coverInitRange("templates.js", "647:8836");
__$coverInitRange("templates.js", "673:8834");
__$coverInitRange("templates.js", "691:727");
__$coverInitRange("templates.js", "734:770");
__$coverInitRange("templates.js", "1040:1212");
__$coverInitRange("templates.js", "1578:2385");
__$coverInitRange("templates.js", "2599:2817");
__$coverInitRange("templates.js", "3143:3892");
__$coverInitRange("templates.js", "4563:5881");
__$coverInitRange("templates.js", "6493:6610");
__$coverInitRange("templates.js", "7119:7238");
__$coverInitRange("templates.js", "7546:8361");
__$coverInitRange("templates.js", "8515:8825");
__$coverInitRange("templates.js", "1076:1096");
__$coverInitRange("templates.js", "1104:1184");
__$coverInitRange("templates.js", "1193:1206");
__$coverInitRange("templates.js", "1136:1176");
__$coverInitRange("templates.js", "1621:1633");
__$coverInitRange("templates.js", "1641:1699");
__$coverInitRange("templates.js", "1708:1736");
__$coverInitRange("templates.js", "1745:1762");
__$coverInitRange("templates.js", "1770:1815");
__$coverInitRange("templates.js", "1824:1838");
__$coverInitRange("templates.js", "1847:2288");
__$coverInitRange("templates.js", "2336:2379");
__$coverInitRange("templates.js", "1795:1807");
__$coverInitRange("templates.js", "1889:1940");
__$coverInitRange("templates.js", "1951:2280");
__$coverInitRange("templates.js", "1978:2011");
__$coverInitRange("templates.js", "2023:2112");
__$coverInitRange("templates.js", "2053:2081");
__$coverInitRange("templates.js", "2095:2100");
__$coverInitRange("templates.js", "2242:2270");
__$coverInitRange("templates.js", "2638:2816");
__$coverInitRange("templates.js", "2680:2709");
__$coverInitRange("templates.js", "2719:2783");
__$coverInitRange("templates.js", "2793:2803");
__$coverInitRange("templates.js", "2763:2773");
__$coverInitRange("templates.js", "3177:3809");
__$coverInitRange("templates.js", "3818:3849");
__$coverInitRange("templates.js", "3857:3886");
__$coverInitRange("templates.js", "3217:3224");
__$coverInitRange("templates.js", "3234:3250");
__$coverInitRange("templates.js", "3260:3329");
__$coverInitRange("templates.js", "3375:3781");
__$coverInitRange("templates.js", "3791:3801");
__$coverInitRange("templates.js", "3305:3319");
__$coverInitRange("templates.js", "3412:3422");
__$coverInitRange("templates.js", "3559:3585");
__$coverInitRange("templates.js", "3597:3771");
__$coverInitRange("templates.js", "3650:3684");
__$coverInitRange("templates.js", "3727:3759");
__$coverInitRange("templates.js", "4668:4699");
__$coverInitRange("templates.js", "4707:4718");
__$coverInitRange("templates.js", "4727:4747");
__$coverInitRange("templates.js", "4755:4814");
__$coverInitRange("templates.js", "4913:4937");
__$coverInitRange("templates.js", "4945:4957");
__$coverInitRange("templates.js", "4965:4976");
__$coverInitRange("templates.js", "4984:5836");
__$coverInitRange("templates.js", "5861:5875");
__$coverInitRange("templates.js", "4792:4806");
__$coverInitRange("templates.js", "5067:5088");
__$coverInitRange("templates.js", "5160:5380");
__$coverInitRange("templates.js", "5391:5799");
__$coverInitRange("templates.js", "5199:5241");
__$coverInitRange("templates.js", "5253:5280");
__$coverInitRange("templates.js", "5292:5370");
__$coverInitRange("templates.js", "5337:5358");
__$coverInitRange("templates.js", "5417:5457");
__$coverInitRange("templates.js", "5470:5772");
__$coverInitRange("templates.js", "5503:5530");
__$coverInitRange("templates.js", "5596:5760");
__$coverInitRange("templates.js", "5635:5682");
__$coverInitRange("templates.js", "5719:5746");
__$coverInitRange("templates.js", "6544:6566");
__$coverInitRange("templates.js", "6575:6603");
__$coverInitRange("templates.js", "7172:7194");
__$coverInitRange("templates.js", "7203:7231");
__$coverInitRange("templates.js", "7601:7719");
__$coverInitRange("templates.js", "7727:7756");
__$coverInitRange("templates.js", "7791:7834");
__$coverInitRange("templates.js", "7843:7873");
__$coverInitRange("templates.js", "7881:7933");
__$coverInitRange("templates.js", "7942:7968");
__$coverInitRange("templates.js", "7977:8007");
__$coverInitRange("templates.js", "8016:8040");
__$coverInitRange("templates.js", "8048:8232");
__$coverInitRange("templates.js", "8241:8331");
__$coverInitRange("templates.js", "8340:8354");
__$coverInitRange("templates.js", "8090:8114");
__$coverInitRange("templates.js", "8124:8172");
__$coverInitRange("templates.js", "8183:8224");
__$coverInitRange("templates.js", "8268:8323");
__$coverInitRange("templates.js", "8293:8313");
__$coverInitRange("templates.js", "8559:8590");
__$coverInitRange("templates.js", "8598:8656");
__$coverInitRange("templates.js", "8665:8686");
__$coverInitRange("templates.js", "8695:8723");
__$coverInitRange("templates.js", "8731:8818");
__$coverInitRange("templates.js", "8773:8810");
__$coverCall('templates.js', '614:644');
var utils = window.utils || {};
__$coverCall('templates.js', '647:8836');
if (!utils.templates) {
    __$coverCall('templates.js', '673:8834');
    (function () {
        __$coverCall('templates.js', '691:727');
        var Templates = utils.templates = {};
        __$coverCall('templates.js', '734:770');
        const TEMPLATE_SELECTOR = 'template';
        __$coverCall('templates.js', '1040:1212');
        function getTarget(element) {
            __$coverCall('templates.js', '1076:1096');
            var target = element;
            __$coverCall('templates.js', '1104:1184');
            if (!element.tagName) {
                __$coverCall('templates.js', '1136:1176');
                target = document.querySelector(element);
            }
            __$coverCall('templates.js', '1193:1206');
            return target;
        }
        __$coverCall('templates.js', '1578:2385');
        function getTemplate(target, data) {
            __$coverCall('templates.js', '1621:1633');
            var template;
            __$coverCall('templates.js', '1641:1699');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '1708:1736');
            var total = templates.length;
            __$coverCall('templates.js', '1745:1762');
            var multi = false;
            __$coverCall('templates.js', '1770:1815');
            if (total > 1) {
                __$coverCall('templates.js', '1795:1807');
                multi = true;
            }
            __$coverCall('templates.js', '1824:1838');
            var evaluation;
            __$coverCall('templates.js', '1847:2288');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '1889:1940');
                var condition = templates.item(c).dataset.condition;
                __$coverCall('templates.js', '1951:2280');
                if (condition) {
                    __$coverCall('templates.js', '1978:2011');
                    evaluation = get(data, condition);
                    __$coverCall('templates.js', '2023:2112');
                    if (evaluation) {
                        __$coverCall('templates.js', '2053:2081');
                        template = templates.item(c);
                        __$coverCall('templates.js', '2095:2100');
                        break;
                    }
                } else {
                    __$coverCall('templates.js', '2242:2270');
                    template = templates.item(c);
                }
            }
            __$coverCall('templates.js', '2336:2379');
            return {
                template: template,
                isMulti: multi
            };
        }
        __$coverCall('templates.js', '2599:2817');
        function templateReplace(data) {
            __$coverCall('templates.js', '2638:2816');
            return function (text, property) {
                __$coverCall('templates.js', '2680:2709');
                var out = get(data, property);
                __$coverCall('templates.js', '2719:2783');
                if (typeof out === 'undefined') {
                    __$coverCall('templates.js', '2763:2773');
                    out = text;
                }
                __$coverCall('templates.js', '2793:2803');
                return out;
            };
        }
        __$coverCall('templates.js', '3143:3892');
        function get(data, path) {
            __$coverCall('templates.js', '3177:3809');
            function doGet(pdata, fields) {
                __$coverCall('templates.js', '3217:3224');
                var out;
                __$coverCall('templates.js', '3234:3250');
                var data = pdata;
                __$coverCall('templates.js', '3260:3329');
                if (typeof pdata === 'function') {
                    __$coverCall('templates.js', '3305:3319');
                    data = pdata();
                }
                __$coverCall('templates.js', '3375:3781');
                if (fields.length === 0) {
                    __$coverCall('templates.js', '3412:3422');
                    out = data;
                } else if (data !== null && typeof data !== 'undefined') {
                    __$coverCall('templates.js', '3559:3585');
                    var field = fields.shift();
                    __$coverCall('templates.js', '3597:3771');
                    if (typeof data[field] === 'function') {
                        __$coverCall('templates.js', '3650:3684');
                        out = doGet(data[field](), fields);
                    } else {
                        __$coverCall('templates.js', '3727:3759');
                        out = doGet(data[field], fields);
                    }
                }
                __$coverCall('templates.js', '3791:3801');
                return out;
            }
            __$coverCall('templates.js', '3818:3849');
            var fieldList = path.split('.');
            __$coverCall('templates.js', '3857:3886');
            return doGet(data, fieldList);
        }
        __$coverCall('templates.js', '4563:5881');
        function add(element, data, mode) {
            __$coverCall('templates.js', '4668:4699');
            var target = getTarget(element);
            __$coverCall('templates.js', '4707:4718');
            var newElem;
            __$coverCall('templates.js', '4727:4747');
            var theData = [data];
            __$coverCall('templates.js', '4755:4814');
            if (data instanceof Array) {
                __$coverCall('templates.js', '4792:4806');
                theData = data;
            }
            __$coverCall('templates.js', '4913:4937');
            var multiTemplate = true;
            __$coverCall('templates.js', '4945:4957');
            var template;
            __$coverCall('templates.js', '4965:4976');
            var idx = 0;
            __$coverCall('templates.js', '4984:5836');
            theData.forEach(function (oneData) {
                __$coverCall('templates.js', '5067:5088');
                oneData._idx_ = idx++;
                __$coverCall('templates.js', '5160:5380');
                if (multiTemplate === true) {
                    __$coverCall('templates.js', '5199:5241');
                    var tresult = getTemplate(target, oneData);
                    __$coverCall('templates.js', '5253:5280');
                    template = tresult.template;
                    __$coverCall('templates.js', '5292:5370');
                    if (tresult.isMulti === false) {
                        __$coverCall('templates.js', '5337:5358');
                        multiTemplate = false;
                    }
                }
                __$coverCall('templates.js', '5391:5799');
                if (template) {
                    __$coverCall('templates.js', '5417:5457');
                    newElem = this.render(template, oneData);
                    __$coverCall('templates.js', '5470:5772');
                    if (mode === 'A') {
                        __$coverCall('templates.js', '5503:5530');
                        target.appendChild(newElem);
                    } else if (mode === 'P') {
                        __$coverCall('templates.js', '5596:5760');
                        if (target.firstChild) {
                            __$coverCall('templates.js', '5635:5682');
                            target.insertBefore(newElem, target.firstChild);
                        } else {
                            __$coverCall('templates.js', '5719:5746');
                            target.appendChild(newElem);
                        }
                    }
                }
            }.bind(this));
            __$coverCall('templates.js', '5861:5875');
            return newElem;
        }
        __$coverCall('templates.js', '6493:6610');
        Templates.append = function (element, data) {
            __$coverCall('templates.js', '6544:6566');
            var f = add.bind(this);
            __$coverCall('templates.js', '6575:6603');
            return f(element, data, 'A');
        };
        __$coverCall('templates.js', '7119:7238');
        Templates.prepend = function (element, data) {
            __$coverCall('templates.js', '7172:7194');
            var f = add.bind(this);
            __$coverCall('templates.js', '7203:7231');
            return f(element, data, 'P');
        };
        __$coverCall('templates.js', '7546:8361');
        Templates.render = function (eleTemplate, data) {
            __$coverCall('templates.js', '7601:7719');
            var newElem = document.importNode(eleTemplate.content.firstElementChild, true);
            __$coverCall('templates.js', '7727:7756');
            var inner = newElem.innerHTML;
            __$coverCall('templates.js', '7791:7834');
            var replaceFunction = templateReplace(data);
            __$coverCall('templates.js', '7843:7873');
            var pattern = /#(\w+[\w.]*)#/g;
            __$coverCall('templates.js', '7881:7933');
            var ninner = inner.replace(pattern, replaceFunction);
            __$coverCall('templates.js', '7942:7968');
            newElem.innerHTML = ninner;
            __$coverCall('templates.js', '7977:8007');
            var attrs = newElem.attributes;
            __$coverCall('templates.js', '8016:8040');
            var total = attrs.length;
            __$coverCall('templates.js', '8048:8232');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '8090:8114');
                var val = attrs[c].value;
                __$coverCall('templates.js', '8124:8172');
                var nval = val.replace(pattern, replaceFunction);
                __$coverCall('templates.js', '8183:8224');
                newElem.setAttribute(attrs[c].name, nval);
            }
            __$coverCall('templates.js', '8241:8331');
            if (!newElem.id) {
                __$coverCall('templates.js', '8268:8323');
                if (data.id) {
                    __$coverCall('templates.js', '8293:8313');
                    newElem.id = data.id;
                }
            }
            __$coverCall('templates.js', '8340:8354');
            return newElem;
        };
        __$coverCall('templates.js', '8515:8825');
        Templates.clear = function (element) {
            __$coverCall('templates.js', '8559:8590');
            var target = getTarget(element);
            __$coverCall('templates.js', '8598:8656');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '8665:8686');
            target.innerHTML = '';
            __$coverCall('templates.js', '8695:8723');
            var total = templates.length;
            __$coverCall('templates.js', '8731:8818');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '8773:8810');
                target.appendChild(templates.item(c));
            }
        };
    }());
}