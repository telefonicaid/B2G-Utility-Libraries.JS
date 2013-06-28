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
__$coverInit("script_loader.js", "/**\n *  Module: Script Loader\n *\n *  Product: Open Web Device\n *\n *  Copyright(c) 2012 Telefónica I+D S.A.U.\n *\n *  LICENSE: Apache 2.0\n *\n *  @author Telefonica Digital\n *\n *\n *\n **/\n'use strict';\n\nvar utils = this.utils || {};\n\n(function() {\n  var scr = utils.script = {};\n\n  function getFileId(resourceSrc) {\n    var fileIdSplit = resourceSrc.split('/');\n    return fileIdSplit[fileIdSplit.length - 1];\n  }\n\n  var resourcesLoaded = {};\n\n  /**\n   *  Loads a set of resources if they have not been previously loaded\n   *\n   *  @param psources: List of resources to be loaded.\n   *\n   *  If psources is an Array the resources will be loaded asynchronously\n   *  If psources is a variable list of arguments the resources will be loaded\n   *  one after the other\n   *\n   *  How to use it?\n   *\n   *  var req = utils.script.load('myscript.js');\n   *\n   *  req.onsuccess\n   *  req.onerror\n   *  req.onresourceloaded\n   *  req.onscriptsloaded\n   *  req.onstylesloaded\n   *\n   */\n  scr.Loader = function(psources) {\n    var order = Array.isArray(psources) ? 'concurrent' : 'sequential';\n    var numLoaded = 0;\n    var self = this;\n    var nextToBeLoaded = 0;\n    var totalScriptsToBeLoaded = 0;\n    var totalStylesToBeLoaded = 0;\n    var numScriptsLoaded = 0;\n    var numStylesLoaded = 0;\n    var sourcesArray;\n    var totalToBeLoaded;\n\n    if (order === 'sequential') {\n      sourcesArray = Array.prototype.slice.call(arguments, 0, arguments.length);\n    }\n    else {\n      sourcesArray = psources;\n    }\n\n    function start() {\n      totalToBeLoaded = sourcesArray.length;\n\n       // First pass over the array to note how many scripts and how many styles\n      sourcesArray.forEach(function(aSource) {\n        var extension = getExtension(aSource);\n        if (extension === 'js') {\n          totalScriptsToBeLoaded++;\n        }\n        else if (extension === 'css') {\n          totalStylesToBeLoaded++;\n        }\n      });\n      if (order === 'sequential') {\n        loadResource(sourcesArray[0]);\n      }\n      else {\n        // All of them are loaded concurrently\n        sourcesArray.forEach(function(aSource) {\n          loadResource(aSource);\n        });\n      }\n    }\n\n    function resourceLoadedListener(e) {\n      removeEventListeners(e.target);\n\n      resourceLoaded(e.target.src || e.target.href);\n    }\n\n    function resourceLoaded(resourceSrc) {\n      var extension = getExtension(resourceSrc);\n\n      if (extension === 'js') {\n        numScriptsLoaded++;\n      }\n      else if (extension === 'css') {\n        numStylesLoaded++;\n      }\n\n      if (numScriptsLoaded === totalScriptsToBeLoaded &&\n          totalScriptsToBeLoaded > 0) {\n        if (typeof self.onscriptsloaded === 'function') {\n          window.setTimeout(self.onscriptsloaded, 0);\n        }\n      }\n\n      if (numStylesLoaded === totalStylesToBeLoaded &&\n          totalStylesToBeLoaded > 0) {\n        if (typeof self.onstylesloaded === 'function') {\n          window.setTimeout(self.onstylesloaded, 0);\n        }\n      }\n\n      numLoaded++;\n      var fileId = getFileId(resourceSrc);\n      resourcesLoaded[fileId] = true;\n      if (typeof self.onresourceloaded === 'function') {\n        window.setTimeout(function resource_loaded_cb() {\n          self.onresourceloaded(fileId);\n        }, 0);\n      }\n      nextToBeLoaded++;\n\n      if (order === 'sequential' && nextToBeLoaded < totalToBeLoaded) {\n        loadResource(sourcesArray[nextToBeLoaded]);\n      }\n      else {\n        // Order is concurrent (just check for the number of resources loaded)\n        if (numLoaded === totalToBeLoaded) {\n          if (typeof self.onfinish === 'function') {\n            window.setTimeout(self.onfinish, 0);\n          }\n        }\n      }\n    }\n\n    function addEventListeners(node) {\n      node.addEventListener('load', resourceLoadedListener);\n      node.addEventListener('error', resourceError);\n    }\n\n    function removeEventListeners(node) {\n      node.removeEventListener('load', resourceLoadedListener);\n      node.removeEventListener('error', resourceError);\n    }\n\n    function loadScript(scriptSrc) {\n      var scriptNode = document.createElement('script');\n      scriptNode.src = scriptSrc;\n      addEventListeners(scriptNode);\n\n      document.head.appendChild(scriptNode);\n    }\n\n    function loadStyle(styleSrc) {\n      var styleNode = document.createElement('link');\n      styleNode.href = styleSrc;\n      styleNode.rel = 'stylesheet';\n      styleNode.type = 'text/css';\n\n      addEventListeners(styleNode);\n      document.head.appendChild(styleNode);\n    }\n\n    function loadResource(resourceSrc) {\n      var extension = getExtension(resourceSrc);\n\n      var selector = extension === 'js' ?\n            'script[src=' + '\"' + resourceSrc + '\"]' :\n                                      'link[href=' + '\"' + resourceSrc + '\"]';\n      var node = document.head.querySelector(selector);\n\n      if (node && !resourcesLoaded[resourceSrc]) {\n        addEventListeners(node);\n      } else if (resourcesLoaded[resourceSrc] === true) {\n        resourceLoaded(resourceSrc);\n      } else {\n        extension === 'js' ? loadScript(resourceSrc) : loadStyle(resourceSrc);\n      }\n    }\n\n    start();\n  };\n\n\n  function getExtension(resourceSrc) {\n    return resourceSrc.substring(resourceSrc.lastIndexOf('.') + 1);\n  }\n\n  function resourceError(e) {\n    removeEventListeners(e.target);\n\n    if (typeof self.onerror === 'function') {\n      window.setTimeout(function cb_error() {\n        self.onerror(e.target.src);\n      }, 0);\n    }\n  }\n\n})();\n");
__$coverInitRange("script_loader.js", "184:196");
__$coverInitRange("script_loader.js", "199:227");
__$coverInitRange("script_loader.js", "230:5505");
__$coverInitRange("script_loader.js", "246:273");
__$coverInitRange("script_loader.js", "278:408");
__$coverInitRange("script_loader.js", "413:437");
__$coverInitRange("script_loader.js", "976:5166");
__$coverInitRange("script_loader.js", "5172:5279");
__$coverInitRange("script_loader.js", "5284:5498");
__$coverInitRange("script_loader.js", "316:356");
__$coverInitRange("script_loader.js", "362:404");
__$coverInitRange("script_loader.js", "1014:1079");
__$coverInitRange("script_loader.js", "1085:1102");
__$coverInitRange("script_loader.js", "1108:1123");
__$coverInitRange("script_loader.js", "1129:1151");
__$coverInitRange("script_loader.js", "1157:1187");
__$coverInitRange("script_loader.js", "1193:1222");
__$coverInitRange("script_loader.js", "1228:1252");
__$coverInitRange("script_loader.js", "1258:1281");
__$coverInitRange("script_loader.js", "1287:1303");
__$coverInitRange("script_loader.js", "1309:1328");
__$coverInitRange("script_loader.js", "1335:1498");
__$coverInitRange("script_loader.js", "1505:2169");
__$coverInitRange("script_loader.js", "2176:2309");
__$coverInitRange("script_loader.js", "2316:3707");
__$coverInitRange("script_loader.js", "3714:3867");
__$coverInitRange("script_loader.js", "3874:4036");
__$coverInitRange("script_loader.js", "4043:4254");
__$coverInitRange("script_loader.js", "4261:4535");
__$coverInitRange("script_loader.js", "4542:5147");
__$coverInitRange("script_loader.js", "5154:5161");
__$coverInitRange("script_loader.js", "1371:1444");
__$coverInitRange("script_loader.js", "1469:1492");
__$coverInitRange("script_loader.js", "1530:1567");
__$coverInitRange("script_loader.js", "1657:1918");
__$coverInitRange("script_loader.js", "1926:2163");
__$coverInitRange("script_loader.js", "1706:1743");
__$coverInitRange("script_loader.js", "1753:1908");
__$coverInitRange("script_loader.js", "1789:1813");
__$coverInitRange("script_loader.js", "1875:1898");
__$coverInitRange("script_loader.js", "1964:1993");
__$coverInitRange("script_loader.js", "2071:2155");
__$coverInitRange("script_loader.js", "2122:2143");
__$coverInitRange("script_loader.js", "2219:2249");
__$coverInitRange("script_loader.js", "2258:2303");
__$coverInitRange("script_loader.js", "2361:2402");
__$coverInitRange("script_loader.js", "2411:2544");
__$coverInitRange("script_loader.js", "2553:2772");
__$coverInitRange("script_loader.js", "2781:2995");
__$coverInitRange("script_loader.js", "3004:3015");
__$coverInitRange("script_loader.js", "3023:3058");
__$coverInitRange("script_loader.js", "3066:3096");
__$coverInitRange("script_loader.js", "3104:3275");
__$coverInitRange("script_loader.js", "3283:3299");
__$coverInitRange("script_loader.js", "3308:3701");
__$coverInitRange("script_loader.js", "2445:2463");
__$coverInitRange("script_loader.js", "2519:2536");
__$coverInitRange("script_loader.js", "2652:2764");
__$coverInitRange("script_loader.js", "2712:2754");
__$coverInitRange("script_loader.js", "2877:2987");
__$coverInitRange("script_loader.js", "2936:2977");
__$coverInitRange("script_loader.js", "3163:3267");
__$coverInitRange("script_loader.js", "3223:3252");
__$coverInitRange("script_loader.js", "3382:3424");
__$coverInitRange("script_loader.js", "3534:3693");
__$coverInitRange("script_loader.js", "3581:3683");
__$coverInitRange("script_loader.js", "3636:3671");
__$coverInitRange("script_loader.js", "3755:3808");
__$coverInitRange("script_loader.js", "3816:3861");
__$coverInitRange("script_loader.js", "3918:3974");
__$coverInitRange("script_loader.js", "3982:4030");
__$coverInitRange("script_loader.js", "4082:4131");
__$coverInitRange("script_loader.js", "4139:4165");
__$coverInitRange("script_loader.js", "4173:4202");
__$coverInitRange("script_loader.js", "4211:4248");
__$coverInitRange("script_loader.js", "4298:4344");
__$coverInitRange("script_loader.js", "4352:4377");
__$coverInitRange("script_loader.js", "4385:4413");
__$coverInitRange("script_loader.js", "4421:4448");
__$coverInitRange("script_loader.js", "4457:4485");
__$coverInitRange("script_loader.js", "4493:4529");
__$coverInitRange("script_loader.js", "4585:4626");
__$coverInitRange("script_loader.js", "4635:4803");
__$coverInitRange("script_loader.js", "4811:4859");
__$coverInitRange("script_loader.js", "4868:5141");
__$coverInitRange("script_loader.js", "4921:4944");
__$coverInitRange("script_loader.js", "5012:5039");
__$coverInitRange("script_loader.js", "5064:5133");
__$coverInitRange("script_loader.js", "5213:5275");
__$coverInitRange("script_loader.js", "5316:5346");
__$coverInitRange("script_loader.js", "5353:5494");
__$coverInitRange("script_loader.js", "5401:5488");
__$coverInitRange("script_loader.js", "5449:5475");
__$coverCall('script_loader.js', '184:196');
'use strict';
__$coverCall('script_loader.js', '199:227');
var utils = this.utils || {};
__$coverCall('script_loader.js', '230:5505');
(function () {
    __$coverCall('script_loader.js', '246:273');
    var scr = utils.script = {};
    __$coverCall('script_loader.js', '278:408');
    function getFileId(resourceSrc) {
        __$coverCall('script_loader.js', '316:356');
        var fileIdSplit = resourceSrc.split('/');
        __$coverCall('script_loader.js', '362:404');
        return fileIdSplit[fileIdSplit.length - 1];
    }
    __$coverCall('script_loader.js', '413:437');
    var resourcesLoaded = {};
    __$coverCall('script_loader.js', '976:5166');
    scr.Loader = function (psources) {
        __$coverCall('script_loader.js', '1014:1079');
        var order = Array.isArray(psources) ? 'concurrent' : 'sequential';
        __$coverCall('script_loader.js', '1085:1102');
        var numLoaded = 0;
        __$coverCall('script_loader.js', '1108:1123');
        var self = this;
        __$coverCall('script_loader.js', '1129:1151');
        var nextToBeLoaded = 0;
        __$coverCall('script_loader.js', '1157:1187');
        var totalScriptsToBeLoaded = 0;
        __$coverCall('script_loader.js', '1193:1222');
        var totalStylesToBeLoaded = 0;
        __$coverCall('script_loader.js', '1228:1252');
        var numScriptsLoaded = 0;
        __$coverCall('script_loader.js', '1258:1281');
        var numStylesLoaded = 0;
        __$coverCall('script_loader.js', '1287:1303');
        var sourcesArray;
        __$coverCall('script_loader.js', '1309:1328');
        var totalToBeLoaded;
        __$coverCall('script_loader.js', '1335:1498');
        if (order === 'sequential') {
            __$coverCall('script_loader.js', '1371:1444');
            sourcesArray = Array.prototype.slice.call(arguments, 0, arguments.length);
        } else {
            __$coverCall('script_loader.js', '1469:1492');
            sourcesArray = psources;
        }
        __$coverCall('script_loader.js', '1505:2169');
        function start() {
            __$coverCall('script_loader.js', '1530:1567');
            totalToBeLoaded = sourcesArray.length;
            __$coverCall('script_loader.js', '1657:1918');
            sourcesArray.forEach(function (aSource) {
                __$coverCall('script_loader.js', '1706:1743');
                var extension = getExtension(aSource);
                __$coverCall('script_loader.js', '1753:1908');
                if (extension === 'js') {
                    __$coverCall('script_loader.js', '1789:1813');
                    totalScriptsToBeLoaded++;
                } else if (extension === 'css') {
                    __$coverCall('script_loader.js', '1875:1898');
                    totalStylesToBeLoaded++;
                }
            });
            __$coverCall('script_loader.js', '1926:2163');
            if (order === 'sequential') {
                __$coverCall('script_loader.js', '1964:1993');
                loadResource(sourcesArray[0]);
            } else {
                __$coverCall('script_loader.js', '2071:2155');
                sourcesArray.forEach(function (aSource) {
                    __$coverCall('script_loader.js', '2122:2143');
                    loadResource(aSource);
                });
            }
        }
        __$coverCall('script_loader.js', '2176:2309');
        function resourceLoadedListener(e) {
            __$coverCall('script_loader.js', '2219:2249');
            removeEventListeners(e.target);
            __$coverCall('script_loader.js', '2258:2303');
            resourceLoaded(e.target.src || e.target.href);
        }
        __$coverCall('script_loader.js', '2316:3707');
        function resourceLoaded(resourceSrc) {
            __$coverCall('script_loader.js', '2361:2402');
            var extension = getExtension(resourceSrc);
            __$coverCall('script_loader.js', '2411:2544');
            if (extension === 'js') {
                __$coverCall('script_loader.js', '2445:2463');
                numScriptsLoaded++;
            } else if (extension === 'css') {
                __$coverCall('script_loader.js', '2519:2536');
                numStylesLoaded++;
            }
            __$coverCall('script_loader.js', '2553:2772');
            if (numScriptsLoaded === totalScriptsToBeLoaded && totalScriptsToBeLoaded > 0) {
                __$coverCall('script_loader.js', '2652:2764');
                if (typeof self.onscriptsloaded === 'function') {
                    __$coverCall('script_loader.js', '2712:2754');
                    window.setTimeout(self.onscriptsloaded, 0);
                }
            }
            __$coverCall('script_loader.js', '2781:2995');
            if (numStylesLoaded === totalStylesToBeLoaded && totalStylesToBeLoaded > 0) {
                __$coverCall('script_loader.js', '2877:2987');
                if (typeof self.onstylesloaded === 'function') {
                    __$coverCall('script_loader.js', '2936:2977');
                    window.setTimeout(self.onstylesloaded, 0);
                }
            }
            __$coverCall('script_loader.js', '3004:3015');
            numLoaded++;
            __$coverCall('script_loader.js', '3023:3058');
            var fileId = getFileId(resourceSrc);
            __$coverCall('script_loader.js', '3066:3096');
            resourcesLoaded[fileId] = true;
            __$coverCall('script_loader.js', '3104:3275');
            if (typeof self.onresourceloaded === 'function') {
                __$coverCall('script_loader.js', '3163:3267');
                window.setTimeout(function resource_loaded_cb() {
                    __$coverCall('script_loader.js', '3223:3252');
                    self.onresourceloaded(fileId);
                }, 0);
            }
            __$coverCall('script_loader.js', '3283:3299');
            nextToBeLoaded++;
            __$coverCall('script_loader.js', '3308:3701');
            if (order === 'sequential' && nextToBeLoaded < totalToBeLoaded) {
                __$coverCall('script_loader.js', '3382:3424');
                loadResource(sourcesArray[nextToBeLoaded]);
            } else {
                __$coverCall('script_loader.js', '3534:3693');
                if (numLoaded === totalToBeLoaded) {
                    __$coverCall('script_loader.js', '3581:3683');
                    if (typeof self.onfinish === 'function') {
                        __$coverCall('script_loader.js', '3636:3671');
                        window.setTimeout(self.onfinish, 0);
                    }
                }
            }
        }
        __$coverCall('script_loader.js', '3714:3867');
        function addEventListeners(node) {
            __$coverCall('script_loader.js', '3755:3808');
            node.addEventListener('load', resourceLoadedListener);
            __$coverCall('script_loader.js', '3816:3861');
            node.addEventListener('error', resourceError);
        }
        __$coverCall('script_loader.js', '3874:4036');
        function removeEventListeners(node) {
            __$coverCall('script_loader.js', '3918:3974');
            node.removeEventListener('load', resourceLoadedListener);
            __$coverCall('script_loader.js', '3982:4030');
            node.removeEventListener('error', resourceError);
        }
        __$coverCall('script_loader.js', '4043:4254');
        function loadScript(scriptSrc) {
            __$coverCall('script_loader.js', '4082:4131');
            var scriptNode = document.createElement('script');
            __$coverCall('script_loader.js', '4139:4165');
            scriptNode.src = scriptSrc;
            __$coverCall('script_loader.js', '4173:4202');
            addEventListeners(scriptNode);
            __$coverCall('script_loader.js', '4211:4248');
            document.head.appendChild(scriptNode);
        }
        __$coverCall('script_loader.js', '4261:4535');
        function loadStyle(styleSrc) {
            __$coverCall('script_loader.js', '4298:4344');
            var styleNode = document.createElement('link');
            __$coverCall('script_loader.js', '4352:4377');
            styleNode.href = styleSrc;
            __$coverCall('script_loader.js', '4385:4413');
            styleNode.rel = 'stylesheet';
            __$coverCall('script_loader.js', '4421:4448');
            styleNode.type = 'text/css';
            __$coverCall('script_loader.js', '4457:4485');
            addEventListeners(styleNode);
            __$coverCall('script_loader.js', '4493:4529');
            document.head.appendChild(styleNode);
        }
        __$coverCall('script_loader.js', '4542:5147');
        function loadResource(resourceSrc) {
            __$coverCall('script_loader.js', '4585:4626');
            var extension = getExtension(resourceSrc);
            __$coverCall('script_loader.js', '4635:4803');
            var selector = extension === 'js' ? 'script[src=' + '"' + resourceSrc + '"]' : 'link[href=' + '"' + resourceSrc + '"]';
            __$coverCall('script_loader.js', '4811:4859');
            var node = document.head.querySelector(selector);
            __$coverCall('script_loader.js', '4868:5141');
            if (node && !resourcesLoaded[resourceSrc]) {
                __$coverCall('script_loader.js', '4921:4944');
                addEventListeners(node);
            } else if (resourcesLoaded[resourceSrc] === true) {
                __$coverCall('script_loader.js', '5012:5039');
                resourceLoaded(resourceSrc);
            } else {
                __$coverCall('script_loader.js', '5064:5133');
                extension === 'js' ? loadScript(resourceSrc) : loadStyle(resourceSrc);
            }
        }
        __$coverCall('script_loader.js', '5154:5161');
        start();
    };
    __$coverCall('script_loader.js', '5172:5279');
    function getExtension(resourceSrc) {
        __$coverCall('script_loader.js', '5213:5275');
        return resourceSrc.substring(resourceSrc.lastIndexOf('.') + 1);
    }
    __$coverCall('script_loader.js', '5284:5498');
    function resourceError(e) {
        __$coverCall('script_loader.js', '5316:5346');
        removeEventListeners(e.target);
        __$coverCall('script_loader.js', '5353:5494');
        if (typeof self.onerror === 'function') {
            __$coverCall('script_loader.js', '5401:5488');
            window.setTimeout(function cb_error() {
                __$coverCall('script_loader.js', '5449:5475');
                self.onerror(e.target.src);
            }, 0);
        }
    }
}());