'use strict';

var utils = this.utils || {};

utils.navigation = (function() {

  var isWebkit = 'webkitRequestAnimationFrame' in window;

  /**
   *  Each animation entry includes a 'forwards' property including the
   *    classes which will be added to the 'current' and 'next' view when the
   *    animation goes forwards, as well as a 'backwards' property including the
   *    classes which will be added to the 'current' and 'next' view when the
   *    animation goes backwards.
   */
  var animations = {
    'push-from-right': {
      forwards: {
        current: 'moveLeftOut',
        next: 'moveLeftIn'
      },
      backwards: {
        current: 'moveRightOut',
        next: 'moveRightIn'
      }
    },
    'slide-from-right': {
      forwards: {
        next: 'moveLeftIn'
      },
      backwards: {
        current: 'moveRightOut'
      }
    },
    'push-from-bottom': {
      forwards: {
        current: 'moveUpOut',
        next: 'moveUpIn'
      },
      backwards: {
        current: 'moveBottomOut',
        next: 'moveBottomIn'
      }
    },
    'slide-from-bottom': {
      forwards: {
        next: 'moveUpIn'
      },
      backwards: {
        current: 'moveBottomOut'
      }
    },
    'fade-from-back': {
      forwards: {
        next: 'fadeIn'
      },
      backwards: {
        current: 'fadeOut'
      }
    }
  };

  /** The current view. */
  var _currentView;

  /** The stack of views. */
  var stack = [];

  /** Number of running animations. */
  var runningAnimations = 0;

  /**
   * Calls the passed callback when the animations end.
   *  @param {HTMLElement} The view being animated.
   *  @param {Function} callback The callback to call.
   */
  var waitForAnimation = function ng_callWhenAnimationEnds(
    view, callback) {
    if (callback) {
      ++runningAnimations;
      view.addEventListener(isWebkit ? 'webkitAnimationEnd' : 'animationend',
        function ng_animationEnded(ev) {
          view.removeEventListener(isWebkit ? 'webkitAnimationEnd' :
                                   'animationend', ng_animationEnded);
          --runningAnimations;
          if (!runningAnimations) {
            setTimeout(callback, 0);
          }
        }
      );
    }
  };

  /**
   * Initializes the navigation library.
   *  @param {String} currentView CSS selector
   *  @param {Number} zIndex Initial z-index
   */
  var init = function ng_init(currentView, zIndex) {
    _currentView = currentView || '[data-position="current"]';
    stack = [];
    stack.push({view: _currentView, animation: '', zIndex: zIndex || 0});
  };

  /**
   * Navigates to the provided view.
   *  @param {String} nextView CSS selector
   */
  var go = function ng_go(nextView, callback) {
    if (_currentView === nextView) {
      return;
    }

    // Remove items that match nextView from the stack to prevent duplicates.
    stack = stack.filter(function(item) {
      return item.view !== nextView;
    });

    var current = document.querySelector(_currentView);
    
    var next = document.querySelector(nextView);

    var animation = next.getAttribute('data-transition') + '-from-' +
        next.getAttribute('data-position');

    var forwardsClasses = animations[animation].forwards;
    var backwardsClasses = animations[animation].backwards;

    // Add forwards class to current view.
    if (forwardsClasses.current) {
      current.classList.add(forwardsClasses.current);
      waitForAnimation(current, callback);
    }

    // Add forwards class to next view.
    if (forwardsClasses.next) {
      next.classList.add(forwardsClasses.next);
      waitForAnimation(next, callback);
    }

    var zIndex = stack[stack.length - 1].zIndex + 1;
    stack.push({ view: nextView, animation: animation, zIndex: zIndex});
    next.style.zIndex = zIndex;
    _currentView = nextView;
  };

  /**
   * Undoes the last navigation.
   */
  var back = function ng_back(callback) {
    if (stack.length < 2) {
      return;
    }

    var currentView = stack.pop();
    var current = document.querySelector(currentView.view);
    var currentClassList = current.classList;

    var nextView = stack[stack.length - 1];
    var animation = currentView.animation;

    var forwardsClasses = animations[animation].forwards;
    var backwardsClasses = animations[animation].backwards;

    // Add backwards class to current view.
    if (backwardsClasses.current) {
      currentClassList.add(backwardsClasses.current);
      waitForAnimation(current, callback);
      var onCurrentBackwards = function ng_onCurrentBackwards() {
        current.removeEventListener(isWebkit ? 'webkitAnimationEnd' :
                                    'animationend', ng_onCurrentBackwards);
        // Once the backwards animation completes, delete the added classes
        // to restore the elements to their initial state.
        currentClassList.remove(forwardsClasses.next);
        currentClassList.remove(backwardsClasses.current);
        current.style.zIndex = null;
      };
      current.addEventListener(isWebkit ? 'webkitAnimationEnd' : 'animationend',
                               onCurrentBackwards);
    } else {
      current.style.zIndex = null;
    }

    var next = document.querySelector(nextView.view);
    var nextClassList = next.classList;

    next.style.zIndex = nextView.zIndex;

    // Add backwards class to next view.
    if (backwardsClasses.next) {
      nextClassList.add(backwardsClasses.next);
      waitForAnimation(next, callback);
      var onNextBackwards = function ng_onNextBackwards() {
        next.removeEventListener(isWebkit ? 'webkitAnimationEnd' :
                                 'animationend', ng_onNextBackwards);
        // Once the backwards animation completes, delete the added classes
          // to restore the elements to their initial state.
        nextClassList.remove(forwardsClasses.current);
        nextClassList.remove(backwardsClasses.next);
      };
      next.addEventListener(isWebkit ? 'webkitAnimationEnd' : 'animationend',
                            onNextBackwards);
    }

    _currentView = nextView.view;
  };

  /**
   * Undoes all the navigations and gets back to the initial state.
   */
  var home = function ng_home() {
    if (stack.length < 2) {
      return;
    }

    while (stack.length > 1) {
      back();
    }
  };
  
  /**
   * Returns the current view, this is the section currently visible.
   */
  var getCurrentView = function ng_getCurrentView() {
    return document.querySelector(_currentView);
  };

  return {
    init: init,
    go: go,
    back: back,
    home: home,
    getCurrentView: getCurrentView
  };
})();
