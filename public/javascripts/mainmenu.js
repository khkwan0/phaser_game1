var mainMenuState = {
    preload: function() {
        game.load.image('play_button', '/public/images/play_button.png');
    },
    create: function () {
        game.stage.setBackgroundColor(0xfbf6d5);
        button = game.add.button(game.world.centerX - 95, 400, 'play_button', this.actionOnClick, this, 2, 1, 0);
        game.input.mouse.releasePointerLock();
    },
    actionOnClick: function() {
        game.state.start('play');
        game.input.mouse.requestPointerLock();
    }

}