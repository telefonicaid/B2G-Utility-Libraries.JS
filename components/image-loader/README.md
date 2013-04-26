Image-Loader
============

This library calculates the set of images that are on the viewport for a scrolling area. Imagine a scrollable container that defines a vertical layout of items with image. Why does browser load all images? Better just images on viewport. It is very useful in Firefox-OS Contacts App.

- No dependencies

## Usage
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
