document.getElementById('domfragment').addEventListener('click', function(e) {
  var docFragment = document.createDocumentFragment();
  docFragment.appendChild(document.createTextNode('The Alarm is set for '));
  var time1 = document.createElement('strong');
  time1.textContent = '7 hours';
  docFragment.appendChild(time1);
  docFragment.appendChild(document.createTextNode(' and '));
  var time2 = document.createElement('strong');
  time2.textContent = '14 minutes';
  docFragment.appendChild(time2);
  docFragment.appendChild(document.createTextNode(' from now'));

  utils.status.show(docFragment);
});

document.getElementById('text').addEventListener('click', function(e) {
  utils.status.show('Hello world!');
});
