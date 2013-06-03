# Firefox OS Utility Libraries

These are utility libraries for developing apps for Firefox OS. You should be also using the [Gaia Building Blocks](http://buildingfirefoxos.com/) as they provide markup and CSS for many tasks and that would guarantee consistent UX.

## Getting started

[Clone the repository](https://github.com/telefonicaid/B2G-Utility-Libraries.JS). Generally, you will find the different components inside `components` folder. Refer to which you want to add it to your project by using a `<script>` tag.

Example:

```html
<script src="components/logger/logger.js"></script>
```

Some utilities could require other inclusion mechanisms. Please check component's documentation.

## Documentation

Specific documentation can be found inside each component's directory.

## Component catalogue

### OWD

This category includes some utilities closely related to the needs of mobile WebApps in general, Firefox OS' applications in particular. They ara available through the `window.owd` object.

* app-states - allows the developer to apply different CSS rule sets based on a __global application state__.
* multi-card - card controller for multi card view based applications.
* rconsole - a console implementation to receive data via web sockets.

### Utils

This category introduces more general utilities not coupled to WebApps. They are available through the `window.utils` object.

* binary-search - performs a binary search on an already sorted array.
* configuration - loads a JSON configuration file as a JavaScript object.
* event-bus - manages subscriber / publisher event channels.
* logger - complete logging utility.
* script-loader - loads scripts and CSS asynchronously.
* seekbars - implements the [seek bar building block](http://buildingfirefoxos.com/building-blocks/seek-bars/).
* status - implements the [status building block](http://buildingfirefoxos.com/building-blocks/status/).
* templates - a minimalistic template library.
* xmlevents - provides a mechanism to attach event handlers to elements in a declarative way by using XML events.

### Other

These other utilities are more than simple utilities and they are available through their own global object.

### LiteJS

Available through `window.litejs`.

* builder - a simple and minimalistic HTML generator.

### ImageLoader

Available through `window.ImageLoader`.

* image-loader - dynamically loads images contained in an scrollable container only if they are visible.

### InfiniteScroll

Available through `window.InfiniteScroll`.

* infinite-scroll - allows a container to be populated by arbitrary long / dynamically loaded content.

### OAuth

Available through `window.OAuth`.

* oauth10 - implements OAuth 1.0 authentication protocol.

## Testing

Cloning the repository does not include the test framework. You need to update git submodules to enable testing.

```bash
git submodule update --init
```

You can now open `test_infra/index.html` in a browser, then type the name of a component to launch its tests (if available).
