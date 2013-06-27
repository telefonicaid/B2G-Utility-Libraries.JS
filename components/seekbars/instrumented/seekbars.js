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
__$coverInit("seekbars.js", "\n'use strict';\n\nvar utils = this.utils || {};\n\nutils.seekbars = (function() {\n\n  var vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :\n               (/firefox/i).test(navigator.userAgent) ? 'Moz' :\n               'opera' in window ? 'O' : '';\n\n  var transformProp = vendor + 'Transform';\n\n  // The aria-valuemin attr is initialized to 0.0 if it is not defined\n  var MIN_VALUE = 0.0;\n\n  // The aria-valuemax attr is initialized to 1.0 if it is not defined\n  var MAX_VALUE = 1.0;\n\n  var sliders = [];\n\n  // Supporting mouse or touch events depending on the delivery context\n  var isTouch = 'ontouchstart' in window;\n  var touchstart = isTouch ? 'touchstart' : 'mousedown';\n  var touchmove = isTouch ? 'touchmove' : 'mousemove';\n  var touchend = isTouch ? 'touchend' : 'mouseup';\n\n  /*\n   * Returns the pageX value depending on event type\n   */\n  var getX = (function getXWrapper() {\n    return isTouch ? function(e) { return e.touches[0].pageX; } :\n                     function(e) { return e.pageX; };\n  })();\n\n  /*\n   * Returns the progress value from the slider valuenow attribute\n   *\n   * @param{Float} aria-valuenow\n   *\n   * @param{Float} aria-valuemin\n   *\n   * @param{Float} aria-valuemax\n   */\n  function getProgressValue(value, min, max) {\n    var out = value;\n\n    if (value >= max) {\n      out = MAX_VALUE;\n    } else if (value <= min) {\n      out = MIN_VALUE;\n    } else {\n      out = (value - min) / (max - min);\n    }\n\n    return out;\n  }\n\n  /*\n   * Returns the slider aria-valuenow from the progress value attribute\n   *\n   * @param{Float} Number between 0.0 .. 1.0\n   *\n   * @param{Float} aria-valuemin\n   *\n   * @param{Float} aria-valuemax\n   */\n  function getSliderValue(value, min, max) {\n    var out = value;\n\n    if (value >= MAX_VALUE) {\n      out = max;\n    } else if (value <= MIN_VALUE) {\n      out = min;\n    } else {\n      out = ((max - min) * value) + min;\n    }\n\n    return out;\n  }\n\n  /*\n   * Slider constructor\n   */\n  var Slider = function(slider) {\n    this.slider = slider; // DOMElement with slider role\n    var handler = this.handler = slider.querySelector('progress + button');\n    var progress = this.progress = slider.querySelector('progress');\n\n    this.calculateDimensions();\n\n    var vmin = this.valuemin =\n                  parseFloat(slider.getAttribute('aria-valuemin')) || MIN_VALUE;\n\n    var vmax = this.valuemax =\n                  parseFloat(slider.getAttribute('aria-valuemax')) || MAX_VALUE;\n\n    // HTML authors are doing something wrong\n    if (vmax < vmin) {\n      vmax = MAX_VALUE;\n    }\n\n    var vnow = parseFloat(slider.getAttribute('aria-valuenow'));\n    if (!vnow && vnow !== 0) {\n      vnow = vmin;\n      slider.setAttribute('aria-valuenow', vnow);\n    }\n\n    // We have to place the handler and set the correct value to progress bar\n    var value = this.valuestart = getProgressValue(vnow, vmin, vmax);\n    this.placeHandler(value);\n    progress.value = value;\n    progress.max = MAX_VALUE;\n\n    // Waiting for events on the UI\n    slider.addEventListener(touchstart, this);\n  };\n\n  Slider.prototype = {\n    handleEvent: function slider_handleEvent(evt) {\n      switch (evt.type) {\n        case touchstart:\n          // We cannot prevent the default behavior here in order to allow\n          // active pseudo class\n          this.slider.removeEventListener(touchstart, this);\n\n          this.currentX = getX(evt);\n          this.startX = this.handler.getBoundingClientRect().left +\n                        this.halfHandlerWidth;\n          this.updateUI();\n\n          if (evt.target === this.handler) {\n            window.addEventListener(touchmove, this);\n          }\n\n          window.addEventListener(touchend, this);\n\n          break;\n\n        case touchmove:\n          evt.preventDefault();\n\n          var x = getX(evt);\n          if (x < this.progressLeft) {\n            this.setValue(MIN_VALUE);\n          } else if (x > this.progressRight) {\n            this.setValue(MAX_VALUE);\n          } else {\n            this.currentX = x;\n            this.updateUI();\n          }\n\n          break;\n\n        case touchend:\n          evt.preventDefault();\n          this.deltaX = this.getDeltaX(); // Saving the last delta value\n          this.slider.addEventListener(touchstart, this);\n          window.removeEventListener(touchmove, this);\n          window.removeEventListener(touchend, this);\n\n          break;\n      }\n    },\n\n    /*\n     * Calculates the delta in x-coordinate\n     */\n    getDeltaX: function getDeltaX() {\n      return this.deltaX + this.currentX - this.startX;\n    },\n\n    /*\n     * Translates the handler and changes the value of the progress bar\n     */\n    updateUI: function updateUI() {\n      var deltaX = this.getDeltaX();\n      // Translates the handler button\n      this.handler.style[transformProp] = 'translateX(' + deltaX + 'px)';\n\n      // Changes the progress value\n      this.setValue(this.valuestart + (deltaX / this.progressWidth));\n    },\n\n    setValue: function setValue(value) {\n      this.progress.value = value;\n      this.slider.setAttribute('aria-valuenow',\n                          getSliderValue(value, this.valuemin, this.valuemax));\n\n      this.slider.dispatchEvent(new Event('change', {\n        bubbles: true\n      }));\n    },\n\n    calculateDimensions: function calculateDimensions() {\n      this.progressWidth = this.progress.clientWidth;\n      this.halfHandlerWidth = this.handler.clientWidth / 2;\n\n      // We are going to calculate the limits to translate the handler\n      this.progressLeft = this.progress.getBoundingClientRect().left;\n      this.progressRight = this.progressLeft + this.progressWidth;\n\n      this.deltaX = 0;\n    },\n\n    placeHandler: function placeHandler(value) {\n      this.handler.style.left = (100 * value) + '%';\n      this.handler.style[transformProp] = 'translateX(0)';\n    },\n\n    destroy: function destroy() {\n      // Removing listeners\n      this.slider.removeEventListener(touchstart, this);\n\n      // Variables to null\n      this.progress = this.slider = this.handler = this.valuemax =\n      this.valuemin = this.valuestart = this.progressWidth =\n      this.deltaX = this.currentX = this.progressLeft =\n      this.progressRight = null;\n    }\n  };\n\n  function initialize() {\n    reset();\n    // Looking for ALL sliders in the DOM\n    var sliderElements = document.querySelectorAll('[role=\"slider\"]');\n    for (var i = 0; i < sliderElements.length; i++) {\n      sliders.push(new Slider(sliderElements[i]));\n    }\n  }\n\n  function reset() {\n    sliders.forEach(function(slider) {\n      slider.destroy();\n    });\n    sliders = [];\n  }\n\n  function reArrange() {\n    sliders.forEach(function(slider) {\n      slider.calculateDimensions();\n      slider.valuestart = slider.progress.value;\n      slider.placeHandler(slider.valuestart);\n    });\n  }\n\n  window.addEventListener('resize', reArrange);\n\n  try {\n    screen.addEventListener('orientationchange', reArrange);\n  } catch(ex) {\n    window.addEventListener('orientationchange', reArrange);\n  }\n\n  // Initializing the library\n  if (document.readyState === 'complete') {\n    initialize();\n  } else {\n    document.addEventListener('DOMContentLoaded', function loaded() {\n      document.removeEventListener('DOMContentLoaded', loaded);\n      initialize();\n    });\n  }\n\n  return {\n    /*\n     * This library is auto-executable although we need this public method\n     * for unit testing\n     */\n    init: initialize,\n\n\n    /*\n     * Destroys all variables and removes event listeners running\n     */\n    destroy: reset,\n\n    /*\n     * Binds to an UI component\n     *\n     * @param{Object} DOMElement o selector that represents the slider\n     */\n    bind: function bind(elem) {\n      elem = typeof elem === 'object' ? elem : document.querySelector(elem);\n      sliders.push(new Slider(elem));\n    },\n\n    /*\n     * Creates a new slider UI component\n     *\n     * @param{Object} Options\n     */\n    create: function create(options) {\n      var slider = document.createElement('div');\n      slider.setAttribute('role', 'slider');\n\n      if (options) {\n        Object.keys(options).forEach(function(key) {\n          slider.setAttribute(key, options[key]);\n        });\n      }\n\n      var wrapper = document.createElement('div');\n      var progress = document.createElement('progress');\n      progress.setAttribute('role', 'presentation');\n\n      wrapper.appendChild(progress);\n      wrapper.appendChild(document.createElement('button'));\n      slider.appendChild(wrapper);\n\n      return slider;\n    }\n  };\n\n})();\n");
__$coverInitRange("seekbars.js", "1:13");
__$coverInitRange("seekbars.js", "16:44");
__$coverInitRange("seekbars.js", "47:8504");
__$coverInitRange("seekbars.js", "81:253");
__$coverInitRange("seekbars.js", "258:298");
__$coverInitRange("seekbars.js", "374:393");
__$coverInitRange("seekbars.js", "469:488");
__$coverInitRange("seekbars.js", "493:509");
__$coverInitRange("seekbars.js", "586:624");
__$coverInitRange("seekbars.js", "628:681");
__$coverInitRange("seekbars.js", "685:736");
__$coverInitRange("seekbars.js", "740:787");
__$coverInitRange("seekbars.js", "856:1019");
__$coverInitRange("seekbars.js", "1216:1463");
__$coverInitRange("seekbars.js", "1677:1922");
__$coverInitRange("seekbars.js", "1962:3051");
__$coverInitRange("seekbars.js", "3056:6203");
__$coverInitRange("seekbars.js", "6208:6471");
__$coverInitRange("seekbars.js", "6476:6586");
__$coverInitRange("seekbars.js", "6591:6794");
__$coverInitRange("seekbars.js", "6799:6843");
__$coverInitRange("seekbars.js", "6848:6994");
__$coverInitRange("seekbars.js", "7029:7264");
__$coverInitRange("seekbars.js", "7269:8497");
__$coverInitRange("seekbars.js", "897:1011");
__$coverInitRange("seekbars.js", "928:953");
__$coverInitRange("seekbars.js", "994:1008");
__$coverInitRange("seekbars.js", "1265:1280");
__$coverInitRange("seekbars.js", "1287:1442");
__$coverInitRange("seekbars.js", "1449:1459");
__$coverInitRange("seekbars.js", "1313:1328");
__$coverInitRange("seekbars.js", "1367:1382");
__$coverInitRange("seekbars.js", "1403:1436");
__$coverInitRange("seekbars.js", "1724:1739");
__$coverInitRange("seekbars.js", "1746:1901");
__$coverInitRange("seekbars.js", "1908:1918");
__$coverInitRange("seekbars.js", "1778:1787");
__$coverInitRange("seekbars.js", "1832:1841");
__$coverInitRange("seekbars.js", "1862:1895");
__$coverInitRange("seekbars.js", "1998:2018");
__$coverInitRange("seekbars.js", "2055:2125");
__$coverInitRange("seekbars.js", "2131:2194");
__$coverInitRange("seekbars.js", "2201:2227");
__$coverInitRange("seekbars.js", "2234:2340");
__$coverInitRange("seekbars.js", "2347:2453");
__$coverInitRange("seekbars.js", "2506:2553");
__$coverInitRange("seekbars.js", "2560:2619");
__$coverInitRange("seekbars.js", "2625:2725");
__$coverInitRange("seekbars.js", "2810:2874");
__$coverInitRange("seekbars.js", "2880:2904");
__$coverInitRange("seekbars.js", "2910:2932");
__$coverInitRange("seekbars.js", "2938:2962");
__$coverInitRange("seekbars.js", "3005:3046");
__$coverInitRange("seekbars.js", "2531:2547");
__$coverInitRange("seekbars.js", "2658:2669");
__$coverInitRange("seekbars.js", "2677:2719");
__$coverInitRange("seekbars.js", "3135:4389");
__$coverInitRange("seekbars.js", "3298:3347");
__$coverInitRange("seekbars.js", "3360:3385");
__$coverInitRange("seekbars.js", "3397:3500");
__$coverInitRange("seekbars.js", "3512:3527");
__$coverInitRange("seekbars.js", "3540:3639");
__$coverInitRange("seekbars.js", "3652:3691");
__$coverInitRange("seekbars.js", "3704:3709");
__$coverInitRange("seekbars.js", "3587:3627");
__$coverInitRange("seekbars.js", "3746:3766");
__$coverInitRange("seekbars.js", "3779:3796");
__$coverInitRange("seekbars.js", "3808:4049");
__$coverInitRange("seekbars.js", "4062:4067");
__$coverInitRange("seekbars.js", "3849:3873");
__$coverInitRange("seekbars.js", "3934:3958");
__$coverInitRange("seekbars.js", "3991:4008");
__$coverInitRange("seekbars.js", "4022:4037");
__$coverInitRange("seekbars.js", "4103:4123");
__$coverInitRange("seekbars.js", "4135:4165");
__$coverInitRange("seekbars.js", "4208:4254");
__$coverInitRange("seekbars.js", "4266:4309");
__$coverInitRange("seekbars.js", "4321:4363");
__$coverInitRange("seekbars.js", "4376:4381");
__$coverInitRange("seekbars.js", "4502:4550");
__$coverInitRange("seekbars.js", "4689:4718");
__$coverInitRange("seekbars.js", "4765:4831");
__$coverInitRange("seekbars.js", "4876:4938");
__$coverInitRange("seekbars.js", "4995:5022");
__$coverInitRange("seekbars.js", "5030:5150");
__$coverInitRange("seekbars.js", "5159:5238");
__$coverInitRange("seekbars.js", "5312:5358");
__$coverInitRange("seekbars.js", "5366:5418");
__$coverInitRange("seekbars.js", "5498:5560");
__$coverInitRange("seekbars.js", "5568:5627");
__$coverInitRange("seekbars.js", "5636:5651");
__$coverInitRange("seekbars.js", "5716:5761");
__$coverInitRange("seekbars.js", "5769:5820");
__$coverInitRange("seekbars.js", "5898:5947");
__$coverInitRange("seekbars.js", "5983:6192");
__$coverInitRange("seekbars.js", "6236:6243");
__$coverInitRange("seekbars.js", "6291:6356");
__$coverInitRange("seekbars.js", "6362:6467");
__$coverInitRange("seekbars.js", "6418:6461");
__$coverInitRange("seekbars.js", "6499:6564");
__$coverInitRange("seekbars.js", "6570:6582");
__$coverInitRange("seekbars.js", "6540:6556");
__$coverInitRange("seekbars.js", "6618:6790");
__$coverInitRange("seekbars.js", "6659:6687");
__$coverInitRange("seekbars.js", "6695:6736");
__$coverInitRange("seekbars.js", "6744:6782");
__$coverInitRange("seekbars.js", "6858:6913");
__$coverInitRange("seekbars.js", "6935:6990");
__$coverInitRange("seekbars.js", "7075:7087");
__$coverInitRange("seekbars.js", "7104:7260");
__$coverInitRange("seekbars.js", "7176:7232");
__$coverInitRange("seekbars.js", "7240:7252");
__$coverInitRange("seekbars.js", "7681:7750");
__$coverInitRange("seekbars.js", "7758:7788");
__$coverInitRange("seekbars.js", "7936:7978");
__$coverInitRange("seekbars.js", "7986:8023");
__$coverInitRange("seekbars.js", "8032:8168");
__$coverInitRange("seekbars.js", "8177:8220");
__$coverInitRange("seekbars.js", "8228:8277");
__$coverInitRange("seekbars.js", "8285:8330");
__$coverInitRange("seekbars.js", "8339:8368");
__$coverInitRange("seekbars.js", "8376:8429");
__$coverInitRange("seekbars.js", "8437:8464");
__$coverInitRange("seekbars.js", "8473:8486");
__$coverInitRange("seekbars.js", "8055:8160");
__$coverInitRange("seekbars.js", "8110:8148");
__$coverCall('seekbars.js', '1:13');
'use strict';
__$coverCall('seekbars.js', '16:44');
var utils = this.utils || {};
__$coverCall('seekbars.js', '47:8504');
utils.seekbars = function () {
    __$coverCall('seekbars.js', '81:253');
    var vendor = /webkit/i.test(navigator.appVersion) ? 'webkit' : /firefox/i.test(navigator.userAgent) ? 'Moz' : 'opera' in window ? 'O' : '';
    __$coverCall('seekbars.js', '258:298');
    var transformProp = vendor + 'Transform';
    __$coverCall('seekbars.js', '374:393');
    var MIN_VALUE = 0;
    __$coverCall('seekbars.js', '469:488');
    var MAX_VALUE = 1;
    __$coverCall('seekbars.js', '493:509');
    var sliders = [];
    __$coverCall('seekbars.js', '586:624');
    var isTouch = 'ontouchstart' in window;
    __$coverCall('seekbars.js', '628:681');
    var touchstart = isTouch ? 'touchstart' : 'mousedown';
    __$coverCall('seekbars.js', '685:736');
    var touchmove = isTouch ? 'touchmove' : 'mousemove';
    __$coverCall('seekbars.js', '740:787');
    var touchend = isTouch ? 'touchend' : 'mouseup';
    __$coverCall('seekbars.js', '856:1019');
    var getX = function getXWrapper() {
            __$coverCall('seekbars.js', '897:1011');
            return isTouch ? function (e) {
                __$coverCall('seekbars.js', '928:953');
                return e.touches[0].pageX;
            } : function (e) {
                __$coverCall('seekbars.js', '994:1008');
                return e.pageX;
            };
        }();
    __$coverCall('seekbars.js', '1216:1463');
    function getProgressValue(value, min, max) {
        __$coverCall('seekbars.js', '1265:1280');
        var out = value;
        __$coverCall('seekbars.js', '1287:1442');
        if (value >= max) {
            __$coverCall('seekbars.js', '1313:1328');
            out = MAX_VALUE;
        } else if (value <= min) {
            __$coverCall('seekbars.js', '1367:1382');
            out = MIN_VALUE;
        } else {
            __$coverCall('seekbars.js', '1403:1436');
            out = (value - min) / (max - min);
        }
        __$coverCall('seekbars.js', '1449:1459');
        return out;
    }
    __$coverCall('seekbars.js', '1677:1922');
    function getSliderValue(value, min, max) {
        __$coverCall('seekbars.js', '1724:1739');
        var out = value;
        __$coverCall('seekbars.js', '1746:1901');
        if (value >= MAX_VALUE) {
            __$coverCall('seekbars.js', '1778:1787');
            out = max;
        } else if (value <= MIN_VALUE) {
            __$coverCall('seekbars.js', '1832:1841');
            out = min;
        } else {
            __$coverCall('seekbars.js', '1862:1895');
            out = (max - min) * value + min;
        }
        __$coverCall('seekbars.js', '1908:1918');
        return out;
    }
    __$coverCall('seekbars.js', '1962:3051');
    var Slider = function (slider) {
        __$coverCall('seekbars.js', '1998:2018');
        this.slider = slider;
        __$coverCall('seekbars.js', '2055:2125');
        var handler = this.handler = slider.querySelector('progress + button');
        __$coverCall('seekbars.js', '2131:2194');
        var progress = this.progress = slider.querySelector('progress');
        __$coverCall('seekbars.js', '2201:2227');
        this.calculateDimensions();
        __$coverCall('seekbars.js', '2234:2340');
        var vmin = this.valuemin = parseFloat(slider.getAttribute('aria-valuemin')) || MIN_VALUE;
        __$coverCall('seekbars.js', '2347:2453');
        var vmax = this.valuemax = parseFloat(slider.getAttribute('aria-valuemax')) || MAX_VALUE;
        __$coverCall('seekbars.js', '2506:2553');
        if (vmax < vmin) {
            __$coverCall('seekbars.js', '2531:2547');
            vmax = MAX_VALUE;
        }
        __$coverCall('seekbars.js', '2560:2619');
        var vnow = parseFloat(slider.getAttribute('aria-valuenow'));
        __$coverCall('seekbars.js', '2625:2725');
        if (!vnow && vnow !== 0) {
            __$coverCall('seekbars.js', '2658:2669');
            vnow = vmin;
            __$coverCall('seekbars.js', '2677:2719');
            slider.setAttribute('aria-valuenow', vnow);
        }
        __$coverCall('seekbars.js', '2810:2874');
        var value = this.valuestart = getProgressValue(vnow, vmin, vmax);
        __$coverCall('seekbars.js', '2880:2904');
        this.placeHandler(value);
        __$coverCall('seekbars.js', '2910:2932');
        progress.value = value;
        __$coverCall('seekbars.js', '2938:2962');
        progress.max = MAX_VALUE;
        __$coverCall('seekbars.js', '3005:3046');
        slider.addEventListener(touchstart, this);
    };
    __$coverCall('seekbars.js', '3056:6203');
    Slider.prototype = {
        handleEvent: function slider_handleEvent(evt) {
            __$coverCall('seekbars.js', '3135:4389');
            switch (evt.type) {
            case touchstart:
                __$coverCall('seekbars.js', '3298:3347');
                this.slider.removeEventListener(touchstart, this);
                __$coverCall('seekbars.js', '3360:3385');
                this.currentX = getX(evt);
                __$coverCall('seekbars.js', '3397:3500');
                this.startX = this.handler.getBoundingClientRect().left + this.halfHandlerWidth;
                __$coverCall('seekbars.js', '3512:3527');
                this.updateUI();
                __$coverCall('seekbars.js', '3540:3639');
                if (evt.target === this.handler) {
                    __$coverCall('seekbars.js', '3587:3627');
                    window.addEventListener(touchmove, this);
                }
                __$coverCall('seekbars.js', '3652:3691');
                window.addEventListener(touchend, this);
                __$coverCall('seekbars.js', '3704:3709');
                break;
            case touchmove:
                __$coverCall('seekbars.js', '3746:3766');
                evt.preventDefault();
                __$coverCall('seekbars.js', '3779:3796');
                var x = getX(evt);
                __$coverCall('seekbars.js', '3808:4049');
                if (x < this.progressLeft) {
                    __$coverCall('seekbars.js', '3849:3873');
                    this.setValue(MIN_VALUE);
                } else if (x > this.progressRight) {
                    __$coverCall('seekbars.js', '3934:3958');
                    this.setValue(MAX_VALUE);
                } else {
                    __$coverCall('seekbars.js', '3991:4008');
                    this.currentX = x;
                    __$coverCall('seekbars.js', '4022:4037');
                    this.updateUI();
                }
                __$coverCall('seekbars.js', '4062:4067');
                break;
            case touchend:
                __$coverCall('seekbars.js', '4103:4123');
                evt.preventDefault();
                __$coverCall('seekbars.js', '4135:4165');
                this.deltaX = this.getDeltaX();
                __$coverCall('seekbars.js', '4208:4254');
                this.slider.addEventListener(touchstart, this);
                __$coverCall('seekbars.js', '4266:4309');
                window.removeEventListener(touchmove, this);
                __$coverCall('seekbars.js', '4321:4363');
                window.removeEventListener(touchend, this);
                __$coverCall('seekbars.js', '4376:4381');
                break;
            }
        },
        getDeltaX: function getDeltaX() {
            __$coverCall('seekbars.js', '4502:4550');
            return this.deltaX + this.currentX - this.startX;
        },
        updateUI: function updateUI() {
            __$coverCall('seekbars.js', '4689:4718');
            var deltaX = this.getDeltaX();
            __$coverCall('seekbars.js', '4765:4831');
            this.handler.style[transformProp] = 'translateX(' + deltaX + 'px)';
            __$coverCall('seekbars.js', '4876:4938');
            this.setValue(this.valuestart + deltaX / this.progressWidth);
        },
        setValue: function setValue(value) {
            __$coverCall('seekbars.js', '4995:5022');
            this.progress.value = value;
            __$coverCall('seekbars.js', '5030:5150');
            this.slider.setAttribute('aria-valuenow', getSliderValue(value, this.valuemin, this.valuemax));
            __$coverCall('seekbars.js', '5159:5238');
            this.slider.dispatchEvent(new Event('change', { bubbles: true }));
        },
        calculateDimensions: function calculateDimensions() {
            __$coverCall('seekbars.js', '5312:5358');
            this.progressWidth = this.progress.clientWidth;
            __$coverCall('seekbars.js', '5366:5418');
            this.halfHandlerWidth = this.handler.clientWidth / 2;
            __$coverCall('seekbars.js', '5498:5560');
            this.progressLeft = this.progress.getBoundingClientRect().left;
            __$coverCall('seekbars.js', '5568:5627');
            this.progressRight = this.progressLeft + this.progressWidth;
            __$coverCall('seekbars.js', '5636:5651');
            this.deltaX = 0;
        },
        placeHandler: function placeHandler(value) {
            __$coverCall('seekbars.js', '5716:5761');
            this.handler.style.left = 100 * value + '%';
            __$coverCall('seekbars.js', '5769:5820');
            this.handler.style[transformProp] = 'translateX(0)';
        },
        destroy: function destroy() {
            __$coverCall('seekbars.js', '5898:5947');
            this.slider.removeEventListener(touchstart, this);
            __$coverCall('seekbars.js', '5983:6192');
            this.progress = this.slider = this.handler = this.valuemax = this.valuemin = this.valuestart = this.progressWidth = this.deltaX = this.currentX = this.progressLeft = this.progressRight = null;
        }
    };
    __$coverCall('seekbars.js', '6208:6471');
    function initialize() {
        __$coverCall('seekbars.js', '6236:6243');
        reset();
        __$coverCall('seekbars.js', '6291:6356');
        var sliderElements = document.querySelectorAll('[role="slider"]');
        __$coverCall('seekbars.js', '6362:6467');
        for (var i = 0; i < sliderElements.length; i++) {
            __$coverCall('seekbars.js', '6418:6461');
            sliders.push(new Slider(sliderElements[i]));
        }
    }
    __$coverCall('seekbars.js', '6476:6586');
    function reset() {
        __$coverCall('seekbars.js', '6499:6564');
        sliders.forEach(function (slider) {
            __$coverCall('seekbars.js', '6540:6556');
            slider.destroy();
        });
        __$coverCall('seekbars.js', '6570:6582');
        sliders = [];
    }
    __$coverCall('seekbars.js', '6591:6794');
    function reArrange() {
        __$coverCall('seekbars.js', '6618:6790');
        sliders.forEach(function (slider) {
            __$coverCall('seekbars.js', '6659:6687');
            slider.calculateDimensions();
            __$coverCall('seekbars.js', '6695:6736');
            slider.valuestart = slider.progress.value;
            __$coverCall('seekbars.js', '6744:6782');
            slider.placeHandler(slider.valuestart);
        });
    }
    __$coverCall('seekbars.js', '6799:6843');
    window.addEventListener('resize', reArrange);
    __$coverCall('seekbars.js', '6848:6994');
    try {
        __$coverCall('seekbars.js', '6858:6913');
        screen.addEventListener('orientationchange', reArrange);
    } catch (ex) {
        __$coverCall('seekbars.js', '6935:6990');
        window.addEventListener('orientationchange', reArrange);
    }
    __$coverCall('seekbars.js', '7029:7264');
    if (document.readyState === 'complete') {
        __$coverCall('seekbars.js', '7075:7087');
        initialize();
    } else {
        __$coverCall('seekbars.js', '7104:7260');
        document.addEventListener('DOMContentLoaded', function loaded() {
            __$coverCall('seekbars.js', '7176:7232');
            document.removeEventListener('DOMContentLoaded', loaded);
            __$coverCall('seekbars.js', '7240:7252');
            initialize();
        });
    }
    __$coverCall('seekbars.js', '7269:8497');
    return {
        init: initialize,
        destroy: reset,
        bind: function bind(elem) {
            __$coverCall('seekbars.js', '7681:7750');
            elem = typeof elem === 'object' ? elem : document.querySelector(elem);
            __$coverCall('seekbars.js', '7758:7788');
            sliders.push(new Slider(elem));
        },
        create: function create(options) {
            __$coverCall('seekbars.js', '7936:7978');
            var slider = document.createElement('div');
            __$coverCall('seekbars.js', '7986:8023');
            slider.setAttribute('role', 'slider');
            __$coverCall('seekbars.js', '8032:8168');
            if (options) {
                __$coverCall('seekbars.js', '8055:8160');
                Object.keys(options).forEach(function (key) {
                    __$coverCall('seekbars.js', '8110:8148');
                    slider.setAttribute(key, options[key]);
                });
            }
            __$coverCall('seekbars.js', '8177:8220');
            var wrapper = document.createElement('div');
            __$coverCall('seekbars.js', '8228:8277');
            var progress = document.createElement('progress');
            __$coverCall('seekbars.js', '8285:8330');
            progress.setAttribute('role', 'presentation');
            __$coverCall('seekbars.js', '8339:8368');
            wrapper.appendChild(progress);
            __$coverCall('seekbars.js', '8376:8429');
            wrapper.appendChild(document.createElement('button'));
            __$coverCall('seekbars.js', '8437:8464');
            slider.appendChild(wrapper);
            __$coverCall('seekbars.js', '8473:8486');
            return slider;
        }
    };
}();