suite('Test Seekbars', function() {

  function checkValues(progressValue, sliderValue) {
    assert.equal(progress.value, progressValue);
    assert.equal(slider.getAttribute('aria-valuenow'), sliderValue);
  }

  function click(x) {
    Pointer.press(progress, x, y);
    Pointer.release(progress, x, y);
  }

  var slider, handler, progress, halfHandlerWidth, halfProgressWidth, y;

  function doSuiteSetup(options) {
    slider = utils.seekbars.create(options);

    handler = slider.querySelector('button');
    progress = slider.querySelector('progress');

    handler.style.position = progress.style.position = 'absolute';
    progress.style.left = progress.style.top = progress.style.margin =
              handler.style.left = handler.style.top = handler.style.margin = 0;

    document.getElementById('test_section').appendChild(slider);

    utils.seekbars.bind(slider);

    halfHandlerWidth = handler.clientWidth / 2;
    halfProgressWidth = progress.clientWidth / 2;

    y = handler.getBoundingClientRect().top;
  }

  suite('Seekbar by default without aria values ', function() {
    suiteSetup(function() {
      doSuiteSetup();
    });

    test('The component was initialized correctly ', function() {
      assert.equal(handler.style.left, '0%');
      assert.equal(progress.max, 1);
      checkValues(0, 0);
    });

    test('Click on the middle from the value 0 ', function(done) {
      // Click on the middle of the progress bar
      slider.onchange = function() {
        slider.onchange = null;
        checkValues(0.5, 0.5);
        done();
      };

      click(handler.getBoundingClientRect().left + halfHandlerWidth +
                                                             halfProgressWidth);
    });

    test('Drag from 50% to 100% stopping in 75% ', function(done) {
      // Sliding the handler at the end of the progress bar
      var x1 = handler.getBoundingClientRect().left + halfHandlerWidth;
      var x2 = x1 + halfProgressWidth / 2;
      var x3 = x2 + halfProgressWidth / 2;

      Pointer.press(handler, x1, y);

      slider.onchange = function() {
        checkValues(0.75, 0.75);

        slider.onchange = function() {
          slider.onchange = null;
          checkValues(1, 1);
          done();
        };

        Pointer.move(handler, x3, y);
        Pointer.release(handler, x3, y);
      };

      Pointer.move(handler, x2, y);
    });
  });

  suite('Seekbar between -5 and 5 with valuenow -5 ', function() {
    suiteSetup(function() {
      doSuiteSetup({
        'aria-valuemin': -5,
        'aria-valuenow': -5,
        'aria-valuemax': 5
      });
    });

    test('The component was initialized correctly ', function() {
      assert.equal(handler.style.left, '0%');
      assert.equal(progress.max, 1);
      checkValues(0, -5);
    });

    test('Click on the middle from the value -5 ', function(done) {
      slider.onchange = function() {
        slider.onchange = null;
        checkValues(0.5, 0);
        done();
      };

      click(handler.getBoundingClientRect().left + halfHandlerWidth +
                                                             halfProgressWidth);
    });

    test('Drag from 50% to 100% stopping in 75% ', function(done) {
      // Sliding the handler at the end of the progress bar
      var x1 = handler.getBoundingClientRect().left + halfHandlerWidth;
      var x2 = x1 + halfProgressWidth / 2;
      var x3 = x2 + halfProgressWidth / 2;

      Pointer.press(handler, x1, y);

      slider.onchange = function() {
        checkValues(0.75, 2.5);

        slider.onchange = function() {
          slider.onchange = null;
          checkValues(1, 5);
          done();
        };

        Pointer.move(handler, x3, y);
        Pointer.release(handler, x3, y);
      };

      Pointer.move(handler, x2, y);
    });

  });

});
