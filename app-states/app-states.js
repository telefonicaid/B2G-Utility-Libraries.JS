/**
 *  Module: Application States
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telefónica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Telefonica Digital
 *
 *  @example (Markup)
 *
 *  <head>
 *    <meta charset="UTF-8">
 *    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
 *    <link href="default.css" rel="stylesheet">
 *    <link href="example1.css" data-state="example1" rel="stylesheet">
 *    <link href="example2.css" data-state="example2" rel="stylesheet">
 *    <style data-state="example3">
 *      <!-- my styles -->
 *    </style>
 *  </head>
 *
 */

'use strict';

var owd = window.owd || {};

if(!owd.appStates) {

  (function(doc) {
    var AppStates = owd.appStates = {};

    // Map {state -> styleSheet}
    var styleSheets = {};

    // Current state
    var currentState = undefined;

    var dataStateAttr = 'data-state';

    if (doc.readyState === 'complete') {
      exec();
    } else {
      window.addEventListener('DOMContentLoaded', function loaded() {
        window.removeEventListener('DOMContentLoaded', loaded);
        exec();
      });
    }

    function exec() {
      // Disable all styleSheets associated with states
      addStyles(doc.querySelectorAll('link[data-state]'));
      addStyles(doc.querySelectorAll('style[data-state]'));

      var body = doc.querySelector('body');

      // Does <body> element have inital state?
      var state = body.dataset.state;
      if (state) {
        AppStates.set(state);
      }

      // Listening for changes on <body> element
      body.addEventListener('DOMAttrModified', function(evt) {
        if (evt.attrName === dataStateAttr) {
          AppStates.set(evt.newValue);
        }
      });
    }

    /*
     *  Holds and disables stylesheets
     *
     *  @param {String} stylesheets
     *
     */
    function addStyles(styles) {
      var len = styles.length;
      for (var i = 0; i < len; i++) {
        var styleSheet = styles[i];
        styleSheet.disabled = true;
        styleSheets[styleSheet.dataset.state] = styleSheet;
      }
    }

    /*
     *  Sets the current application state.
     *  Unknown states disable all stylesheets.
     *
     *  @param {String} state
     *
     */
    AppStates.set = function(state) {
      if (currentState) {
        styleSheets[currentState].disabled = true;
      }

      var styleSheet = styleSheets[state];
      if (styleSheet) {
        styleSheet.disabled = false;
        currentState = state;
      } else {
        currentState = undefined;
      }
    }

  })(document);
}