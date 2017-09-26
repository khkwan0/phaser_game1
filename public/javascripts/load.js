var loadState = {
    preload: function () {
        game.load.image('player', 'public/images/player.png');
        game.load.image('bullet0', 'public/images/bullet0.png');
        game.load.image('enemy0', 'public/images/enemy0.png');
    },
    create: function() {
        game.state.start('mainmenu');
    }
}