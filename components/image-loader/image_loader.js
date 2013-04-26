/**
 *  Module: Image Loader
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telef—nica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Telefonica Digital
 *
 */

'use strict';

if (!window.ImageLoader) {

  /**
    *  The constructor of the ImageLoader Object
    *
    *  @param{String} Selector that defines the scrollable container
    *
    *  @param{Object} Selector that defines the list of items that contains
    *                 the images
    *
    */
  var ImageLoader = function ImageLoader(pContainer, pItems) {
    var container, items, itemsSelector, scrollLatency = 100, scrollTimer,
        lastViewTop = 0, itemHeight, total, imgsLoading = 0;

    var forEach = Array.prototype.forEach;

    init(pContainer, pItems);

    /**
     *  Initializer
     *
     *  @param{String} Selector that defines the scrollable container
     *
     *  @param{Object} Selector that defines the list of items that contains
     *                 the images
     *
     */
    function init(pContainer, pItems) {
      itemsSelector = pItems;
      container = document.querySelector(pContainer);

      container.addEventListener('scroll', onScroll);
      document.addEventListener('onupdate', function(evt) {
        evt.stopPropagation();
        onScroll();
      });

      load();
    }

    /**
     *  This function is invoked when we change the list of items
     *
     */
    function load() {
      window.clearTimeout(scrollTimer);
      items = container.querySelectorAll(itemsSelector);
      // All items have the same height
      itemHeight = items[0] ? items[0].offsetHeight : 1;
      total = items.length;
      // Initial check if items should appear
      window.setTimeout(update, 0);
    }

    /**
     *  This function is invoked when the scrollable container is translated
     *
     */
    function onScroll() {
      window.clearTimeout(scrollTimer);
      if (imgsLoading > 0) {
        // Stop the pending images load
        window.stop();
        imgsLoading = 0;
      }
      scrollTimer = window.setTimeout(update, scrollLatency);
    }

    /**
     *  Loads the image contained in a DOM Element.
     */
    function loadImage(item) {
      var image = item.querySelector('img[data-src]');
      if (!image) {
        return;
      }

      ++imgsLoading;
      var tmp = new Image();
      var src = tmp.src = image.dataset.src;
      tmp.onload = function onload() {
        --imgsLoading;
        image.src = src;
        if (tmp.complete) {
          item.dataset.visited = 'true';
        }
        tmp = null;
      };

      tmp.onabort = tmp.onerror = function onerror() {
        item.dataset.visited = 'false';
        tmp = null;
      }
    }

    /**
     *  Calculates the set of items that are in the current viewport
     *
     */
    function update() {
      if (total === 0) {
        return;
      }

      var viewTop = container.scrollTop;
      // Index is always inside or below viewport
      var index = Math.floor(viewTop / itemHeight);
      var containerHeight = container.offsetHeight;

      // Goes backward
      for (var i = index; i >= 0; i--) {
        var item = items[i];
        if (item) {
          if (item.offsetTop + itemHeight < viewTop) {
            break; // Over
          }

          if (item.dataset.visited !== 'true' &&
              item.offsetTop <= viewTop + containerHeight) {
            loadImage(item); // Inside
          }
        }
      }

      // Goes forward
      for (var j = index + 1; j < total; j++) {
        var item = items[j];
        if (!item) {
          // Returning because of index out of bound
          return;
        }

        if (item.offsetTop > viewTop + containerHeight) {
          return; // Below
        }

        if (item.dataset.visited !== 'true') {
          loadImage(item);
        }
      }
    } // update

    /**
     *  This function is public and it should be performed when the list of
     *  items has changed
     *
     */
    this.reload = load;
  };
}
