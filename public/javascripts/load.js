var loadState = {
    preload: function () {
        game.load.image('player', 'public/images/susie.png');
        game.load.image('bullet0', 'public/images/bullet0.png');
        game.load.image('enemy0', 'public/images/ken.png');
        game.load.image('coin', 'public/images/coin.png');
        game.load.image('powerup', 'public/images/powerup.png');
        game.load.image('magnet', 'public/images/magnet.png');
    },
    create: function() {
        game.state.start('mainmenu');
    }
}
