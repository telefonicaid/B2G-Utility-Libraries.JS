Navigation
============

This library eases the implementation of complex navigations amongst pages in sigle page applications.

- No dependencies

## Usage
Add the styleshit and the library to your HTML file:
``` html
<link rel="stylesheet" href="css/navigation.css">
<script type="text/javascript" src="js/navigation.js"></script>

``` js

/*
 * The first parameter is the selector of the scrollable container
 * The second parameter defines the selector of items
 */
var imgLoader = new ImageLoader('#mainContent', ".block-item");
```

``` css
#mainContent {
  overflow-x: hidden;
  overflow-y: auto;
  height: calc(100% - 6.9rem);
  position: relative;
}

li.block-item {
  // bla bla
}

```
