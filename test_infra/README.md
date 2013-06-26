Unit Testing
============

## Test coverage

Our test coverage is based on https://github.com/TwoApart/JSCovReporter and https://github.com/arian/CoverJS

### How to use

- Install CoverJS in your PC using nodejs package manager:

```
npm install coverjs
```

- Go to root folder of the component and instrument the library that you are testing

```
cover.js your_library.js --output instrumented
```

- Open your_library_test.html and import these stylesheets to show pretty results

```html
<link rel="stylesheet" href="../../../test_infra/vendor/jscovreporter/reporter.css">
<link rel="stylesheet" href="../../../test_infra/vendor/jscovreporter_custom/reporter.css">
```

- After chai.js script import these Javascript files

```html
<script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
<script src="../../../test_infra/vendor/underscore/underscore-min.js"></script>
<script src="../../../test_infra/vendor/backbone/backbone-min.js"></script>
<script src="../../../test_infra/vendor/jscovreporter/reporter.js"></script>
<script src="../../../test_infra/vendor/jscovreporter/JSCovReporter.js"></script>
```

- Import the instrumented file automatically generated previously after your_library_test.js

```html
<script src="../instrumented/your_library.js"></script>
```

- Add this callback to the run method of mocha that will be invoked after ending unit tests

```js
mocha.run(function () {
  new JSCovReporter({ coverObject: window.__$coverObject });
});
```

- Finally add this markup to the html before closing the body tag

```html
<div id="coverage"></div>
<div id="menu"></div>
```

## Example

```html
<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Status Tests</title>
    <link rel="stylesheet" href="../../../test_infra/vendor/mocha/mocha.css">
    <link rel="stylesheet" href="../../../test_infra/vendor/jscovreporter/reporter.css">
    <link rel="stylesheet" href="../../../test_infra/vendor/jscovreporter_custom/reporter.css">
  </head>
  <body>
    <div id="mocha"></div>
    <script src="../../../test_infra/vendor/mocha/mocha.js"></script>
    <script src="../../../test_infra/vendor/chai/chai.js"></script>

    <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
    <script src="../../../test_infra/vendor/underscore/underscore-min.js"></script>
    <script src="../../../test_infra/vendor/backbone/backbone-min.js"></script>
    <script src="../../../test_infra/vendor/jscovreporter/reporter.js"></script>
    <script src="../../../test_infra/vendor/jscovreporter/JSCovReporter.js"></script>

    <script>mocha.setup('tdd'); window.assert = window.chai.assert;</script>
    <script src="../your_library.js"></script>
    <script src="your_library_test.js"></script>
    <script src="../instrumented/your_library.js"></script>

    <script>
      mocha.run(function () {
        new JSCovReporter({ coverObject: window.__$coverObject });
      });
    </script>

    <div id="coverage"></div>
    <div id="menu"></div>
  </body>
</html>
```
