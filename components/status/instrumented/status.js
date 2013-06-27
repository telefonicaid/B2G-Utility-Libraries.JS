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
__$coverInit("status.js", "\n'use strict';\n\nvar utils = this.utils || {};\n\nutils.status = (function() {\n\n  // This constant is essential to resolve what is the path of the CSS file\n  // that defines the animations\n  var FILE_NAME = 'status';\n\n  // How many milliseconds is displayed the status component by default\n  var DISPLAYED_TIME = 2000;\n\n  // References to the DOMElement(s) that renders the status UI component\n  var section, content;\n\n  // The numerical ID of the timeout in order to hide UI component\n  var timeoutID;\n\n  /*\n   * Clears the callback in charge of hiding the component after timeout\n   */\n  function clearHideTimeout() {\n    if (timeoutID === null) {\n      return;\n    }\n\n    window.clearTimeout(timeoutID);\n    timeoutID = null;\n  }\n\n  /*\n   * Shows the status component\n   *\n   * @param{Object} Message. It could be a string or a DOMFragment that\n   *                represents the normal and strong strings\n   *\n   * @param{int} It defines the time that the status is displayed in ms. This\n   *             parameter is optional\n   *\n   */\n  function show(message, duration) {\n    clearHideTimeout();\n    content.innerHTML = '';\n\n    if (typeof message === 'string') {\n      content.textContent = message;\n    } else {\n      try {\n        // Here we should have a DOMFragment\n        content.appendChild(message);\n      } catch(ex) {\n        console.error('DOMException: ' + ex.message);\n      }\n    }\n\n    section.classList.remove('hidden');\n    section.classList.add('onviewport');\n    timeoutID = window.setTimeout(hide, duration || DISPLAYED_TIME);\n  }\n\n  /*\n   * This function is invoked when some animation is ended\n   */\n  function animationEnd(evt) {\n    var eventName = 'status-showed';\n\n    if (evt.animationName === 'hide') {\n      clearHideTimeout();\n      section.classList.add('hidden');\n      eventName = 'status-hidden';\n    }\n\n    window.dispatchEvent(new CustomEvent(eventName));\n  }\n\n  /*\n   * Hides the status component\n   */\n  function hide() {\n    section.classList.remove('onviewport');\n  }\n\n  /*\n   * Releases memory\n   */\n  function destroy() {\n    section.removeEventListener('animationend', animationEnd);\n    document.body.removeChild(section);\n    clearHideTimeout();\n    section = content = null;\n  }\n\n  function getPath() {\n    var path = document.querySelector('[src*=\"' + FILE_NAME + '.js\"]').src;\n    return path.substring(0, path.lastIndexOf('/') + 1);\n  }\n\n  function addStylesheet() {\n    var link = document.createElement('link');\n    link.type = 'text/css';\n    link.rel = 'stylesheet';\n    link.href = getPath() + 'status-behavior.css';\n    document.head.appendChild(link);\n  }\n\n  function build() {\n    section = document.createElement('section');\n\n    addStylesheet();\n\n    section.setAttribute('role', 'status');\n    section.classList.add('hidden');\n\n    content = document.createElement('p');\n\n    section.appendChild(content);\n    document.body.appendChild(section);\n\n    section.addEventListener('animationend', animationEnd);\n  }\n\n  /*\n   * Initializes the library. Basically it creates the markup:\n   *\n   * <section role=\"status\">\n   *   <p>xxx</p>\n   * </section>\n   */\n  function initialize() {\n    if (section) {\n      return;\n    }\n\n    build();\n  }\n\n  // Initializing the library\n  if (document.readyState === 'complete') {\n    initialize();\n  } else {\n    document.addEventListener('DOMContentLoaded', function loaded() {\n      document.removeEventListener('DOMContentLoaded', loaded);\n      initialize();\n    });\n  }\n\n  return {\n    /*\n     * The library is auto-initialized but it is for unit testing purposes\n     */\n    init: initialize,\n\n    /*\n     * Shows the status component\n     *\n     * @param{Object} Message. It could be a string or a DOMFragment that\n     *                represents the normal and strong strings\n     *\n     * @param{int} It defines the time that the status is displayed in ms\n     *\n     */\n    show: show,\n\n    /*\n     * Hides the status component\n     */\n    hide: hide,\n\n    /*\n     * Releases memory\n     */\n    destroy: destroy,\n\n    /*\n     * Sets up the duration in milliseconds that a status is displayed\n     *\n     * @param{int} The time in milliseconds\n     *\n     */\n    setDuration: function setDuration(time) {\n      DISPLAYED_TIME = time || DISPLAYED_TIME;\n    }\n  };\n\n})();\n");
__$coverInitRange("status.js", "1:13");
__$coverInitRange("status.js", "16:44");
__$coverInitRange("status.js", "47:4275");
__$coverInitRange("status.js", "188:212");
__$coverInitRange("status.js", "289:314");
__$coverInitRange("status.js", "393:413");
__$coverInitRange("status.js", "485:498");
__$coverInitRange("status.js", "587:728");
__$coverInitRange("status.js", "1041:1554");
__$coverInitRange("status.js", "1629:1899");
__$coverInitRange("status.js", "1947:2011");
__$coverInitRange("status.js", "2048:2228");
__$coverInitRange("status.js", "2233:2389");
__$coverInitRange("status.js", "2394:2615");
__$coverInitRange("status.js", "2620:2974");
__$coverInitRange("status.js", "3121:3200");
__$coverInitRange("status.js", "3235:3470");
__$coverInitRange("status.js", "3475:4268");
__$coverInitRange("status.js", "621:665");
__$coverInitRange("status.js", "672:702");
__$coverInitRange("status.js", "708:724");
__$coverInitRange("status.js", "653:659");
__$coverInitRange("status.js", "1080:1098");
__$coverInitRange("status.js", "1104:1126");
__$coverInitRange("status.js", "1133:1399");
__$coverInitRange("status.js", "1406:1440");
__$coverInitRange("status.js", "1446:1481");
__$coverInitRange("status.js", "1487:1550");
__$coverInitRange("status.js", "1174:1203");
__$coverInitRange("status.js", "1224:1393");
__$coverInitRange("status.js", "1283:1311");
__$coverInitRange("status.js", "1341:1385");
__$coverInitRange("status.js", "1662:1693");
__$coverInitRange("status.js", "1700:1840");
__$coverInitRange("status.js", "1847:1895");
__$coverInitRange("status.js", "1742:1760");
__$coverInitRange("status.js", "1768:1799");
__$coverInitRange("status.js", "1807:1834");
__$coverInitRange("status.js", "1969:2007");
__$coverInitRange("status.js", "2073:2130");
__$coverInitRange("status.js", "2136:2170");
__$coverInitRange("status.js", "2176:2194");
__$coverInitRange("status.js", "2200:2224");
__$coverInitRange("status.js", "2258:2328");
__$coverInitRange("status.js", "2334:2385");
__$coverInitRange("status.js", "2425:2466");
__$coverInitRange("status.js", "2472:2494");
__$coverInitRange("status.js", "2500:2523");
__$coverInitRange("status.js", "2529:2574");
__$coverInitRange("status.js", "2580:2611");
__$coverInitRange("status.js", "2643:2686");
__$coverInitRange("status.js", "2693:2708");
__$coverInitRange("status.js", "2715:2753");
__$coverInitRange("status.js", "2759:2790");
__$coverInitRange("status.js", "2797:2834");
__$coverInitRange("status.js", "2841:2869");
__$coverInitRange("status.js", "2875:2909");
__$coverInitRange("status.js", "2916:2970");
__$coverInitRange("status.js", "3149:3182");
__$coverInitRange("status.js", "3189:3196");
__$coverInitRange("status.js", "3170:3176");
__$coverInitRange("status.js", "3281:3293");
__$coverInitRange("status.js", "3310:3466");
__$coverInitRange("status.js", "3382:3438");
__$coverInitRange("status.js", "3446:3458");
__$coverInitRange("status.js", "4218:4257");
__$coverCall('status.js', '1:13');
'use strict';
__$coverCall('status.js', '16:44');
var utils = this.utils || {};
__$coverCall('status.js', '47:4275');
utils.status = function () {
    __$coverCall('status.js', '188:212');
    var FILE_NAME = 'status';
    __$coverCall('status.js', '289:314');
    var DISPLAYED_TIME = 2000;
    __$coverCall('status.js', '393:413');
    var section, content;
    __$coverCall('status.js', '485:498');
    var timeoutID;
    __$coverCall('status.js', '587:728');
    function clearHideTimeout() {
        __$coverCall('status.js', '621:665');
        if (timeoutID === null) {
            __$coverCall('status.js', '653:659');
            return;
        }
        __$coverCall('status.js', '672:702');
        window.clearTimeout(timeoutID);
        __$coverCall('status.js', '708:724');
        timeoutID = null;
    }
    __$coverCall('status.js', '1041:1554');
    function show(message, duration) {
        __$coverCall('status.js', '1080:1098');
        clearHideTimeout();
        __$coverCall('status.js', '1104:1126');
        content.innerHTML = '';
        __$coverCall('status.js', '1133:1399');
        if (typeof message === 'string') {
            __$coverCall('status.js', '1174:1203');
            content.textContent = message;
        } else {
            __$coverCall('status.js', '1224:1393');
            try {
                __$coverCall('status.js', '1283:1311');
                content.appendChild(message);
            } catch (ex) {
                __$coverCall('status.js', '1341:1385');
                console.error('DOMException: ' + ex.message);
            }
        }
        __$coverCall('status.js', '1406:1440');
        section.classList.remove('hidden');
        __$coverCall('status.js', '1446:1481');
        section.classList.add('onviewport');
        __$coverCall('status.js', '1487:1550');
        timeoutID = window.setTimeout(hide, duration || DISPLAYED_TIME);
    }
    __$coverCall('status.js', '1629:1899');
    function animationEnd(evt) {
        __$coverCall('status.js', '1662:1693');
        var eventName = 'status-showed';
        __$coverCall('status.js', '1700:1840');
        if (evt.animationName === 'hide') {
            __$coverCall('status.js', '1742:1760');
            clearHideTimeout();
            __$coverCall('status.js', '1768:1799');
            section.classList.add('hidden');
            __$coverCall('status.js', '1807:1834');
            eventName = 'status-hidden';
        }
        __$coverCall('status.js', '1847:1895');
        window.dispatchEvent(new CustomEvent(eventName));
    }
    __$coverCall('status.js', '1947:2011');
    function hide() {
        __$coverCall('status.js', '1969:2007');
        section.classList.remove('onviewport');
    }
    __$coverCall('status.js', '2048:2228');
    function destroy() {
        __$coverCall('status.js', '2073:2130');
        section.removeEventListener('animationend', animationEnd);
        __$coverCall('status.js', '2136:2170');
        document.body.removeChild(section);
        __$coverCall('status.js', '2176:2194');
        clearHideTimeout();
        __$coverCall('status.js', '2200:2224');
        section = content = null;
    }
    __$coverCall('status.js', '2233:2389');
    function getPath() {
        __$coverCall('status.js', '2258:2328');
        var path = document.querySelector('[src*="' + FILE_NAME + '.js"]').src;
        __$coverCall('status.js', '2334:2385');
        return path.substring(0, path.lastIndexOf('/') + 1);
    }
    __$coverCall('status.js', '2394:2615');
    function addStylesheet() {
        __$coverCall('status.js', '2425:2466');
        var link = document.createElement('link');
        __$coverCall('status.js', '2472:2494');
        link.type = 'text/css';
        __$coverCall('status.js', '2500:2523');
        link.rel = 'stylesheet';
        __$coverCall('status.js', '2529:2574');
        link.href = getPath() + 'status-behavior.css';
        __$coverCall('status.js', '2580:2611');
        document.head.appendChild(link);
    }
    __$coverCall('status.js', '2620:2974');
    function build() {
        __$coverCall('status.js', '2643:2686');
        section = document.createElement('section');
        __$coverCall('status.js', '2693:2708');
        addStylesheet();
        __$coverCall('status.js', '2715:2753');
        section.setAttribute('role', 'status');
        __$coverCall('status.js', '2759:2790');
        section.classList.add('hidden');
        __$coverCall('status.js', '2797:2834');
        content = document.createElement('p');
        __$coverCall('status.js', '2841:2869');
        section.appendChild(content);
        __$coverCall('status.js', '2875:2909');
        document.body.appendChild(section);
        __$coverCall('status.js', '2916:2970');
        section.addEventListener('animationend', animationEnd);
    }
    __$coverCall('status.js', '3121:3200');
    function initialize() {
        __$coverCall('status.js', '3149:3182');
        if (section) {
            __$coverCall('status.js', '3170:3176');
            return;
        }
        __$coverCall('status.js', '3189:3196');
        build();
    }
    __$coverCall('status.js', '3235:3470');
    if (document.readyState === 'complete') {
        __$coverCall('status.js', '3281:3293');
        initialize();
    } else {
        __$coverCall('status.js', '3310:3466');
        document.addEventListener('DOMContentLoaded', function loaded() {
            __$coverCall('status.js', '3382:3438');
            document.removeEventListener('DOMContentLoaded', loaded);
            __$coverCall('status.js', '3446:3458');
            initialize();
        });
    }
    __$coverCall('status.js', '3475:4268');
    return {
        init: initialize,
        show: show,
        hide: hide,
        destroy: destroy,
        setDuration: function setDuration(time) {
            __$coverCall('status.js', '4218:4257');
            DISPLAYED_TIME = time || DISPLAYED_TIME;
        }
    };
}();