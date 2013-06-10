var Pointer = (function() {

   function sendTouchEvent(type, node, x, y) {
      if (!document.createTouch) {
         return;
      }

      var touch = document.createTouch(window, node, 1, x, y, x, y);
      var touchList = document.createTouchList(touch);

      var evt = document.createEvent('TouchEvent');
      evt.initTouchEvent(type, true, true, window,
        0, false, false, false, false,
        touchList, touchList, touchList);
      node.dispatchEvent(evt);
   }

   function sendMouseEvent(type, node, x, y) {
      var evt = document.createEvent('MouseEvent');

      evt.initMouseEvent(type, true, true, window, 0, x, y, x, y,
        false, false, false, false, 0, null);
      node.dispatchEvent(evt);
   }

   return {
      press: function start(node, x, y) {
        sendMouseEvent('mousedown', node, x, y);
        sendTouchEvent('touchstart', node, x, y);
      },

      move: function move(node, x, y) {
        sendMouseEvent('mousemove', node, x, y);
        sendTouchEvent('touchmove', node, x, y);
      },

      release: function move(node, x, y) {
        sendMouseEvent('mouseup', node, x, y);
        sendTouchEvent('touchend', node, x, y);
      }
   }
})();
