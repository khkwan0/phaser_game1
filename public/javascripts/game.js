var game = new Phaser.Game(w, h, Phaser.AUTO, 'game');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('mainmenu', mainMenuState);
game.state.add('play', playState);
game.state.add('dead', deadState);

game.state.start('boot');