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
__$coverInit("templates.js", "/*\n *  Module: Templates\n *\n *  Product: Open Web Device\n *\n *  Copyright(c) 2012 Telefónica I+D S.A.U.\n *\n *  LICENSE: Apache 2.0\n *\n *  @author Telefonica Digital\n *\n *  The module allows to work with HTML templates in client-side JS environments\n *\n *  @example\n *\n *   <ul id=\"theList\">\n *    <li data-template>\n *      <dl>\n *         <dt>#name#</dt>\n *         <dd class=\"img\"><img src=\"#contactImg#\"></dd>\n *      </dl>\n *    </li>\n *   </ul>\n *\n *   var myObj = { name: 'Nice Name!', contactImg: 'myImg.jpg' };\n *   utils.templates.append('#theList',myObj);\n *\n */\n\n\nvar utils = window.utils || {};\n\nif (!utils.templates) {\n  (function() {\n    var Templates = utils.templates = {};\n\n    /**\n     *  Returns a target HTMLElement from a selector or HTMLElement itself\n     *\n     *  @param {HTMLElement or Selector} element target element.\n     *\n     *  @return {HTMLElement} HTMLElement according to the selector or itself.\n     *\n     *\n     */\n    function getTarget(element) {\n      var target = element;\n      if (!element.tagName) {\n        target = document.querySelector(element);\n      }\n\n      return target;\n    }\n\n    /**\n    *    Given a target HTML element which contains a template set\n    *    returns the template that will have to be applied over the data\n    *\n    *    @param {HTMLElement} target which contains the template.\n    *    @param {Object} data to be used on the template.\n    *\n    *    @return {HTMLElement} HTMLElement with the template.\n    *\n    */\n    function getTemplate(target, data) {\n      var template;\n      var templates = target.querySelectorAll('*[data-template]');\n\n      var total = templates.length;\n\n      var multi = false;\n      if (total > 1) {\n        multi = true;\n      }\n\n      if (total > 0) {\n        var condition = templates.item(0).dataset.condition;\n\n        // If the first has no condition it will be selected by default\n        // The most frequent case will be that the first is the one that wins\n        if (!condition) {\n           template = templates.item(0);\n        }\n\n        var evaluation;\n        if (condition) {\n          evaluation = get(data, condition);\n          if (evaluation) {\n            // The rest will be ignored\n            total = 1;\n            template = templates.item(0);\n          }\n        }\n\n        for (var c = 1; c < total; c++) {\n          var condition = templates.item(c).dataset.condition;\n\n          if (condition) {\n            evaluation = get(data, condition);\n            if (evaluation) {\n              template = templates.item(c);\n              break;\n            }\n          } else if (!template) {\n            // Just to be sure that if there is no a condition\n            // something will be selected\n            template = templates.item(c);\n          }\n        } // Iteration trying to find a template\n      } // total templates > 0\n\n      return {template: template, isMulti: multi};\n    }\n\n    /**\n     *   Returns a function used to replace data on a template\n     *\n     *   @param {Object} data the data to be used on the template.\n     *\n     *   @return {function} to be used.\n     *\n     */\n    function templateReplace(data) {\n      return function(text, property) {\n        var ret = get(data, property);\n        if (typeof ret === 'undefined') {\n          ret = text;\n        }\n        return ret;\n      }\n    }\n\n    /**\n     *   Look recursively for an object field or subfield.\n     *\n     *   @param {Object} data the object where looking into.\n     *\n     *   @param {String} path dotted (Java-package-like) path to the field\n     *   to be retrieved.\n     *\n     *   @return {AnyType} data into the given field.\n     *\n     */\n    function get(data, path) {\n\n      function doGet(data, fields) {\n        var ret;\n        // Base case: goal reached\n        if (fields.length === 0) {\n          if (typeof data === 'function') {\n            ret = data();\n          }\n          else {\n            ret = data;\n          }\n\n        // Recursive case: access the field and look into\n        } else if (data !== null && typeof data !== 'undefined') {\n          var field = fields.shift();\n          if (typeof data[field] === 'function') {\n            ret = doGet(data[field](), fields);\n          }\n          else {\n            ret = doGet(data[field], fields);\n          }\n        }\n        return ret;\n      }\n\n      var fieldList = path.split('.');\n      return doGet(data, fieldList);\n    }\n\n    /**\n     *  Adds (append or prepend) a new instance HTMLElement (or array of)\n     *  of a template\n     *  The template is assumed to be a child of the element\n     *  passed as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement} ele container lement that contains the template\n     *  and which will contain the new instance. Can be an HTMLElement\n     *  or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @param {String} mode oneOf ('A','P').\n     *\n     *  @return {HTMLElement} (or last element if data is an array).\n     *\n     *\n     */\n    function add(element, data, mode) {\n      // It is supported both the element itself or a selector\n      var target = getTarget(element);\n      var newElem;\n\n      var theData = [data];\n      if (data instanceof Array) {\n        theData = data;\n      }\n\n      // Optimization to avoid trying to find a template when\n      // only one is needed\n      var multiTemplate = true;\n      var template;\n      var idx = 0;\n      theData.forEach(function(oneData) {\n        // Pseudo-field with the index\n        oneData._idx_ = idx++;\n        // A suitable template for the data is firstly found\n         if (multiTemplate === true) {\n         var tresult = getTemplate(target, oneData);\n          template = tresult.template;\n          if (tresult.isMulti === false) {\n            multiTemplate = false;\n          }\n        }\n\n        if (template) {\n          newElem = this.render(template, oneData);\n\n          if (mode === 'A') {\n             target.appendChild(newElem);\n          } else if (mode === 'P') { // Append mode\n            if (target.firstChild) {\n              target.insertBefore(newElem, target.firstChild);\n            } else {\n              target.appendChild(newElem);\n            }\n          } // prepend mode\n\n        } // if template\n\n      }.bind(this)); // forEach data\n\n      return newElem;\n    }\n\n\n    /**\n     *  Appends a new instance HTMLElement (or array of) of a template\n     *\n     *  The template is assumed to be a child of the element passed\n     *  as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement or String} ele container element that\n     *  contains the template and which will contain the new instance.\n     *  Can be an HTMLElement or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @return {HTMLelement} (or last element if data is an array).\n     *\n     *\n     */\n    Templates.append = function(element, data) {\n      var f = add.bind(this);\n\n      return f(element, data, 'A');\n    };\n\n\n    /**\n     *   Prepends a new instance (or array of) of a template\n     *\n     *   The template is assumed to be a child of the element passed\n     *   as parameter\n     *\n     *   @param {HTMLElement or String} ele container element that\n     *   contains the template and which will contain the new instance.\n     *   Can be an HTMLElement or a CSS selector.\n     *\n     *   @param {Object or Array} data with the data displayed.\n     *\n     *   @return {HTMLElement} added.\n     *\n     *\n     */\n    Templates.prepend = function(element, data) {\n       var f = add.bind(this);\n\n      return f(element, data, 'P');\n    };\n\n\n    /**\n     *  Renders the content specified by a template with object data\n     *\n     *  @param {HTMLElement} eleTemplate the template itself.\n     *  @param {Object} data the data to be used.\n     *\n     *  @return {HTMLElement} according to the template and with the data.\n     *\n     *\n     */\n    Templates.render = function(eleTemplate, data) {\n      var newElem = eleTemplate.cloneNode(true);\n      newElem.removeAttribute('data-template');\n      newElem.removeAttribute('data-condition');\n\n      /* var pattern = /#(\\w+)#/g; */\n      var pattern = /#(\\w+[\\w.]*)#/g;\n\n      var inner = newElem.innerHTML;\n\n      // Replace function\n      var replaceFunction = templateReplace(data);\n      var ninner = inner.replace(pattern, replaceFunction);\n\n      newElem.innerHTML = ninner;\n\n      var attrs = newElem.attributes;\n\n      var total = attrs.length;\n      for (var c = 0; c < total; c++) {\n        var val = attrs[c].value;\n        var nval = val.replace(pattern, replaceFunction);\n\n        newElem.setAttribute(attrs[c].name, nval);\n      }\n\n      if (!newElem.id) {\n        if (data.id) {\n          newElem.id = data.id;\n        }\n      }\n\n      return newElem;\n    };\n\n    /**\n     *  Clears a container element\n     *\n     *  @param {HTMLElement or String} element (selector or HTML element).\n     *\n     *\n     */\n    Templates.clear = function(element) {\n      var target = getTarget(element);\n\n      var templates = target.querySelectorAll('*[data-template]');\n\n      target.innerHTML = '';\n\n      var total = templates.length;\n\n      for (var c = 0; c < total; c++) {\n        target.appendChild(templates.item(c));\n      }\n    };\n  }) ();\n} // window.templates\n");
__$coverInitRange("templates.js", "575:605");
__$coverInitRange("templates.js", "608:9438");
__$coverInitRange("templates.js", "634:9436");
__$coverInitRange("templates.js", "652:688");
__$coverInitRange("templates.js", "958:1130");
__$coverInitRange("templates.js", "1496:2918");
__$coverInitRange("templates.js", "3132:3350");
__$coverInitRange("templates.js", "3676:4432");
__$coverInitRange("templates.js", "5103:6421");
__$coverInitRange("templates.js", "7033:7150");
__$coverInitRange("templates.js", "7659:7778");
__$coverInitRange("templates.js", "8086:8960");
__$coverInitRange("templates.js", "9114:9427");
__$coverInitRange("templates.js", "994:1014");
__$coverInitRange("templates.js", "1022:1102");
__$coverInitRange("templates.js", "1111:1124");
__$coverInitRange("templates.js", "1054:1094");
__$coverInitRange("templates.js", "1539:1551");
__$coverInitRange("templates.js", "1559:1618");
__$coverInitRange("templates.js", "1627:1655");
__$coverInitRange("templates.js", "1664:1681");
__$coverInitRange("templates.js", "1689:1734");
__$coverInitRange("templates.js", "1743:2837");
__$coverInitRange("templates.js", "2869:2912");
__$coverInitRange("templates.js", "1714:1726");
__$coverInitRange("templates.js", "1768:1819");
__$coverInitRange("templates.js", "1980:2047");
__$coverInitRange("templates.js", "2058:2072");
__$coverInitRange("templates.js", "2082:2297");
__$coverInitRange("templates.js", "2308:2790");
__$coverInitRange("templates.js", "2009:2037");
__$coverInitRange("templates.js", "2109:2142");
__$coverInitRange("templates.js", "2154:2287");
__$coverInitRange("templates.js", "2224:2233");
__$coverInitRange("templates.js", "2247:2275");
__$coverInitRange("templates.js", "2352:2403");
__$coverInitRange("templates.js", "2416:2780");
__$coverInitRange("templates.js", "2445:2478");
__$coverInitRange("templates.js", "2492:2587");
__$coverInitRange("templates.js", "2524:2552");
__$coverInitRange("templates.js", "2568:2573");
__$coverInitRange("templates.js", "2740:2768");
__$coverInitRange("templates.js", "3171:3349");
__$coverInitRange("templates.js", "3213:3242");
__$coverInitRange("templates.js", "3252:3316");
__$coverInitRange("templates.js", "3326:3336");
__$coverInitRange("templates.js", "3296:3306");
__$coverInitRange("templates.js", "3710:4349");
__$coverInitRange("templates.js", "4358:4389");
__$coverInitRange("templates.js", "4397:4426");
__$coverInitRange("templates.js", "3749:3756");
__$coverInitRange("templates.js", "3801:4321");
__$coverInitRange("templates.js", "4331:4341");
__$coverInitRange("templates.js", "3838:3961");
__$coverInitRange("templates.js", "3884:3896");
__$coverInitRange("templates.js", "3939:3949");
__$coverInitRange("templates.js", "4099:4125");
__$coverInitRange("templates.js", "4137:4311");
__$coverInitRange("templates.js", "4190:4224");
__$coverInitRange("templates.js", "4267:4299");
__$coverInitRange("templates.js", "5208:5239");
__$coverInitRange("templates.js", "5247:5258");
__$coverInitRange("templates.js", "5267:5287");
__$coverInitRange("templates.js", "5295:5354");
__$coverInitRange("templates.js", "5453:5477");
__$coverInitRange("templates.js", "5485:5497");
__$coverInitRange("templates.js", "5505:5516");
__$coverInitRange("templates.js", "5524:6376");
__$coverInitRange("templates.js", "6401:6415");
__$coverInitRange("templates.js", "5332:5346");
__$coverInitRange("templates.js", "5607:5628");
__$coverInitRange("templates.js", "5700:5920");
__$coverInitRange("templates.js", "5931:6339");
__$coverInitRange("templates.js", "5739:5781");
__$coverInitRange("templates.js", "5793:5820");
__$coverInitRange("templates.js", "5832:5910");
__$coverInitRange("templates.js", "5877:5898");
__$coverInitRange("templates.js", "5957:5997");
__$coverInitRange("templates.js", "6010:6312");
__$coverInitRange("templates.js", "6043:6070");
__$coverInitRange("templates.js", "6136:6300");
__$coverInitRange("templates.js", "6175:6222");
__$coverInitRange("templates.js", "6259:6286");
__$coverInitRange("templates.js", "7084:7106");
__$coverInitRange("templates.js", "7115:7143");
__$coverInitRange("templates.js", "7712:7734");
__$coverInitRange("templates.js", "7743:7771");
__$coverInitRange("templates.js", "8141:8182");
__$coverInitRange("templates.js", "8190:8230");
__$coverInitRange("templates.js", "8238:8279");
__$coverInitRange("templates.js", "8326:8356");
__$coverInitRange("templates.js", "8365:8394");
__$coverInitRange("templates.js", "8429:8472");
__$coverInitRange("templates.js", "8480:8532");
__$coverInitRange("templates.js", "8541:8567");
__$coverInitRange("templates.js", "8576:8606");
__$coverInitRange("templates.js", "8615:8639");
__$coverInitRange("templates.js", "8647:8831");
__$coverInitRange("templates.js", "8840:8930");
__$coverInitRange("templates.js", "8939:8953");
__$coverInitRange("templates.js", "8689:8713");
__$coverInitRange("templates.js", "8723:8771");
__$coverInitRange("templates.js", "8782:8823");
__$coverInitRange("templates.js", "8867:8922");
__$coverInitRange("templates.js", "8892:8912");
__$coverInitRange("templates.js", "9158:9189");
__$coverInitRange("templates.js", "9198:9257");
__$coverInitRange("templates.js", "9266:9287");
__$coverInitRange("templates.js", "9296:9324");
__$coverInitRange("templates.js", "9333:9420");
__$coverInitRange("templates.js", "9375:9412");
__$coverCall('templates.js', '575:605');
var utils = window.utils || {};
__$coverCall('templates.js', '608:9438');
if (!utils.templates) {
    __$coverCall('templates.js', '634:9436');
    (function () {
        __$coverCall('templates.js', '652:688');
        var Templates = utils.templates = {};
        __$coverCall('templates.js', '958:1130');
        function getTarget(element) {
            __$coverCall('templates.js', '994:1014');
            var target = element;
            __$coverCall('templates.js', '1022:1102');
            if (!element.tagName) {
                __$coverCall('templates.js', '1054:1094');
                target = document.querySelector(element);
            }
            __$coverCall('templates.js', '1111:1124');
            return target;
        }
        __$coverCall('templates.js', '1496:2918');
        function getTemplate(target, data) {
            __$coverCall('templates.js', '1539:1551');
            var template;
            __$coverCall('templates.js', '1559:1618');
            var templates = target.querySelectorAll('*[data-template]');
            __$coverCall('templates.js', '1627:1655');
            var total = templates.length;
            __$coverCall('templates.js', '1664:1681');
            var multi = false;
            __$coverCall('templates.js', '1689:1734');
            if (total > 1) {
                __$coverCall('templates.js', '1714:1726');
                multi = true;
            }
            __$coverCall('templates.js', '1743:2837');
            if (total > 0) {
                __$coverCall('templates.js', '1768:1819');
                var condition = templates.item(0).dataset.condition;
                __$coverCall('templates.js', '1980:2047');
                if (!condition) {
                    __$coverCall('templates.js', '2009:2037');
                    template = templates.item(0);
                }
                __$coverCall('templates.js', '2058:2072');
                var evaluation;
                __$coverCall('templates.js', '2082:2297');
                if (condition) {
                    __$coverCall('templates.js', '2109:2142');
                    evaluation = get(data, condition);
                    __$coverCall('templates.js', '2154:2287');
                    if (evaluation) {
                        __$coverCall('templates.js', '2224:2233');
                        total = 1;
                        __$coverCall('templates.js', '2247:2275');
                        template = templates.item(0);
                    }
                }
                __$coverCall('templates.js', '2308:2790');
                for (var c = 1; c < total; c++) {
                    __$coverCall('templates.js', '2352:2403');
                    var condition = templates.item(c).dataset.condition;
                    __$coverCall('templates.js', '2416:2780');
                    if (condition) {
                        __$coverCall('templates.js', '2445:2478');
                        evaluation = get(data, condition);
                        __$coverCall('templates.js', '2492:2587');
                        if (evaluation) {
                            __$coverCall('templates.js', '2524:2552');
                            template = templates.item(c);
                            __$coverCall('templates.js', '2568:2573');
                            break;
                        }
                    } else if (!template) {
                        __$coverCall('templates.js', '2740:2768');
                        template = templates.item(c);
                    }
                }
            }
            __$coverCall('templates.js', '2869:2912');
            return {
                template: template,
                isMulti: multi
            };
        }
        __$coverCall('templates.js', '3132:3350');
        function templateReplace(data) {
            __$coverCall('templates.js', '3171:3349');
            return function (text, property) {
                __$coverCall('templates.js', '3213:3242');
                var ret = get(data, property);
                __$coverCall('templates.js', '3252:3316');
                if (typeof ret === 'undefined') {
                    __$coverCall('templates.js', '3296:3306');
                    ret = text;
                }
                __$coverCall('templates.js', '3326:3336');
                return ret;
            };
        }
        __$coverCall('templates.js', '3676:4432');
        function get(data, path) {
            __$coverCall('templates.js', '3710:4349');
            function doGet(data, fields) {
                __$coverCall('templates.js', '3749:3756');
                var ret;
                __$coverCall('templates.js', '3801:4321');
                if (fields.length === 0) {
                    __$coverCall('templates.js', '3838:3961');
                    if (typeof data === 'function') {
                        __$coverCall('templates.js', '3884:3896');
                        ret = data();
                    } else {
                        __$coverCall('templates.js', '3939:3949');
                        ret = data;
                    }
                } else if (data !== null && typeof data !== 'undefined') {
                    __$coverCall('templates.js', '4099:4125');
                    var field = fields.shift();
                    __$coverCall('templates.js', '4137:4311');
                    if (typeof data[field] === 'function') {
                        __$coverCall('templates.js', '4190:4224');
                        ret = doGet(data[field](), fields);
                    } else {
                        __$coverCall('templates.js', '4267:4299');
                        ret = doGet(data[field], fields);
                    }
                }
                __$coverCall('templates.js', '4331:4341');
                return ret;
            }
            __$coverCall('templates.js', '4358:4389');
            var fieldList = path.split('.');
            __$coverCall('templates.js', '4397:4426');
            return doGet(data, fieldList);
        }
        __$coverCall('templates.js', '5103:6421');
        function add(element, data, mode) {
            __$coverCall('templates.js', '5208:5239');
            var target = getTarget(element);
            __$coverCall('templates.js', '5247:5258');
            var newElem;
            __$coverCall('templates.js', '5267:5287');
            var theData = [data];
            __$coverCall('templates.js', '5295:5354');
            if (data instanceof Array) {
                __$coverCall('templates.js', '5332:5346');
                theData = data;
            }
            __$coverCall('templates.js', '5453:5477');
            var multiTemplate = true;
            __$coverCall('templates.js', '5485:5497');
            var template;
            __$coverCall('templates.js', '5505:5516');
            var idx = 0;
            __$coverCall('templates.js', '5524:6376');
            theData.forEach(function (oneData) {
                __$coverCall('templates.js', '5607:5628');
                oneData._idx_ = idx++;
                __$coverCall('templates.js', '5700:5920');
                if (multiTemplate === true) {
                    __$coverCall('templates.js', '5739:5781');
                    var tresult = getTemplate(target, oneData);
                    __$coverCall('templates.js', '5793:5820');
                    template = tresult.template;
                    __$coverCall('templates.js', '5832:5910');
                    if (tresult.isMulti === false) {
                        __$coverCall('templates.js', '5877:5898');
                        multiTemplate = false;
                    }
                }
                __$coverCall('templates.js', '5931:6339');
                if (template) {
                    __$coverCall('templates.js', '5957:5997');
                    newElem = this.render(template, oneData);
                    __$coverCall('templates.js', '6010:6312');
                    if (mode === 'A') {
                        __$coverCall('templates.js', '6043:6070');
                        target.appendChild(newElem);
                    } else if (mode === 'P') {
                        __$coverCall('templates.js', '6136:6300');
                        if (target.firstChild) {
                            __$coverCall('templates.js', '6175:6222');
                            target.insertBefore(newElem, target.firstChild);
                        } else {
                            __$coverCall('templates.js', '6259:6286');
                            target.appendChild(newElem);
                        }
                    }
                }
            }.bind(this));
            __$coverCall('templates.js', '6401:6415');
            return newElem;
        }
        __$coverCall('templates.js', '7033:7150');
        Templates.append = function (element, data) {
            __$coverCall('templates.js', '7084:7106');
            var f = add.bind(this);
            __$coverCall('templates.js', '7115:7143');
            return f(element, data, 'A');
        };
        __$coverCall('templates.js', '7659:7778');
        Templates.prepend = function (element, data) {
            __$coverCall('templates.js', '7712:7734');
            var f = add.bind(this);
            __$coverCall('templates.js', '7743:7771');
            return f(element, data, 'P');
        };
        __$coverCall('templates.js', '8086:8960');
        Templates.render = function (eleTemplate, data) {
            __$coverCall('templates.js', '8141:8182');
            var newElem = eleTemplate.cloneNode(true);
            __$coverCall('templates.js', '8190:8230');
            newElem.removeAttribute('data-template');
            __$coverCall('templates.js', '8238:8279');
            newElem.removeAttribute('data-condition');
            __$coverCall('templates.js', '8326:8356');
            var pattern = /#(\w+[\w.]*)#/g;
            __$coverCall('templates.js', '8365:8394');
            var inner = newElem.innerHTML;
            __$coverCall('templates.js', '8429:8472');
            var replaceFunction = templateReplace(data);
            __$coverCall('templates.js', '8480:8532');
            var ninner = inner.replace(pattern, replaceFunction);
            __$coverCall('templates.js', '8541:8567');
            newElem.innerHTML = ninner;
            __$coverCall('templates.js', '8576:8606');
            var attrs = newElem.attributes;
            __$coverCall('templates.js', '8615:8639');
            var total = attrs.length;
            __$coverCall('templates.js', '8647:8831');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '8689:8713');
                var val = attrs[c].value;
                __$coverCall('templates.js', '8723:8771');
                var nval = val.replace(pattern, replaceFunction);
                __$coverCall('templates.js', '8782:8823');
                newElem.setAttribute(attrs[c].name, nval);
            }
            __$coverCall('templates.js', '8840:8930');
            if (!newElem.id) {
                __$coverCall('templates.js', '8867:8922');
                if (data.id) {
                    __$coverCall('templates.js', '8892:8912');
                    newElem.id = data.id;
                }
            }
            __$coverCall('templates.js', '8939:8953');
            return newElem;
        };
        __$coverCall('templates.js', '9114:9427');
        Templates.clear = function (element) {
            __$coverCall('templates.js', '9158:9189');
            var target = getTarget(element);
            __$coverCall('templates.js', '9198:9257');
            var templates = target.querySelectorAll('*[data-template]');
            __$coverCall('templates.js', '9266:9287');
            target.innerHTML = '';
            __$coverCall('templates.js', '9296:9324');
            var total = templates.length;
            __$coverCall('templates.js', '9333:9420');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '9375:9412');
                target.appendChild(templates.item(c));
            }
        };
    }());
}