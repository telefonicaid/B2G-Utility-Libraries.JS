Navigation
============

This library eases the implementation of complex navigations amongst pages in sigle page applications.

- No dependencies

## Usage
Add the CSS stylesheet and the JavaScript library to your HTML file:
``` html
<link rel="stylesheet" href="css/navigation.css">
<script type="text/javascript" src="js/navigation.js"></script>
```
Add the data-position and data-transition attributes to your views:
``` html
<section id="home" data-position="current">
  ...
</section>
<section data-position="back" data-transition="fade">
  ...
</section>
<section data-position="bottom" data-transition="push">
  ...
</section>
<section data-position="bottom" data-transition="slide">
  ...
</section>
<section data-position="right" data-transition="push">
  ...
</section>
<section data-position="right" data-transition="slide">
  ...
</section>
```
Initialize the library (initializing the library allows us to set the current view):
``` js
/**
 * Initializes the navigation library.
 *  @param {String} Current view CSS selector. If not set, the default value is: [data-position="current"] 
 *  @param {Number} zIndex Initial z-index. If not set, the default value is: 0.
 */
utils.navigation.init();
```
Navigate to any view:
``` js
/**
 * Navigates to the selected view.
 *  @param {String} next view CSS selector
 */
utils.navigation.go('#css-selector');
```
Go the the previous view:
``` js
/**
 * Undoes the last navigation.
 *  @param {Function} Callback to call once the transition ends.
 */
utils.navigation.back(function callback() {
  ...
});
```
Undo any previous transition and go to the initial view:
``` js
/**
 * Undoes all previous navigations and goes back to the initial view.
 */
utils.navigation.home();
```
