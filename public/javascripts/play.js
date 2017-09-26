var w = 414;
var h = 736;
var player;
var weapon;
var enemies;

var wave;
var currentWave;

var bulletDamage;
var enemyCollisionDamage;

var playerScale = {
    x: 0.5,
    y: 0.5
};

var score;

var playState = {
    create: function () {
        game.stage.setBackgroundColor(0x000);
        player = game.add.sprite(w / 2 - game.cache.getImage('player').width, h - game.cache.getImage('player').height * playerScale.y - 10, 'player');
        player.scale.setTo(playerScale.x, playerScale.y);
        game.physics.arcade.enable(player);
        player.hp = 10;

        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;

        weapon = game.add.weapon(7, 'bullet0');
        weapon.bulletAngleOffset = 90;
        weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        weapon.bulletSpeed = 1600;
        weapon.trackSprite(player, game.cache.getImage('player').width * playerScale.x - 12, -10);

        game.canvas.addEventListener('click', requestLock);
        game.input.addMoveCallback(move, this);

        spawnEnemy();
        game.time.events.loop(Phaser.Timer.SECOND * 2, spawnEnemy, this);
        wave = 0;
        currentWave = 1;
        game.time.events.add(Phaser.Timer.SECOND * 3, startWave, this);
        bulletDamage = 5;
        enemyCollisionDamage = 5;
        score = 0;
    },
    update: function () {
        game.debug.text(enemies.children.length, 20, 20);
        game.debug.text(player.hp, 20, 35);
        if (player.hp > 0) {
            if (enemies.children.length > 0) {
                enemies.y += 10;
            } else {
                enemies.y = 0;
            }
            game.physics.arcade.overlap(player, enemies, playerHit, null, this);
            game.physics.arcade.overlap(weapon.bullets, enemies, enemyHit, null, this);
            weapon.fire();
        }
    }
}

function requestLock() {
    game.input.mouse.requestPointerLock();
}

function startWave() {
    wave = currentWave;
}

function spawnEnemy() {
    if (wave && player.hp > 0) {
        for (i = 0; i < 5; i++) {
            var x = i * w / 5 + game.cache.getImage('enemy0').width / 2;
            var enemy = enemies.create(x, 0, 'enemy0');
            enemy.name = 'enemy' + i;
            enemy.hp = 20;
            enemy.checkWorldBounds = true;
            enemy.events.onOutOfBounds.add(destroySprite, this);
        }
    }
}

function destroySprite(enemy) {
    enemies.remove(enemy, true);
    enemies.y = 0;
}

function move(pointer, x, y, click) {
    if (game.input.mouse.locked && !click && player.hp > 0) {
        player.x += game.input.mouse.event.movementX;
    }
    if (player.x <= 0) {
        player.x = 0;
    }
    if (player.x >= w - game.cache.getImage('player').width * playerScale.x) {
        player.x = w - game.cache.getImage('player').width * playerScale.x;
    }
}

function update() {}

function enemyHit(bullet, enemy) {
    enemy.hp -= bulletDamage;
    if (enemy.hp <= 0) {
        enemies.remove(enemy, true);
        score ++;
    }
    bullet.kill();
}

function playerHit(player, enemy) {
    player.hp -= enemyCollisionDamage;
    enemies.remove(enemy, true);
    if (player.hp <= 0) {
        playerDeath();
    }
}

function playerDeath() {
    game.time.events.add(Phaser.Timer.SECOND * 4, transitionToDead, this);
}

function transitionToDead() {
    game.state.start('dead');
}