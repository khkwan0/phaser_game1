var mainMenuState = {
    preload: function() {
        game.load.image('play_button', '/public/images/play_button.png');
    },
    create: function () {
        game.stage.setBackgroundColor(0xfbf6d5);
        text = game.add.text(game.world.centerX, 100,"Pick up falling coins for points");
        text.font = 'Arial Black';
        text.anchor.set(0.5);
        text.fontSize = 32;
        text.align = 'center';

        text = game.add.text(game.world.centerX, 140,"Magnets for attracting coins, the more magnets the better");
        text.font = 'Arial Black';
        text.anchor.set(0.5);
        text.align = 'center';

        text = game.add.text(game.world.centerX, 180,"Clover leafs for more shot power");
        text.font = 'Arial Black';
        text.anchor.set(0.5);
        text.align = 'center';

        button = game.add.button(game.world.centerX - 95, game.world.centerY, 'play_button', this.actionOnClick, this, 2, 1, 0);
        game.input.mouse.releasePointerLock();
    },
    actionOnClick: function() {
        game.state.start('play');
        game.input.mouse.requestPointerLock();
    }

}
