suite('Test Script Loader', function() {
  mocha.setup({globals: ['j', 'data1', 'data2', 'data3', 'data4']});

  test('Script Loader > Array of async JS files', function(done) {
    var loader = new utils.script.Loader(['script1.js', 'script2.js']);

    var script1Loaded = false;
    var script2Loaded = false;
    var scriptsLoaded = false;

    // Invoked when all the scripts are loaded
    loader.onscriptsloaded = function() {
      assert.equal(window.data1, 'Data 1');
      assert.equal(window.data2, 'Data 2');
      scriptsLoaded = true;
    };

    loader.onstylesloaded = function() {
      assert.fail('Styles loaded has been called incorrectly!!');
    };

    // Invoked once all resources are loaded
    loader.onresourceloaded = function(resourceSrc) {
      if (resourceSrc === 'script1.js') {
        script1Loaded = true;
      }

      if (resourceSrc === 'script2.js') {
        script2Loaded = true;
      }
    };

    // Invoke when the loading process finishes successfully
    loader.onfinish = function() {
      assert.isTrue(script1Loaded);
      assert.isTrue(script2Loaded);
      assert.isTrue(scriptsLoaded);
      done();
    };
  });

  test('Script Loader > Array of async JS files + CSS files', function(done) {
    var loader = new utils.script.Loader(['script1.js', 'script2.js', 'style1.css']);

    var stylesLoaded = false;
    var scriptsLoaded = false;
    loader.onstylesloaded = function() {
      stylesLoaded = true;
      var numSheets = document.styleSheets.length;
      assert.isTrue(numSheets > 1);
      var cssRule = document.styleSheets[numSheets - 1].cssRules[0];
      assert.equal(cssRule.selectorText, 'html');
      assert.equal(cssRule.style.getPropertyValue('margin'), '20px');
      assert.equal(cssRule.style.getPropertyValue('padding'), '10px');
    };

    loader.onscriptsloaded = function() {
      scriptsLoaded = true;
    };

    loader.onfinish = function() {
      assert.isTrue(scriptsLoaded);
      assert.isTrue(stylesLoaded);

      done();
    };
  });

  test('Script Loader > List of JS files (sequential)', function(done) {
    var loader = new utils.script.Loader('script3.js', 'script4.js');

    var script3Loaded = false;
    var script4Loaded = false;
    loader.onresourceloaded = function(resourceSrc) {
      if (resourceSrc === 'script3.js') {
        script3Loaded = true;
      }

      if (resourceSrc === 'script4.js') {
        script4Loaded = true;
      }
    };

    loader.onfinish = function() {
      assert.equal(window.data4, 300);

      assert.isTrue(script3Loaded);
      assert.isTrue(script4Loaded);

      done();
    };
  });
});
