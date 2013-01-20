/**
 *  Module: Configuration
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telefónica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author José M. Cantera (jmcf@tid.es)
 *
 *  It allows to retrieve a A JSON configuration file
 *
 *  var req = utils.config.load('myconfig.json');
 *
 *  req.onload = function(configData) {
 *   // Use configData as a JS Object (it is already parsed)
 *  }
 *
 *  req.onerror = function() {
 *   window.console.error('Failed!!');
 *  }
 *
 */

'use strict';

var utils = window.utils || {};

if (typeof utils.config === 'undefined') {
  (function() {
    var config = utils.config = {};

    config.load = function(resource) {

      var outReq = new LoadRequest();

      window.setTimeout(function do_load() {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('GET', resource, true);

        xhr.onreadystatechange = function() {
          // We will get a 0 status if the app is in app://
          if (xhr.readyState === 4 && (xhr.status === 200 ||
                                       xhr.status === 0)) {

            var response = xhr.responseText;
            var configuration = JSON.parse(response);
            outReq.completed(configuration);
          }
          else if (xhr.readyState === 4) {
             outReq.failed(xhr.status);
          }
        } // onreadystatechange

        xhr.send(null);

      },0);

      return outReq;
    }

    function LoadRequest() {
      this.completed = function(configData) {
        if (typeof this.onload === 'function') {
          this.onload(configData);
        }
      }

      this.failed = function(code) {
        if (typeof this.onerror === 'function') {
          this.onerror(code);
        }
      }
    }
  })();
}
