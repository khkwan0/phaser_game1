var referenceW = 980;
var referenceH = 1562;

var w = winH * referenceW / referenceH;
var h = winH;

var game = new Phaser.Game(w, h, Phaser.AUTO, 'game');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('mainmenu', mainMenuState);
game.state.add('play', playState);
game.state.add('dead', deadState);

game.state.start('boot');
