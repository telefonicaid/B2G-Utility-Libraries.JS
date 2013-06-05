var out1 = document.querySelector('#out1');
document.querySelector('#slider1').onchange = function(evt) {
  out1.textContent = evt.target.getAttribute('aria-valuenow');
}

var out2 = document.querySelector('#out2');
document.querySelector('#slider2').onchange = function(evt) {
  out2.textContent = evt.target.getAttribute('aria-valuenow');
}

var out3 = document.querySelector('#out3');
document.querySelector('#slider3').onchange = function(evt) {
  out3.textContent = evt.target.getAttribute('aria-valuenow');
}

setTimeout(function() {
  var dynamic = document.getElementById('dynamic');
  dynamic.innerHTML =
              '<h2 class="bb-docs">[0, 1000]: <span id="out4">100</span></h2>';

  var slider = utils.seekbars.create({
    'aria-valuemin': 0,
    'aria-valuenow': 100,
    'aria-valuemax': 1000
  });

  dynamic.appendChild(slider);

  utils.seekbars.bind(slider);

  var out4 = document.querySelector('#out4');
  slider.onchange = function(evt) {
    out4.textContent = evt.target.getAttribute('aria-valuenow');
  };
}, 5000);
