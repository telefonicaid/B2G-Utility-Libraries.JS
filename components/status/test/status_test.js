suite('Test Status ', function() {
  var status, content;

  suiteSetup(function() {
    utils.status.init();
    utils.status.setDuration(1000); // 1sec displayed
    status = document.querySelector('[role="status"]');
    content = status.querySelector('p');
  });

  test('The component has been initialized correctly ', function() {
    assert.equal(document.querySelectorAll('[role="status"]').length, 1);
    assert.isTrue(status.classList.contains('hidden'));
    assert.equal(content.textContent, '');
  });

  test('The component shows text and DOM fragments correctly ', function(done) {
    window.addEventListener('status-showed', function end() {
      window.removeEventListener('status-showed', end);

      assert.equal(content.textContent, 'water');
      assert.isFalse(status.classList.contains('hidden'));
      assert.isTrue(status.classList.contains('onviewport'));

      utils.status.show('wine');
      assert.equal(content.textContent, 'wine');
      assert.isFalse(status.classList.contains('hidden'));
      assert.isTrue(status.classList.contains('onviewport'));

      var docFragment = document.createDocumentFragment();
      var banana = document.createTextNode('banana');
      docFragment.appendChild(banana);

      utils.status.show(docFragment);
      assert.equal(content.textContent, 'banana');
      assert.isFalse(status.classList.contains('hidden'));
      assert.isTrue(status.classList.contains('onviewport'));

      var kiwi = document.createTextNode('kiwi');
      docFragment.appendChild(kiwi);
      utils.status.show(docFragment);
      assert.equal(content.textContent, 'kiwi');
      assert.isFalse(status.classList.contains('hidden'));
      assert.isTrue(status.classList.contains('onviewport'));

      // It doesn't fail with unsupported parameters
      utils.status.show({});
      assert.equal(content.textContent, '');

      done();
    });

    utils.status.show('water');
  });

  test('The component is hidden correctly ', function(done) {
    utils.status.hide();

    window.addEventListener('status-hidden', function end() {
      window.removeEventListener('status-hidden', end);
      assert.isTrue(status.classList.contains('hidden'));
      assert.isFalse(status.classList.contains('onviewport'));

      done();
    });
  });

  test('The component has been destroyed correctly ', function() {
    var len = document.querySelectorAll('[role="status"]').length;
    utils.status.destroy();
    assert.equal(document.querySelectorAll('[role="status"]').length, len - 1);
  });
});
