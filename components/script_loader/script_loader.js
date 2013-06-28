/**
 *  Module: Script Loader
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telefónica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Telefonica Digital
 *
 *
 *
 **/
'use strict';

var utils = this.utils || {};

(function() {
  var scr = utils.script = {};

  function getFileId(resourceSrc) {
    var fileIdSplit = resourceSrc.split('/');
    return fileIdSplit[fileIdSplit.length - 1];
  }

  var resourcesLoaded = {};

  /**
   *  Loads a set of resources if they have not been previously loaded
   *
   *  @param psources: List of resources to be loaded.
   *
   *  If psources is an Array the resources will be loaded asynchronously
   *  If psources is a variable list of arguments the resources will be loaded
   *  one after the other
   *
   *  How to use it?
   *
   *  var req = utils.script.load('myscript.js');
   *
   *  req.onsuccess
   *  req.onerror
   *  req.onresourceloaded
   *  req.onscriptsloaded
   *  req.onstylesloaded
   *
   */
  scr.Loader = function(psources) {
    var order = Array.isArray(psources) ? 'concurrent' : 'sequential';
    var numLoaded = 0;
    var self = this;
    var nextToBeLoaded = 0;
    var totalScriptsToBeLoaded = 0;
    var totalStylesToBeLoaded = 0;
    var numScriptsLoaded = 0;
    var numStylesLoaded = 0;
    var sourcesArray;
    var totalToBeLoaded;

    if (order === 'sequential') {
      sourcesArray = Array.prototype.slice.call(arguments, 0, arguments.length);
    }
    else {
      sourcesArray = psources;
    }

    function start() {
      totalToBeLoaded = sourcesArray.length;

       // First pass over the array to note how many scripts and how many styles
      sourcesArray.forEach(function(aSource) {
        var extension = getExtension(aSource);
        if (extension === 'js') {
          totalScriptsToBeLoaded++;
        }
        else if (extension === 'css') {
          totalStylesToBeLoaded++;
        }
      });
      if (order === 'sequential') {
        loadResource(sourcesArray[0]);
      }
      else {
        // All of them are loaded concurrently
        sourcesArray.forEach(function(aSource) {
          loadResource(aSource);
        });
      }
    }

    function resourceLoadedListener(e) {
      removeEventListeners(e.target);

      resourceLoaded(e.target.src || e.target.href);
    }

    function resourceLoaded(resourceSrc) {
      var extension = getExtension(resourceSrc);

      if (extension === 'js') {
        numScriptsLoaded++;
      }
      else if (extension === 'css') {
        numStylesLoaded++;
      }

      if (numScriptsLoaded === totalScriptsToBeLoaded &&
          totalScriptsToBeLoaded > 0) {
        if (typeof self.onscriptsloaded === 'function') {
          window.setTimeout(self.onscriptsloaded, 0);
        }
      }

      if (numStylesLoaded === totalStylesToBeLoaded &&
          totalStylesToBeLoaded > 0) {
        if (typeof self.onstylesloaded === 'function') {
          window.setTimeout(self.onstylesloaded, 0);
        }
      }

      numLoaded++;
      var fileId = getFileId(resourceSrc);
      resourcesLoaded[fileId] = true;
      if (typeof self.onresourceloaded === 'function') {
        window.setTimeout(function resource_loaded_cb() {
          self.onresourceloaded(fileId);
        }, 0);
      }
      nextToBeLoaded++;

      if (order === 'sequential' && nextToBeLoaded < totalToBeLoaded) {
        loadResource(sourcesArray[nextToBeLoaded]);
      }
      else {
        // Order is concurrent (just check for the number of resources loaded)
        if (numLoaded === totalToBeLoaded) {
          if (typeof self.onfinish === 'function') {
            window.setTimeout(self.onfinish, 0);
          }
        }
      }
    }

    function addEventListeners(node) {
      node.addEventListener('load', resourceLoadedListener);
      node.addEventListener('error', resourceError);
    }

    function removeEventListeners(node) {
      node.removeEventListener('load', resourceLoadedListener);
      node.removeEventListener('error', resourceError);
    }

    function loadScript(scriptSrc) {
      var scriptNode = document.createElement('script');
      scriptNode.src = scriptSrc;
      addEventListeners(scriptNode);

      document.head.appendChild(scriptNode);
    }

    function loadStyle(styleSrc) {
      var styleNode = document.createElement('link');
      styleNode.href = styleSrc;
      styleNode.rel = 'stylesheet';
      styleNode.type = 'text/css';

      addEventListeners(styleNode);
      document.head.appendChild(styleNode);
    }

    function loadResource(resourceSrc) {
      var extension = getExtension(resourceSrc);

      var selector = extension === 'js' ?
            'script[src=' + '"' + resourceSrc + '"]' :
                                      'link[href=' + '"' + resourceSrc + '"]';
      var node = document.head.querySelector(selector);

      if (node && !resourcesLoaded[resourceSrc]) {
        addEventListeners(node);
      } else if (resourcesLoaded[resourceSrc] === true) {
        resourceLoaded(resourceSrc);
      } else {
        extension === 'js' ? loadScript(resourceSrc) : loadStyle(resourceSrc);
      }
    }

    start();
  };


  function getExtension(resourceSrc) {
    return resourceSrc.substring(resourceSrc.lastIndexOf('.') + 1);
  }

  function resourceError(e) {
    removeEventListeners(e.target);

    if (typeof self.onerror === 'function') {
      window.setTimeout(function cb_error() {
        self.onerror(e.target.src);
      }, 0);
    }
  }

})();
