suite('Test Templates', function() {
  function resetList() {
    var ol = document.getElementById('test');
    var templateLi = ol.querySelector('li:first-child');

    ol.innerHTML = '';
    ol.appendChild(templateLi);
  }

  test('Template > Append > Object as data model', function() {
    resetList();

    var data =  {
      id: 'id1',
      data: 'Data 1'
    };

    utils.templates.append('#test', data);

    var l1 = document.getElementById('id1');
    assert.equal(l1.textContent, 'Data 1');

    // The added element + the template
    assert.equal(l1.parentNode.children.length, 2);
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

    resetList();

    utils.templates.append('#test', data);

    var l1 = document.getElementById('id1');
    assert.equal(l1.textContent, 'Data 1');

    var l2 = document.getElementById('id2');
    assert.equal(l2.textContent, 'Data 2');

    // The added element + the template
    assert.equal(l2.parentNode.children.length, 3);
  });

  test('Template > Append > Dotted Structure', function() {
    var data = {
      data: {
        id: 'id4',
        data: 'Data 4'
      }
    }

    utils.templates.append('#test2', data);

    var l1 = document.getElementById('id4');
    assert.equal(l1.textContent, 'Data 4');

    // The added element + the template
    assert.equal(l1.parentNode.children.length, 2);
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

    resetList();

    utils.templates.prepend('#test', data);

    var l2 = document.getElementById('id2');
    assert.equal(l2.parentNode.firstChild, l2);

    var l1 = document.getElementById('id1');
    assert.equal(l2.nextSibling, l1);

    // The added element + the template
    assert.equal(l2.parentNode.children.length, 3);
  });
});
