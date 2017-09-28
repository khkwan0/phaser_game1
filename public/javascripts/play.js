var w = winW;
var h = winH;

// sprites
var player;
var weapon;

// sprite group
var enemies;
var prizes;

var wave;
var currentWave;

var bulletDamage;
var enemyCollisionDamage;

var playerScale = {
  x: 1,
  y: 1
};

var movementX;
var previousX;
var newDown;

var enemyBaseHP = 50

var enemyMeta = {
  level: 1,
  speed: 5,
  health: enemyBaseHP * this.level
}

var enemyScale = 4;
var enemySpeed = 5;
var enemyHealth = 50;;

var prizeNum = 0;  // prize ID counter
var coin = {
  scale: 1,
  gravity: 1024,
  initSpeed: -600
}

var powerup = {
  scale: 1,
  gravity: 1024,
  initSpeed: -600,
  powerUpIncrease: 5
}

var score = {
  coinsCollected:0,
  enemiesDestroyed: 0
}

var playerStartHP = 10;
var enemy0StartHp = 50;

var playState = {
  render: function() {
//    game.debug.bodyInfo(player, 32, 32);
  },
  create: function () {
    game.stage.setBackgroundColor(0x000);
    startX = w/2 - game.cache.getImage('player').width;
    player = game.add.sprite(startX, h - game.cache.getImage('player').height * playerScale.y - 80, 'player');
    previousX = startX;
    player.scale.setTo(playerScale.x, playerScale.y);
    game.physics.arcade.enable(player);
    player.hp = playerStartHP;

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;

    weapon = game.add.weapon(20, 'bullet0');
    weapon.bulletAngleOffset = 90;
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 3200;
    weapon.trackSprite(player, game.cache.getImage('player').width * playerScale.x - game.cache.getImage('player').width/2, -10);

    prizes = game.add.group();
    prizes.enableBody = true;
    prizes.physicsBodyType = Phaser.Physics.ARCADE;

    game.canvas.addEventListener('click', requestLock);
    game.input.addMoveCallback(move, this);

    wave = 0;
    currentWave = 1;
    game.time.events.add(Phaser.Timer.SECOND * 3, startWave, this);
    bulletDamage = 5;
    enemyCollisionDamage = 5;
    newDown = true;
  },
  update: function () {
    game.debug.text(enemies.children.length, 30, 30);
    game.debug.text(bulletDamage, 30, 45);
    if (!game.input.pointer1.isDown) {
      newDown = true;
    }
    if (player.hp > 0) {
      if (enemies.children.length > 0) {
        enemies.y += enemySpeed;
      } else {
        enemies.y = 0;
      }
      game.physics.arcade.overlap(player, enemies, playerHit, null, this);
      game.physics.arcade.overlap(weapon.bullets, enemies, enemyHit, null, this);
      game.physics.arcade.overlap(player, prizes, collectPrize, null, this);
      weapon.fire();
    }
  }
}

function requestLock() {
  game.input.mouse.requestPointerLock();
}

function startWave() {
  wave = currentWave;
  spawnEnemy();
}

function spawnEnemy() {
  console.log('spawn');
  for (i = 0; i < 5; i++) {
    var x = i * w / 5 + game.cache.getImage('enemy0').width * enemyScale / 2;
    var enemy = enemies.create(x, 0, 'enemy0');
    enemy.name = 'enemy' + i;
    enemy.scale.setTo(enemyScale, enemyScale);
    enemy.hp = enemyHealth;
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(destroyEnemy, this);
  }
}

function destroyEnemy(enemy) {
  enemies.remove(enemy, true);
  if (enemies.children.length == 0) {
    game.time.events.add(Phaser.Timer.SECOND * 2, spawnEnemy, this);
  }
}

function move(pointer, x, y, click) {
  if (game.input.mouse.locked && !click && player.hp > 0) {
    player.x += game.input.mouse.event.movementX;
  }
  if (game.input.pointer1.isDown && player.hp > 0) {
    if (newDown) {
      movementX = 0;
      newDown = false;
    } else {
      movementX = 2*(game.input.pointer1.x - previousX);
    }
    previousX = game.input.pointer1.x;
    player.x += movementX;
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
    enemySpawnPrize(enemy.x, bullet.y);
    score.enemiesDestroyed++;
    destroyEnemy(enemy);
  }
  bullet.kill();
}

function enemySpawnPrize(popX,popY) {

  var roll = game.rnd.frac();
  if (roll<0.25) {
    var roll2 = game.rnd.frac();
    if (roll2 < 0.25) {
      spawnPowerup(popX, popY);
    } else {
      spawnCoin(popX, popY);
    }
  } else {
    spawnCoin(popX, popY);
  }
}

function spawnPowerup(popX, popY) {
  var prize = prizes.create(popX + game.cache.getImage('enemy0').width/2, popY - game.cache.getImage('coin').height * coin.scale/2, 'powerup');
  prize.type = 'powerup';
  prizeNum++;
  prize.name = 'prize'+prizeNum;
  prize.scale.setTo(powerup.scale, powerup.scale);
  prize.body.velocity.setTo(0, powerup.initSpeed);
  prize.body.gravity.y = powerup.gravity;
  prize.checkWorldBounds = true;
  prize.events.onOutOfBounds.add(prizeOutOfBounds, this);
}

function spawnCoin(popX, popY) {
  var prize = prizes.create(popX + game.cache.getImage('enemy0').width/2, popY - game.cache.getImage('coin').height * coin.scale/2, 'coin');
  prize.type = 'coin';
  prizeNum++;
  prize.name = 'prize'+prizeNum;
  prize.scale.setTo(coin.scale, coin.scale);
  prize.body.velocity.setTo(0, coin.initSpeed);
  prize.body.gravity.y = coin.gravity;
  prize.checkWorldBounds = true;
  prize.events.onOutOfBounds.add(prizeOutOfBounds, this);
}

function prizeOutOfBounds(prize) {
  if (prize.y > h) {
    destroyPrize(prize);
  }
}

function destroyPrize(prize) {
  console.log('destroyt');
  prizes.remove(prize, true);
}

function playerHit(player, enemy) {
  player.hp -= enemyCollisionDamage;
  enemies.remove(enemy, true);
  if (player.hp <= 0) {
    playerDeath();
  }
}

function collectPrize(player, prize) {
  if (prize.type == 'powerup') {
    bulletDamage += powerup.powerUpIncrease;
  }
  destroyPrize(prize);
  score.coinsCollected++;
}

function playerDeath() {
  game.time.events.add(Phaser.Timer.SECOND * 4, transitionToDead, this);
}

function transitionToDead() {
  game.state.start('dead');
}
