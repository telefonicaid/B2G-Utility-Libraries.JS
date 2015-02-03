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
__$coverInit("templates.js", "/*\n *  Module: Templates\n *\n *  Product: Utility Libraries for Web front-end development\n *\n *  Copyright(c) 2015 Telefónica I+D S.A.U.\n *\n *  LICENSE: Apache 2.0\n *\n *  @author Web Browser Community @ Telefónica I+D\n *\n *  The module allows to work with HTML templates in client-side JS environments\n *\n *  @example\n *\n *   <ul id=\"theList\">\n *    <template is=\"x-template\">\n *     <li>\n *      <dl>\n *         <dt>${name}</dt>\n *         <dd class=\"img\"><img src=\"${contactImg}\"></dd>\n *      </dl>\n *     </li>\n *    </template>\n *   </ul>\n *\n *   var myObj = { name: 'Nice Name!', contactImg: 'myImg.jpg' };\n *   utils.templates.append('#theList',myObj);\n *\n *   DISCLAIMERS:\n *\n *   The <template> element will be the first child element of the container\n *   in the following situations:\n *\n *     A/ in browsers which do not implement Web Components\n *\n *     B/ If the template is not tagged as an 'x-template'\n *\n *     C/ If this library is loaded with <script defer>\n *\n */\n\n\nvar utils = window.utils || {};\n\nif (!utils.templates) {\n  (function() {\n    var Templates = utils.templates = {};\n\n    // Template selector\n    const TEMPLATE_SELECTOR = 'template';\n\n    /**\n     *  Registers the x-template Web Component if Web Components if they are\n     *  available\n     *\n     */\n    function registerComponent() {\n      if (!HTMLTemplateElement || !document.registerElement) {\n        console.warn('Web Components not available. Templates consume DOM');\n        return;\n      }\n\n      var xTemplateProto = Object.create(HTMLTemplateElement.prototype);\n\n      // When an 'x-template' is attached the element in the DOM is destroyed\n      // and moved to the Shadow DOM\n      xTemplateProto.attachedCallback = function() {\n        var parent = this.parentElement;\n\n        if (!parent) {\n          console.warn('Parent Element not avilable for: ', this);\n          return;\n        }\n\n        // We reuse an existing shadowRoot if it already contains a template\n        var shadow = parent.shadowRoot;\n        if (!shadow || !shadow.querySelector(TEMPLATE_SELECTOR)) {\n          shadow = parent.createShadowRoot();\n        }\n\n        var internalTemplate = document.createElement(TEMPLATE_SELECTOR);\n        internalTemplate.content.appendChild(document.importNode(\n                                      this.content.firstElementChild, true));\n        // We need to copy all the data attributes to the internal template\n        for (var prop in this.dataset) {\n          internalTemplate.dataset[prop] = this.dataset[prop];\n        }\n\n        shadow.appendChild(internalTemplate);\n\n        parent.removeChild(this);\n      }\n\n      document.registerElement('x-template', {\n        prototype: xTemplateProto,\n        extends: 'template'\n      });\n    }\n\n    /**\n     *  Returns a target HTMLElement from a selector or HTMLElement itself\n     *\n     *  @param {HTMLElement or Selector} element target element.\n     *\n     *  @return {HTMLElement} HTMLElement according to the selector or itself.\n     *\n     *\n     */\n    function getTarget(element) {\n      var target = element;\n      if (!element.tagName) {\n        target = document.querySelector(element);\n      }\n\n      return target;\n    }\n\n    /**\n    *    Given a target HTML element which contains a template set\n    *    returns the template that will have to be applied over the data\n    *\n    *    @param {HTMLElement} target which contains the template.\n    *    @param {Object} data to be used on the template.\n    *\n    *    @return {HTMLElement} HTMLElement with the template.\n    *\n    */\n    function getTemplate(target, data) {\n      var template;\n\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      // If there are no templates in the regular DOM let's try to find them\n      // in the shadowRoot\n      if (templates.length === 0 && target.shadowRoot) {\n        templates = target.shadowRoot.querySelectorAll(TEMPLATE_SELECTOR);\n      }\n\n      var total = templates.length;\n\n      var multi = false;\n      if (total > 1) {\n        multi = true;\n      }\n\n      var evaluation;\n\n      for (var c = 0; c < total; c++) {\n        var condition = templates.item(c).dataset.condition;\n\n        if (condition) {\n          evaluation = get(data, condition);\n          if (evaluation) {\n            template = templates.item(c);\n            break;\n          }\n        } else {\n          // Just to be sure that if there is no a condition\n          // something will be selected\n          template = templates.item(c);\n        }\n      } // Iteration trying to find a template\n\n      return {template: template, isMulti: multi};\n    }\n\n    /**\n     *   Returns a function used to replace data on a template\n     *\n     *   @param {Object} data the data to be used on the template.\n     *\n     *   @return {function} to be used.\n     *\n     */\n    function templateReplace(data) {\n      return function(text, property) {\n        var out = get(data, property);\n        if (typeof out === 'undefined') {\n          out = text;\n        }\n        return out;\n      }\n    }\n\n    /**\n     *   Look recursively for an object field or subfield.\n     *\n     *   @param {Object} data the object where looking into.\n     *\n     *   @param {String} path dotted (Java-package-like) path to the field\n     *   to be retrieved.\n     *\n     *   @return {AnyType} data into the given field.\n     *\n     */\n    function get(data, path) {\n\n      function doGet(pdata, fields) {\n        var out;\n        var data = pdata;\n        if (typeof pdata === 'function') {\n          data = pdata();\n        }\n\n        // Base case: goal reached\n        if (fields.length === 0) {\n          out = data;\n        // Recursive case: access the field and look into\n        } else if (data !== null && typeof data !== 'undefined') {\n          var field = fields.shift();\n          if (typeof data[field] === 'function') {\n            out = doGet(data[field](), fields);\n          }\n          else {\n            out = doGet(data[field], fields);\n          }\n        }\n        return out;\n      }\n\n      var fieldList = path.split('.');\n      return doGet(data, fieldList);\n    }\n\n    /**\n     *  Adds (append or prepend) a new instance HTMLElement (or array of)\n     *  of a template\n     *  The template is assumed to be a child of the element\n     *  passed as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement} ele container lement that contains the template\n     *  and which will contain the new instance. Can be an HTMLElement\n     *  or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @param {String} mode oneOf ('A','P').\n     *\n     *  @return {HTMLElement} (or last element if data is an array).\n     *\n     *\n     */\n    function add(element, data, mode) {\n      // It is supported both the element itself or a selector\n      var target = getTarget(element);\n      var newElem;\n\n      var theData = [data];\n      if (data instanceof Array) {\n        theData = data;\n      }\n\n      // Optimization to avoid trying to find a template when\n      // only one is needed\n      var multiTemplate = true;\n      var template;\n      var idx = 0;\n      theData.forEach(function(oneData) {\n        // Pseudo-field with the index\n        oneData._idx_ = idx++;\n        // A suitable template for the data is firstly found\n         if (multiTemplate === true) {\n         var tresult = getTemplate(target, oneData);\n          template = tresult.template;\n          if (tresult.isMulti === false) {\n            multiTemplate = false;\n          }\n        }\n\n        if (template) {\n          newElem = this.render(template, oneData);\n\n          if (mode === 'A') {\n             target.appendChild(newElem);\n          } else if (mode === 'P') { // Append mode\n            if (target.firstChild) {\n              target.insertBefore(newElem, target.firstChild);\n            } else {\n              target.appendChild(newElem);\n            }\n          } // prepend mode\n\n        } // if template\n\n      }.bind(this)); // forEach data\n\n      return newElem;\n    }\n\n\n    /**\n     *  Appends a new instance HTMLElement (or array of) of a template\n     *\n     *  The template is assumed to be a child of the element passed\n     *  as parameter\n     *  The new element will be appended as a child\n     *\n     *  @param {HTMLElement or String} ele container element that\n     *  contains the template and which will contain the new instance.\n     *  Can be an HTMLElement or a CSS selector.\n     *\n     *  @param {object or array} data with the data displayed by the template.\n     *\n     *  @return {HTMLelement} (or last element if data is an array).\n     *\n     *\n     */\n    Templates.append = function(element, data) {\n      var f = add.bind(this);\n\n      return f(element, data, 'A');\n    };\n\n\n    /**\n     *   Prepends a new instance (or array of) of a template\n     *\n     *   The template is assumed to be a child of the element passed\n     *   as parameter\n     *\n     *   @param {HTMLElement or String} ele container element that\n     *   contains the template and which will contain the new instance.\n     *   Can be an HTMLElement or a CSS selector.\n     *\n     *   @param {Object or Array} data with the data displayed.\n     *\n     *   @return {HTMLElement} added.\n     *\n     *\n     */\n    Templates.prepend = function(element, data) {\n       var f = add.bind(this);\n\n      return f(element, data, 'P');\n    };\n\n\n    /**\n     *  Renders the content specified by a template with object data\n     *\n     *  @param {HTMLElement} eleTemplate the template itself.\n     *  @param {Object} data the data to be used.\n     *\n     *  @return {HTMLElement} according to the template and with the data.\n     *\n     *\n     */\n    Templates.render = function(eleTemplate, data) {\n      var newElem = document.importNode(eleTemplate.content.firstElementChild,\n                                        true);\n      var inner = newElem.innerHTML;\n\n      // Replace function\n      var replaceFunction = templateReplace(data);\n\n      var pattern = /\\$\\{([^}]+)\\}/g;\n      var ninner = inner.replace(pattern, replaceFunction);\n\n      newElem.innerHTML = ninner;\n\n      var attrs = newElem.attributes;\n\n      var total = attrs.length;\n      for (var c = 0; c < total; c++) {\n        var val = attrs[c].value;\n        var nval = val.replace(pattern, replaceFunction);\n\n        newElem.setAttribute(attrs[c].name, nval);\n      }\n\n      if (!newElem.id) {\n        if (data.id) {\n          newElem.id = data.id;\n        }\n      }\n\n      return newElem;\n    };\n\n    /**\n     *  Clears a container element\n     *\n     *  @param {HTMLElement or String} element (selector or HTML element).\n     *\n     *\n     */\n    Templates.clear = function(element) {\n      var target = getTarget(element);\n      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);\n\n      target.innerHTML = '';\n\n      var total = templates.length;\n      for (var c = 0; c < total; c++) {\n        target.appendChild(templates.item(c));\n      }\n    };\n\n    // The x-template Web Component is registered\n    registerComponent();\n\n  }) ();\n} // window.templates\n");
__$coverInitRange("templates.js", "987:1017");
__$coverInitRange("templates.js", "1020:11145");
__$coverInitRange("templates.js", "1046:11143");
__$coverInitRange("templates.js", "1064:1100");
__$coverInitRange("templates.js", "1132:1168");
__$coverInitRange("templates.js", "1293:2756");
__$coverInitRange("templates.js", "3026:3198");
__$coverInitRange("templates.js", "3564:4617");
__$coverInitRange("templates.js", "4831:5049");
__$coverInitRange("templates.js", "5375:6124");
__$coverInitRange("templates.js", "6795:8113");
__$coverInitRange("templates.js", "8725:8842");
__$coverInitRange("templates.js", "9351:9470");
__$coverInitRange("templates.js", "9778:10593");
__$coverInitRange("templates.js", "10747:11057");
__$coverInitRange("templates.js", "11114:11133");
__$coverInitRange("templates.js", "1330:1486");
__$coverInitRange("templates.js", "1495:1560");
__$coverInitRange("templates.js", "1684:2637");
__$coverInitRange("templates.js", "2638:2750");
__$coverInitRange("templates.js", "1395:1462");
__$coverInitRange("templates.js", "1472:1478");
__$coverInitRange("templates.js", "1739:1770");
__$coverInitRange("templates.js", "1781:1889");
__$coverInitRange("templates.js", "1977:2007");
__$coverInitRange("templates.js", "2017:2130");
__$coverInitRange("templates.js", "2141:2205");
__$coverInitRange("templates.js", "2215:2349");
__$coverInitRange("templates.js", "2435:2539");
__$coverInitRange("templates.js", "2550:2586");
__$coverInitRange("templates.js", "2597:2621");
__$coverInitRange("templates.js", "1806:1861");
__$coverInitRange("templates.js", "1873:1879");
__$coverInitRange("templates.js", "2086:2120");
__$coverInitRange("templates.js", "2478:2529");
__$coverInitRange("templates.js", "3062:3082");
__$coverInitRange("templates.js", "3090:3170");
__$coverInitRange("templates.js", "3179:3192");
__$coverInitRange("templates.js", "3122:3162");
__$coverInitRange("templates.js", "3607:3619");
__$coverInitRange("templates.js", "3628:3686");
__$coverInitRange("templates.js", "3799:3931");
__$coverInitRange("templates.js", "3940:3968");
__$coverInitRange("templates.js", "3977:3994");
__$coverInitRange("templates.js", "4002:4047");
__$coverInitRange("templates.js", "4056:4070");
__$coverInitRange("templates.js", "4079:4520");
__$coverInitRange("templates.js", "4568:4611");
__$coverInitRange("templates.js", "3858:3923");
__$coverInitRange("templates.js", "4027:4039");
__$coverInitRange("templates.js", "4121:4172");
__$coverInitRange("templates.js", "4183:4512");
__$coverInitRange("templates.js", "4210:4243");
__$coverInitRange("templates.js", "4255:4344");
__$coverInitRange("templates.js", "4285:4313");
__$coverInitRange("templates.js", "4327:4332");
__$coverInitRange("templates.js", "4474:4502");
__$coverInitRange("templates.js", "4870:5048");
__$coverInitRange("templates.js", "4912:4941");
__$coverInitRange("templates.js", "4951:5015");
__$coverInitRange("templates.js", "5025:5035");
__$coverInitRange("templates.js", "4995:5005");
__$coverInitRange("templates.js", "5409:6041");
__$coverInitRange("templates.js", "6050:6081");
__$coverInitRange("templates.js", "6089:6118");
__$coverInitRange("templates.js", "5449:5456");
__$coverInitRange("templates.js", "5466:5482");
__$coverInitRange("templates.js", "5492:5561");
__$coverInitRange("templates.js", "5607:6013");
__$coverInitRange("templates.js", "6023:6033");
__$coverInitRange("templates.js", "5537:5551");
__$coverInitRange("templates.js", "5644:5654");
__$coverInitRange("templates.js", "5791:5817");
__$coverInitRange("templates.js", "5829:6003");
__$coverInitRange("templates.js", "5882:5916");
__$coverInitRange("templates.js", "5959:5991");
__$coverInitRange("templates.js", "6900:6931");
__$coverInitRange("templates.js", "6939:6950");
__$coverInitRange("templates.js", "6959:6979");
__$coverInitRange("templates.js", "6987:7046");
__$coverInitRange("templates.js", "7145:7169");
__$coverInitRange("templates.js", "7177:7189");
__$coverInitRange("templates.js", "7197:7208");
__$coverInitRange("templates.js", "7216:8068");
__$coverInitRange("templates.js", "8093:8107");
__$coverInitRange("templates.js", "7024:7038");
__$coverInitRange("templates.js", "7299:7320");
__$coverInitRange("templates.js", "7392:7612");
__$coverInitRange("templates.js", "7623:8031");
__$coverInitRange("templates.js", "7431:7473");
__$coverInitRange("templates.js", "7485:7512");
__$coverInitRange("templates.js", "7524:7602");
__$coverInitRange("templates.js", "7569:7590");
__$coverInitRange("templates.js", "7649:7689");
__$coverInitRange("templates.js", "7702:8004");
__$coverInitRange("templates.js", "7735:7762");
__$coverInitRange("templates.js", "7828:7992");
__$coverInitRange("templates.js", "7867:7914");
__$coverInitRange("templates.js", "7951:7978");
__$coverInitRange("templates.js", "8776:8798");
__$coverInitRange("templates.js", "8807:8835");
__$coverInitRange("templates.js", "9404:9426");
__$coverInitRange("templates.js", "9435:9463");
__$coverInitRange("templates.js", "9833:9951");
__$coverInitRange("templates.js", "9959:9988");
__$coverInitRange("templates.js", "10023:10066");
__$coverInitRange("templates.js", "10075:10105");
__$coverInitRange("templates.js", "10113:10165");
__$coverInitRange("templates.js", "10174:10200");
__$coverInitRange("templates.js", "10209:10239");
__$coverInitRange("templates.js", "10248:10272");
__$coverInitRange("templates.js", "10280:10464");
__$coverInitRange("templates.js", "10473:10563");
__$coverInitRange("templates.js", "10572:10586");
__$coverInitRange("templates.js", "10322:10346");
__$coverInitRange("templates.js", "10356:10404");
__$coverInitRange("templates.js", "10415:10456");
__$coverInitRange("templates.js", "10500:10555");
__$coverInitRange("templates.js", "10525:10545");
__$coverInitRange("templates.js", "10791:10822");
__$coverInitRange("templates.js", "10830:10888");
__$coverInitRange("templates.js", "10897:10918");
__$coverInitRange("templates.js", "10927:10955");
__$coverInitRange("templates.js", "10963:11050");
__$coverInitRange("templates.js", "11005:11042");
__$coverCall('templates.js', '987:1017');
var utils = window.utils || {};
__$coverCall('templates.js', '1020:11145');
if (!utils.templates) {
    __$coverCall('templates.js', '1046:11143');
    (function () {
        __$coverCall('templates.js', '1064:1100');
        var Templates = utils.templates = {};
        __$coverCall('templates.js', '1132:1168');
        const TEMPLATE_SELECTOR = 'template';
        __$coverCall('templates.js', '1293:2756');
        function registerComponent() {
            __$coverCall('templates.js', '1330:1486');
            if (!HTMLTemplateElement || !document.registerElement) {
                __$coverCall('templates.js', '1395:1462');
                console.warn('Web Components not available. Templates consume DOM');
                __$coverCall('templates.js', '1472:1478');
                return;
            }
            __$coverCall('templates.js', '1495:1560');
            var xTemplateProto = Object.create(HTMLTemplateElement.prototype);
            __$coverCall('templates.js', '1684:2637');
            xTemplateProto.attachedCallback = function () {
                __$coverCall('templates.js', '1739:1770');
                var parent = this.parentElement;
                __$coverCall('templates.js', '1781:1889');
                if (!parent) {
                    __$coverCall('templates.js', '1806:1861');
                    console.warn('Parent Element not avilable for: ', this);
                    __$coverCall('templates.js', '1873:1879');
                    return;
                }
                __$coverCall('templates.js', '1977:2007');
                var shadow = parent.shadowRoot;
                __$coverCall('templates.js', '2017:2130');
                if (!shadow || !shadow.querySelector(TEMPLATE_SELECTOR)) {
                    __$coverCall('templates.js', '2086:2120');
                    shadow = parent.createShadowRoot();
                }
                __$coverCall('templates.js', '2141:2205');
                var internalTemplate = document.createElement(TEMPLATE_SELECTOR);
                __$coverCall('templates.js', '2215:2349');
                internalTemplate.content.appendChild(document.importNode(this.content.firstElementChild, true));
                __$coverCall('templates.js', '2435:2539');
                for (var prop in this.dataset) {
                    __$coverCall('templates.js', '2478:2529');
                    internalTemplate.dataset[prop] = this.dataset[prop];
                }
                __$coverCall('templates.js', '2550:2586');
                shadow.appendChild(internalTemplate);
                __$coverCall('templates.js', '2597:2621');
                parent.removeChild(this);
            };
            __$coverCall('templates.js', '2638:2750');
            document.registerElement('x-template', {
                prototype: xTemplateProto,
                extends: 'template'
            });
        }
        __$coverCall('templates.js', '3026:3198');
        function getTarget(element) {
            __$coverCall('templates.js', '3062:3082');
            var target = element;
            __$coverCall('templates.js', '3090:3170');
            if (!element.tagName) {
                __$coverCall('templates.js', '3122:3162');
                target = document.querySelector(element);
            }
            __$coverCall('templates.js', '3179:3192');
            return target;
        }
        __$coverCall('templates.js', '3564:4617');
        function getTemplate(target, data) {
            __$coverCall('templates.js', '3607:3619');
            var template;
            __$coverCall('templates.js', '3628:3686');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '3799:3931');
            if (templates.length === 0 && target.shadowRoot) {
                __$coverCall('templates.js', '3858:3923');
                templates = target.shadowRoot.querySelectorAll(TEMPLATE_SELECTOR);
            }
            __$coverCall('templates.js', '3940:3968');
            var total = templates.length;
            __$coverCall('templates.js', '3977:3994');
            var multi = false;
            __$coverCall('templates.js', '4002:4047');
            if (total > 1) {
                __$coverCall('templates.js', '4027:4039');
                multi = true;
            }
            __$coverCall('templates.js', '4056:4070');
            var evaluation;
            __$coverCall('templates.js', '4079:4520');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '4121:4172');
                var condition = templates.item(c).dataset.condition;
                __$coverCall('templates.js', '4183:4512');
                if (condition) {
                    __$coverCall('templates.js', '4210:4243');
                    evaluation = get(data, condition);
                    __$coverCall('templates.js', '4255:4344');
                    if (evaluation) {
                        __$coverCall('templates.js', '4285:4313');
                        template = templates.item(c);
                        __$coverCall('templates.js', '4327:4332');
                        break;
                    }
                } else {
                    __$coverCall('templates.js', '4474:4502');
                    template = templates.item(c);
                }
            }
            __$coverCall('templates.js', '4568:4611');
            return {
                template: template,
                isMulti: multi
            };
        }
        __$coverCall('templates.js', '4831:5049');
        function templateReplace(data) {
            __$coverCall('templates.js', '4870:5048');
            return function (text, property) {
                __$coverCall('templates.js', '4912:4941');
                var out = get(data, property);
                __$coverCall('templates.js', '4951:5015');
                if (typeof out === 'undefined') {
                    __$coverCall('templates.js', '4995:5005');
                    out = text;
                }
                __$coverCall('templates.js', '5025:5035');
                return out;
            };
        }
        __$coverCall('templates.js', '5375:6124');
        function get(data, path) {
            __$coverCall('templates.js', '5409:6041');
            function doGet(pdata, fields) {
                __$coverCall('templates.js', '5449:5456');
                var out;
                __$coverCall('templates.js', '5466:5482');
                var data = pdata;
                __$coverCall('templates.js', '5492:5561');
                if (typeof pdata === 'function') {
                    __$coverCall('templates.js', '5537:5551');
                    data = pdata();
                }
                __$coverCall('templates.js', '5607:6013');
                if (fields.length === 0) {
                    __$coverCall('templates.js', '5644:5654');
                    out = data;
                } else if (data !== null && typeof data !== 'undefined') {
                    __$coverCall('templates.js', '5791:5817');
                    var field = fields.shift();
                    __$coverCall('templates.js', '5829:6003');
                    if (typeof data[field] === 'function') {
                        __$coverCall('templates.js', '5882:5916');
                        out = doGet(data[field](), fields);
                    } else {
                        __$coverCall('templates.js', '5959:5991');
                        out = doGet(data[field], fields);
                    }
                }
                __$coverCall('templates.js', '6023:6033');
                return out;
            }
            __$coverCall('templates.js', '6050:6081');
            var fieldList = path.split('.');
            __$coverCall('templates.js', '6089:6118');
            return doGet(data, fieldList);
        }
        __$coverCall('templates.js', '6795:8113');
        function add(element, data, mode) {
            __$coverCall('templates.js', '6900:6931');
            var target = getTarget(element);
            __$coverCall('templates.js', '6939:6950');
            var newElem;
            __$coverCall('templates.js', '6959:6979');
            var theData = [data];
            __$coverCall('templates.js', '6987:7046');
            if (data instanceof Array) {
                __$coverCall('templates.js', '7024:7038');
                theData = data;
            }
            __$coverCall('templates.js', '7145:7169');
            var multiTemplate = true;
            __$coverCall('templates.js', '7177:7189');
            var template;
            __$coverCall('templates.js', '7197:7208');
            var idx = 0;
            __$coverCall('templates.js', '7216:8068');
            theData.forEach(function (oneData) {
                __$coverCall('templates.js', '7299:7320');
                oneData._idx_ = idx++;
                __$coverCall('templates.js', '7392:7612');
                if (multiTemplate === true) {
                    __$coverCall('templates.js', '7431:7473');
                    var tresult = getTemplate(target, oneData);
                    __$coverCall('templates.js', '7485:7512');
                    template = tresult.template;
                    __$coverCall('templates.js', '7524:7602');
                    if (tresult.isMulti === false) {
                        __$coverCall('templates.js', '7569:7590');
                        multiTemplate = false;
                    }
                }
                __$coverCall('templates.js', '7623:8031');
                if (template) {
                    __$coverCall('templates.js', '7649:7689');
                    newElem = this.render(template, oneData);
                    __$coverCall('templates.js', '7702:8004');
                    if (mode === 'A') {
                        __$coverCall('templates.js', '7735:7762');
                        target.appendChild(newElem);
                    } else if (mode === 'P') {
                        __$coverCall('templates.js', '7828:7992');
                        if (target.firstChild) {
                            __$coverCall('templates.js', '7867:7914');
                            target.insertBefore(newElem, target.firstChild);
                        } else {
                            __$coverCall('templates.js', '7951:7978');
                            target.appendChild(newElem);
                        }
                    }
                }
            }.bind(this));
            __$coverCall('templates.js', '8093:8107');
            return newElem;
        }
        __$coverCall('templates.js', '8725:8842');
        Templates.append = function (element, data) {
            __$coverCall('templates.js', '8776:8798');
            var f = add.bind(this);
            __$coverCall('templates.js', '8807:8835');
            return f(element, data, 'A');
        };
        __$coverCall('templates.js', '9351:9470');
        Templates.prepend = function (element, data) {
            __$coverCall('templates.js', '9404:9426');
            var f = add.bind(this);
            __$coverCall('templates.js', '9435:9463');
            return f(element, data, 'P');
        };
        __$coverCall('templates.js', '9778:10593');
        Templates.render = function (eleTemplate, data) {
            __$coverCall('templates.js', '9833:9951');
            var newElem = document.importNode(eleTemplate.content.firstElementChild, true);
            __$coverCall('templates.js', '9959:9988');
            var inner = newElem.innerHTML;
            __$coverCall('templates.js', '10023:10066');
            var replaceFunction = templateReplace(data);
            __$coverCall('templates.js', '10075:10105');
            var pattern = /\$\{([^}]+)\}/g;
            __$coverCall('templates.js', '10113:10165');
            var ninner = inner.replace(pattern, replaceFunction);
            __$coverCall('templates.js', '10174:10200');
            newElem.innerHTML = ninner;
            __$coverCall('templates.js', '10209:10239');
            var attrs = newElem.attributes;
            __$coverCall('templates.js', '10248:10272');
            var total = attrs.length;
            __$coverCall('templates.js', '10280:10464');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '10322:10346');
                var val = attrs[c].value;
                __$coverCall('templates.js', '10356:10404');
                var nval = val.replace(pattern, replaceFunction);
                __$coverCall('templates.js', '10415:10456');
                newElem.setAttribute(attrs[c].name, nval);
            }
            __$coverCall('templates.js', '10473:10563');
            if (!newElem.id) {
                __$coverCall('templates.js', '10500:10555');
                if (data.id) {
                    __$coverCall('templates.js', '10525:10545');
                    newElem.id = data.id;
                }
            }
            __$coverCall('templates.js', '10572:10586');
            return newElem;
        };
        __$coverCall('templates.js', '10747:11057');
        Templates.clear = function (element) {
            __$coverCall('templates.js', '10791:10822');
            var target = getTarget(element);
            __$coverCall('templates.js', '10830:10888');
            var templates = target.querySelectorAll(TEMPLATE_SELECTOR);
            __$coverCall('templates.js', '10897:10918');
            target.innerHTML = '';
            __$coverCall('templates.js', '10927:10955');
            var total = templates.length;
            __$coverCall('templates.js', '10963:11050');
            for (var c = 0; c < total; c++) {
                __$coverCall('templates.js', '11005:11042');
                target.appendChild(templates.item(c));
            }
        };
        __$coverCall('templates.js', '11114:11133');
        registerComponent();
    }());
}