'use strict';

var utils = this.utils || {};

utils.navigation = (function() {

  var isWebkit = 'webkitRequestAnimationFrame' in window;

  /**
   *  Each transition entry includes a 'forwards' property including the
   *    classes which will be added to the 'current' and 'next' view when the
   *    transition goes forwards, as well as a 'backwards' property including the
   *    classes which will be added to the 'current' and 'next' view when the
   *    transition goes backwards.
   */
  var transitions = {
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

  /** Number of running transition. */
  var runningTransitions = 0;

  /**
   * Calls the passed callback when the transitions end.
   *  @param {HTMLElement} The view being animated.
   *  @param {Function} callback The callback to call.
   */
  var waitForTransition = function ng_callWhenTransitionEnds(
    view, callback) {
    if (callback) {
      ++runningTransitions;
      view.addEventListener(isWebkit ? 'webkitTransitionEnd' : 'transitionend',
        function ng_transitionEnded(ev) {
          view.removeEventListener(isWebkit ? 'webkitTransitionEnd' :
                                   'transitionend', ng_transitionEnded);
          --runningTransitions;
          if (!runningTransitions) {
            setTimeout(callback, 0);
          }
        }
      );
    }
  };

  /**
   * Initializes the navigation library.
   *  @param {String} Current view CSS selector
   *  @param {Number} zIndex Initial z-index
   */
  var init = function ng_init(currentViewCSSSelector, zIndex) {
    _currentView = currentViewCSSSelector ? document.querySelector(
      currentViewCSSSelector) : document.querySelector(
      '[data-position="current"]');
    stack = [];
    stack.push({view: _currentView, transition: '', zIndex: zIndex || 0});
  };

  /**
   * Navigates to the selected view.
   *  @param {String} next view CSS selector
   */
  var go = function ng_go(nextViewCSSSelector, callback) {
    var nextView = document.querySelector(nextViewCSSSelector);
    if (_currentView === nextView) {
      return;
    }

    // Remove items that match nextView from the stack to prevent duplicates.
    stack = stack.filter(function(item) {
      return item.view !== nextView;
    });

    var current = _currentView, next = nextView;

    var dataPosition = next.getAttribute('data-position');
    var transition = next.getAttribute('data-transition') + '-from-' +
        dataPosition;

    var forwardsClasses = transitions[transition].forwards;
    var backwardsClasses = transitions[transition].backwards;

    // Add forwards class to current view.
    if (forwardsClasses.current) {
      current.classList.add(forwardsClasses.current);
      var onCurrentForwards = function ng_onCurrentForwards() {
        current.removeEventListener(isWebkit ? 'webkitTransitionEnd' :
                                    'transitionend', ng_onCurrentForwards);
        switch (dataPosition) {
          case 'bottom':
            current.setAttribute('data-position', 'up');
            break;
          case 'right':
            current.setAttribute('data-position', 'left');
            break;
        }
        current.classList.remove(forwardsClasses.current);
      };
      current.addEventListener(isWebkit ? 'webkitTransitionEnd' : 'transitionend',
                               onCurrentForwards);
      waitForTransition(current, callback);
    }

    // Add forwards class to next view.
    if (forwardsClasses.next) {
      next.classList.add(forwardsClasses.next);
      var onNextForwards = function ng_onNextForwards() {
        next.removeEventListener(isWebkit ? 'webkitTransitionEnd' :
                                    'transitionend', ng_onNextForwards);
        next.setAttribute('data-position', 'current');
        next.classList.remove(forwardsClasses.next);
      };
      next.addEventListener(isWebkit ? 'webkitTransitionEnd' : 'transitionend',
                               onNextForwards);
      waitForTransition(next, callback);
    }

    var zIndex = stack[stack.length - 1].zIndex + 1;
    stack.push({ view: nextView, transition: transition, zIndex: zIndex});
    next.style.zIndex = zIndex;
    _currentView = nextView;
  };

  /**
   * Undoes the last navigation.
   *  @param {Function} Callback to call once the transition ends.
   */
  var back = function ng_back(callback) {
    if (stack.length < 2) {
      return;
    }

    var currentView = stack.pop();
    var current = currentView.view;
    var currentClassList = current.classList;

    var nextView = stack[stack.length - 1];
    var transition = currentView.transition;
    
    var forwardsClasses = transitions[transition].forwards;
    var backwardsClasses = transitions[transition].backwards;

    // Add backwards class to current view.
    if (backwardsClasses.current) {
      currentClassList.add(backwardsClasses.current);
      waitForTransition(current, callback);
      var onCurrentBackwards = function ng_onCurrentBackwards() {
        current.removeEventListener(isWebkit ? 'webkitTransitionEnd' :
                                    'transitionend', ng_onCurrentBackwards);
        if (transition.indexOf('right') !== -1) {
          current.setAttribute('data-position', 'right'); 
        } else if (transition.indexOf('bottom') !== -1) {
          current.setAttribute('data-position', 'bottom'); 
        } else if (transition.indexOf('back') !== -1) {
          current.setAttribute('data-position', 'back'); 
        }
        currentClassList.remove(backwardsClasses.current);
        current.style.zIndex = null;
      };
      current.addEventListener(isWebkit ? 'webkitTransitionEnd' : 'transitionend',
                               onCurrentBackwards);
    } else {
      current.style.zIndex = null;
    }

    var next = nextView.view;
    var nextClassList = next.classList;

    next.style.zIndex = nextView.zIndex;

    // Add backwards class to next view.
    if (backwardsClasses.next) {
      nextClassList.add(backwardsClasses.next);
      waitForTransition(next, callback);
      var onNextBackwards = function ng_onNextBackwards() {
        next.removeEventListener(isWebkit ? 'webkitTransitionEnd' :
                                 'transitionend', ng_onNextBackwards);
        next.setAttribute('data-position', 'current'); 
        nextClassList.remove(backwardsClasses.next);
      };
      next.addEventListener(isWebkit ? 'webkitTransitionEnd' : 'transitionend',
                            onNextBackwards);
    }

    _currentView = nextView.view;
  };

  /**
   * Undoes all previous navigations and goes back to the initial view.
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
    return _currentView;
  };

  return {
    init: init,
    go: go,
    back: back,
    home: home,
    getCurrentView: getCurrentView
  };
})();
