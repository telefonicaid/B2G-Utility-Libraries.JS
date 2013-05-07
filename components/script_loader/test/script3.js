for (var j = 0; j < 100000; j++) {
  if (j === 99999) {
    window.data3 = 100;
  }
  else {
    delete window.data3;
  }
}
