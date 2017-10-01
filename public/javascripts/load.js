var loadState = {
    preload: function () {
        game.load.image('player', 'public/images/susie.png');
        game.load.image('bullet0', 'public/images/bullet0.png');
        game.load.image('enemy0', 'public/images/ken.png');
        game.load.image('coin', 'public/images/coin.png');
        game.load.image('powerup', 'public/images/powerup.png');
        game.load.image('magnet', 'public/images/magnet.png');
        game.load.image('missile', 'public/images/missile.png');
        game.load.image('boss0', 'public/images/iain.png');
        game.load.image('bullet1', 'public/images/bullet1.png');
    },
    create: function() {
        game.state.start('mainmenu');
    }
};