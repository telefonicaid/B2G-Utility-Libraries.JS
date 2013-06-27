function clickHandler(evt) {
  alert(evt.target.textContent);
}

// Fruits

var actionMenu = utils.ActionMenu;

var fruitsElement = actionMenu.create({
  id: 'fruits',
  title: 'Fruits',
  actions: [
    { id: 'oranges', title: 'Oranges' },
    { id: 'grapes', title: 'Grapes' },
    { id: 'strawberries', title: 'Strawberries' },
    { id: 'bananas', title: 'Bananas' },
    { id: 'cancel', title: 'Cancel' }
  ]
});

document.body.appendChild(fruitsElement);

var fruitsAction = actionMenu.bind(fruitsElement);

fruitsAction.onclick = clickHandler;

document.getElementById('fruitsButton').onclick = function() {
  fruitsAction.show();
};

// Soccer players

var soccerElement = actionMenu.create({
  id: 'soccer',
  title: 'Soccer Players',
  actions: [
    { id: 'ronaldo', title: 'Cristiano Ronaldo', classList: 'ball'},
    { id: 'messi', title: 'Lionel Messi', classList: 'ball' },
    { id: 'falcao', title: 'Radamel Falcao' },
    { id: 'luis', title: 'Luis Suarez' },
    { id: 'iniesta', title: 'Andrés Iniesta' },
    { id: 'cancel', title: 'Cancel' }
  ]
});

document.body.appendChild(soccerElement);

var soccerAction = actionMenu.bind(soccerElement);

document.getElementById('soccerButton').onclick = function() {
  soccerAction.show();
};

soccerAction.addEventListener('click', clickHandler);

document.addEventListener('DOMContentLoaded', function loaded() {
  document.removeEventListener('DOMContentLoaded', loaded);

  var exampleAction = actionMenu.get('templateAction');
  exampleAction.addEventListener('click', clickHandler);

  document.getElementById('templateButton').onclick = function() {
    exampleAction.show();
  }
});
