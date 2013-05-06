suite('Test Templates', function() {

  function resetLists() {
    var ols = document.querySelectorAll('#test_section > ol');
    for (var j = 0; j < ols.length; j++) {
      var ol = ols.item(j);
      var templateLis = ol.querySelectorAll('[data-template]');

      ol.innerHTML = '';
      for (var k = 0; k < templateLis.length; k++) {
        ol.appendChild(templateLis.item(k));
      }
    }
  }

  function assertAppend(container, child) {
    assert.equal(container.children[container.children.length - 1], child);
  }

  function assertPrepend(container, child) {
    assert.equal(container.firstElementChild, child);
  }

  setup(function() {
    resetLists();
  });

  test('Template > Append > Object as data model', function() {

    var data = {
      id: 'id1',
      data: 'Data 1'
    };

    var target = document.getElementById('test');

    utils.templates.append('#test', data);

    var l1 = document.getElementById('id1');
    assert.equal(l1.textContent, 'Data 1');

    // The template + the added element
    assert.equal(target.children.length, 2);
    assertAppend(target, l1);
  });

  test('Template > Append > Array as data model', function() {

    var data = [
      {
        id: 'id1',
        data: 'Data 1'
      },
      {
        id: 'id2',
        data: 'Data 2'
      }
    ];

    utils.templates.append('#test', data);

    var l1 = document.getElementById('id1');
    assert.equal(l1.textContent, 'Data 1');

    var l2 = document.getElementById('id2');
    assert.equal(l2.textContent, 'Data 2');

    var target = document.getElementById('test');

    // The template + the added elements
    assert.equal(target.children.length, 3);

    assertAppend(target, l2);
    assert.equal(l1.nextElementSibling, l2);
  });

  test('Template > Append > Dotted Structure', function() {

    var data = {
      data: {
        id: 'id4',
        data: 'Data 4'
      }
    };

    utils.templates.append('#test2', data);

    var l1 = document.getElementById('id4');
    assert.equal(l1.textContent, 'Data 4');

    var target = document.getElementById('test2');

    // The template + the added element
    assert.equal(target.children.length, 2);

    assertAppend(target, l1);
  });

  test('Template > Append > Function Data', function() {

    var data = {
      data: {
        id: 'id_function',
        dataFunction: function() {
          return {
                    data: 'Data Function'
          };
        }
      }
    };

    utils.templates.append('#test21', data);

    var l1 = document.getElementById('id_function');
    assert.equal(l1.textContent, 'Data Function');

    var target = document.getElementById('test21');

    // The template + the added element
    assert.equal(target.children.length, 2);

    assertAppend(target, l1);
  });

  test('Template > Prepend > Array as data model', function() {

    var data = [
      {
        id: 'id1',
        data: 'Data 1'
      },
      {
        id: 'id2',
        data: 'Data 2'
      }
    ];

    utils.templates.prepend('#test', data);

    var target = document.getElementById('test');

    var l2 = document.getElementById('id2');
    assert.equal(l2.parentNode.firstChild, l2);

    var l1 = document.getElementById('id1');
    assert.equal(l2.nextSibling, l1);

    // // The template + the added elements
    assert.equal(target.children.length, 3);

    assertPrepend(target, l2);
    assert.equal(l2.nextElementSibling, l1);
  });


  test('Template > Append > Condition over data > First met', function() {

    var data = {
      id: '123abcdef',
      condition: {
        displayRow0: function() {
          return true;
        }
      }
    };

    utils.templates.append('#test3', data);

    var target = document.getElementById('test3');

    var li = document.getElementById('123abcdef');
    assert.equal(li.textContent, 'Row 0');

    // Two from template + one rendered
    assert.equal(target.children.length, 3);

    assertAppend(target, li);
  });

  test('Template > Append > Condition over data > Second met', function() {

    var data = {
      id: '123abcdef',
      condition: {
        displayRow0: false,
        displayRow1: true
      }
    };

    utils.templates.append('#test3', data);

    var target = document.getElementById('test3');

    var li = document.getElementById('123abcdef');
    assert.equal(li.textContent, 'Row 1');

    // Two from template + one rendered
    assert.equal(target.children.length, 3);

    assertAppend(target, li);
  });


  test('Template > Append > Condition over data > First met. Second ignored', function() {

    var data = {
      id: '123abcdef',
      condition: {
        displayRow0: function() {
          return true;
        },
        displayRow1: function() {
          return true;
        }
      }
    };

    utils.templates.append('#test3', data);

    var target = document.getElementById('test3');

    var li = document.getElementById('123abcdef');
    assert.equal(li.textContent, 'Row 0');

    // Two from template + one rendered
    assert.equal(target.children.length, 3);

    assertAppend(target, li);
  });

  test('Template > Prepend Array > Condition over data', function() {

    var data = [
      {
        id: '123abcdef',
        condition: {
          displayRow0: function() {
            return true;
          }
        }
      },
      {
        id: 'fgh789',
        condition: {
          displayRow1: true
        }
      }
    ];

    utils.templates.prepend('#test3', data);

    var target = document.getElementById('test3');

    // Check that conditions were applied properly
    var l1 = document.getElementById('123abcdef');
    assert.equal(l1.textContent, 'Row 0');
    var l2 = document.getElementById('fgh789');
    assert.equal(l2.textContent, 'Row 1');

    // Two from template + two rendered
    assert.equal(target.children.length, 4);

    // Check that prepend was actually done
    assertPrepend(target, l2);
    assert.equal(l2.nextSibling, l1);
  });

});
