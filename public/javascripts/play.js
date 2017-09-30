var w = winW;
var h = winH;

// sprites
var player;
var weapon;

// sprite group
var enemies;
var prizes;
var bosses;
var healthBars;

var wavyPath = false;
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

var enemyBaseHP = 30;

//testing\...
//var enemyBaseHP = 5;

var enemyScale = 1;
var enemyHPScale = 1;
var enemySpeed = 5;
var enemyHealth = enemyBaseHP * enemyHPScale;

var prizeNum = 0; // prize ID counter
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

var magnet = {
  scale: 1,
  gravity: 1024,
  initSpeed: -600
}
var maxMagnets = 21;
var magnetsCollected = 0;

var missile = {
  scale: 1,
  gravity: 1024,
  initSpeed: -600
}

var score = {
  coinsCollected: 0,
  enemiesDestroyed: 0,
  magnetBonus: 0
}

var playerStartHP = 10;
var enemy0StartHp = 50;

var indestructable = false;
var autoFire = true;

var boss = false;
var bossBaseHP = 5000;

var bgmusic;
var graphics;
var waveText;
var scoreText;

var playState = {
  preload: function () {
    //    game.load.audio('bgmusic', ['public/music/yinglee.mp3','public/music/yinglee.ogg']);
  },
  render: function () {
    //    game.debug.bodyInfo(player, 32, 32);
    //    game.debug.soundInfo(bgmusic, 0,0);
  },
  create: function () {
    score.coinsCollected = 0;
    score.enemiesDestroyed = 0;
    score.magnetBonus = 0;
    /*
        bgmusic = game.add.audio('bgmusic');
        bgmusic.play();
      */

    game.stage.setBackgroundColor(0x000);


    startX = w / 2 - game.cache.getImage('player').width;
    player = game.add.sprite(startX, h - game.cache.getImage('player').height * playerScale.y - 80, 'player');
    player.magnetized = false;
    previousX = startX;
    player.scale.setTo(playerScale.x, playerScale.y);
    game.physics.arcade.enable(player);
    player.hp = playerStartHP;

    missile.damage = 5;
    missile.damageIncrement = 5;
    missile.maxMissiles = 20;
    missile.numMissiles = 1;

    magnetsCollected = 0;

    bosses = game.add.group();
    bosses.enableBody = true;
    bosses.physicsBodyType = Phaser.Physics.ARCADE;

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;

    healthBars = game.add.group();

    weapon = game.add.weapon(20, 'bullet0');
    weapon.bulletAngleOffset = 90;
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 3200;
    weapon.trackSprite(player, game.cache.getImage('player').width * playerScale.x - game.cache.getImage('player').width / 2, -10);

    initMissiles();

    prizes = game.add.group();
    prizes.enableBody = true;
    prizes.physicsBodyType = Phaser.Physics.ARCADE;

    game.canvas.addEventListener('click', requestLock);
    game.input.addMoveCallback(move, this);

    wave = 1;
    currentWave = 1;
    game.time.events.add(Phaser.Timer.SECOND * 3, startWave, this);
    bulletDamage = 5;
    enemyCollisionDamage = 5;
    newDown = true;

    godKey = game.input.keyboard.addKey(Phaser.Keyboard.G);
    godKey.onDown.add(function () {
      indestructable = indestructable ? false : true;
    }, this);
    weaponKey = game.input.keyboard.addKey(Phaser.Keyboard.X);
    weaponKey.onDown.add(function () {
      autoFire = autoFire ? false : true;
    }, this);
    //    game.input.onDown.add(function() { bgmusic.mute = false;bgmusic.volume=0.2 }, this);

    var style = { font: "bold 16px Arial", fill: "#fff", boundsAlignH: "right", boundsAlignV: "middle" };
    waveText = game.add.text(0,0, "WAVE: 1\nMagnets: 0/"+maxMagnets+"\nMissiles: 0/"+ missile.maxMissiles+"\nCoins: 0",style);
    waveText.setTextBounds(0, 0.05*h,0.9*w, 0.1*h);
    
    style = { font: "bold 48px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "middle" };    
    scoreText = game.add.text(0,0, "Score: 0", style);
    scoreText.setTextBounds(0.01 * w, 0.05*h,0.9*w, 0.1*h);
  },
  update: function () {
    gameTime = game.time.totalElapsedSeconds();
    
    game.debug.text('level: '+wave, 60, 45);
    /*
    game.debug.text('magnets: ' + magnetsCollected + '/' + (maxMagnets - 1), 30, 60);
    game.debug.text('bonusMagnets: ' + score.magnetBonus, 30, 75);
    game.debug.text('missile: ' + missile.numMissiles + '/' + missile.maxMissiles, 30, 90);
    game.debug.text('missile damage: ' + missile.damage, 30, 105);
    game.debug.text('indestructable: ' + indestructable, 30, 120);
    game.debug.text('firing: ' + autoFire, 30, 135);
    */

    waveText.text = "WAVE: " + (currentWave - 1) + "\nMagnets: " + magnetsCollected + "/" + (maxMagnets - 1) + "\nMissiles: " + missile.numMissiles + "/" + missile.maxMissiles +"\nCoins: " + score.coinsCollected;
    scoreText.text = "Score: " + (score.coinsCollected + score.enemiesDestroyed + score.magnetBonus);

    if (!game.input.pointer1.isDown) {
      newDown = true;
    }
    if (player.hp > 0) {
      if (bosses.children.length > 0) {
        if (bosses.y < game.cache.getImage('boss0').height / 2) { // arriving
          bosses.children[0].indestructable = true;
          bosses.y += 5;
          t = 0;
        } else { // arrived, start attack
          bosses.children[0].indestructable = false;
          bosses.x = Math.sin(t) * (w / 2);
          t += 1 / 60;
        }
      }
      if (enemies.children.length > 0) { // regular wave mechanics
        if (wavyPath) {
          enemies.x += Math.sin(gameTime * 10) * 5;
        }
        enemies.y += enemySpeed;
      } else {
        enemies.y = 0;
        enemies.x = 0;
      }
      game.physics.arcade.overlap(player, enemies, playerHit, null, this);
      game.physics.arcade.overlap(weapon.bullets, enemies, enemyHit, null, this);
      game.physics.arcade.overlap(missiles.bullets, enemies, enemyHitMissile, null, this);
      game.physics.arcade.overlap(weapon.bullets, bosses, enemyBossHit, null, this);
      game.physics.arcade.overlap(missiles.bullets, bosses, enemyBossHitMissile, null, this);
      game.physics.arcade.overlap(player, prizes, collectPrize, null, this);
      if (autoFire) {
        weapon.fire();
      }
      if (missile.numMissiles > 0 && (enemies.children.length > 0 || bosses.children.length > 0)) {
        missiles.fire();
      }
      if (enemies.children.length == 0 || bosses.children.length == 0) {
        missiles.bullets.children.forEach(function (aMissile) {
          aMissile.currentTarget = undefined;
        })
      }
      if (missiles.bullets.children.length > 0 && (enemies.children.length > 0 || bosses.children.length > 0)) {
        missiles.bullets.children.forEach(function (aMissile) {
          if (typeof aMissile.currentTarget == 'undefined') {
            if (enemies.children.length > 0) {
              aMissile.currentTarget = enemies.children[game.rnd.integerInRange(0, enemies.children.length - 1)];
            }
            if (bosses.children.length > 0) {
              aMissile.currentTarget = bosses.children[game.rnd.integerInRange(0, bosses.children.length - 1)];
            }
            aMissile.scale.setTo(0.5, 0.5);
          }
        });
        missiles.bullets.children.forEach(function (aMissile) {
          if (typeof aMissile.currentTarget !== 'undefined' &&
            typeof aMissile.body !== 'undefined' &&
            typeof aMissile.currentTarget.body !== 'undefined' &&
            aMissile.body.x > aMissile.currentTarget.x) {
            if (Math.abs(aMissile.body.x - aMissile.currentTarget.x) > 20) {
              aMissile.body.velocity.setTo(-500, aMissile.body.velocity.y);
            } else {
              aMissile.body.velocity.setTo(100, aMissile.body.velocity.y);
            }
          } else {
            if (Math.abs(aMissile.body.x - aMissile.currentTarget.x) > 20) {
              aMissile.body.velocity.setTo(500, aMissile.body.velocity.y);
            } else {
              aMissile.body.velocity.setTo(100, aMissile.body.velocity.y);
            }
          }
        });
      }
    }
    if (magnetsCollected) {
      if (prizes.children.length > 0) {
        for (i = 0; i < prizes.children.length; i++) {
          if (prizes.children[i].x > player.x) {
            prizes.children[i].body.velocity.setTo(-1 * (prizes.children[i].x - player.x) / (maxMagnets - magnetsCollected), prizes.children[i].body.velocity.y);
          } else {
            prizes.children[i].body.velocity.setTo(1 * (player.x - prizes.children[i].x) / (maxMagnets - magnetsCollected), prizes.children[i].body.velocity.y);
          }
        }
      }
    }
  }
}

function requestLock() {
  game.input.mouse.requestPointerLock();
}

function startWave() {
  if (!boss) {
    spawnEnemy();
  }
  enemySpeed++;
}

function spawnEnemy() {
  graphics = game.add.graphics();
  if (currentWave % 11 == 0) {
    boss = true;
    spawnBoss();
  }
  if (!boss) {
    wavyPath = false;
    for (i = 0; i < 5; i++) {
      var x = i * w / 5 + game.cache.getImage('enemy0').width * enemyScale;
      var enemy = enemies.create(x, 0, 'enemy0');
      enemy.anchor.setTo(0.5, 0.5);
      enemy.name = 'enemy' + i;
      enemy.indestructable = false;
      enemy.scale.setTo(enemyScale, enemyScale);
      enemy.health = enemyHealth * wave;
      enemy.maxHealth = enemy.health;
      enemy.checkWorldBounds = true;
      enemy.events.onOutOfBounds.add(destroyEnemy, this);

      graphics.beginFill(0xff00ff);
      graphics.drawRoundedRect(x - game.cache.getImage('enemy0').width * enemyScale/2, game.cache.getImage('enemy0').height/2 + 5, game.cache.getImage('enemy0').width * enemyScale, 20, 10);
      graphics.endFill();
    }

    enemies.add(graphics);    
    graphics.body = null;
    graphics.outOfBoundsKill = true;
    if (game.rnd.frac() < 0.5) {
      wavyPath = true;
    }
    currentWave++;
  }
}

function spawnBoss() {
  graphics = game.add.graphics();
  var _boss = bosses.create(game.world.centerX, 0, 'boss0');
  _boss.anchor.setTo(0.5, 0.5);
  _boss.name = 'bossx';
  _boss.health = bossBaseHP * wave;
  _boss.maxHealth = _boss.health;
  for (i=0; i<bosses.children.length; i++) {
    graphics.beginFill(0xff00ff);
    graphics.drawRoundedRect(bosses.children[i].x - game.cache.getImage('boss0').width * enemyScale/2, bosses.children[i].y + game.cache.getImage('boss0').height/2 + 5, game.cache.getImage('boss0').width * enemyScale, 20, 10);
    graphics.endFill();
  }
  graphics.body = null;
  bosses.add(graphics);
}

function destroyBossEnemy(_boss) {
  bosses.remove(_boss);
  if (bosses.children.length - 1 == 0) {
    boss = false;
    graphics.destroy();
    game.time.events.add(Phaser.Timer.SECOND * 3, startWave, this);
    currentWave++;
  }
  wave++;
}

function destroyEnemy(enemy) {
  enemies.remove(enemy, true);
  if (enemies.children.length - 1 == 0 && !boss) {  // -1 because the only thing lefts are the health bars
    graphics.destroy();
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
      movementX = 2 * (game.input.pointer1.x - previousX);
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

function enemyHitMissile(bullet, _enemy) {
  if (!_enemy.indestructable) {
    _enemy.health -= missile.damage;
    if (_enemy.health < 0) {
      _enemy.health = 0;
    }
    graphics.clear();
    for (i=0; i<enemies.children.length; i++) {
      percentage = enemies.children[i].health/enemies.children[i].maxHealth;
      graphics.beginFill(0xff00ff);
      graphics.drawRoundedRect(enemies.children[i].x - game.cache.getImage('enemy0').width/2, enemies.children[i].y + game.cache.getImage('enemy0').height/2 + 5, game.cache.getImage('enemy0').width * enemyScale * percentage, 20, 10);
      graphics.endFill();
    }
    graphics.body = null;
  }
  if (_enemy.health <= 0) {
    enemySpawnPrize(_enemy.x, bullet.y, 1);
    score.enemiesDestroyed++;
    destroyEnemy(_enemy);
  }
  bullet.kill();
}

function enemyBossHitMissile(bullet, _boss) {
  if (!_boss.indestructable) {
    _boss.health -= missile.damage;
    if (_boss.health < 0) {
      _boss.health = 0;
    }
    graphics.clear();
    for (i=0; i<bosses.children.length; i++) {
      percentage = bosses.children[i].health/bosses.children[i].maxHealth;
      graphics.beginFill(0xff00ff);
      graphics.drawRoundedRect(bosses.children[i].x - game.cache.getImage('boss0').width/2, bosses.children[i].y + game.cache.getImage('boss0').height/2 + 5, game.cache.getImage('boss0').width * percentage, 20, 10);
      graphics.endFill();
    }
    graphics.body = null;
  }
  if (_boss.health <= 0) {
    enemySpawnPrize(_boss.x, bullet.y, 20);
    score.enemiesDestroyed++;
    destroyBossEnemy(_boss);
  }
  bullet.kill();
}

function enemyBossHit(bullet, _boss) {
  if (!_boss.indestructable) {
    _boss.health -= bulletDamage;
    console.log(_boss.health);
    if (_boss.health < 0) {
      _boss.health = 0;
    }
    graphics.clear();
    for (i=0; i<bosses.children.length; i++) {
      percentage = bosses.children[i].health/bosses.children[i].maxHealth;
      graphics.beginFill(0xff00ff);
      graphics.drawRoundedRect(bosses.children[i].x - game.cache.getImage('boss0').width/2, bosses.children[i].y + game.cache.getImage('boss0').height/2 + 5, game.cache.getImage('boss0').width * percentage, 20, 10);
      graphics.endFill();
    }
    graphics.body = null;
  }
  if (_boss.health <= 0) {
    enemySpawnPrize(_boss.x, bullet.y, 20);
    score.enemiesDestroyed++;
    destroyBossEnemy(_boss);
  }
  bullet.kill();
}

function enemyHit(bullet, _enemy) {
  //console.log(_enemy);
  if (!_enemy.indestructable) {
    _enemy.health -= bulletDamage;
    if (_enemy.health < 0) {
      _enemy.health = 0;
    }
    graphics.clear();
    for (i=0; i<enemies.children.length; i++) {
      percentage = enemies.children[i].health/enemies.children[i].maxHealth;
      graphics.beginFill(0xff00ff);
      graphics.drawRoundedRect(enemies.children[i].x - game.cache.getImage('enemy0').width/2, enemies.children[i].y + game.cache.getImage('enemy0').height/2 + 5, game.cache.getImage('enemy0').width * enemyScale * percentage, 20, 10);
      graphics.endFill();
    }
    graphics.body = null;
  }
  if (_enemy.health <= 0) {
    enemySpawnPrize(_enemy.x, bullet.y, 1);
    score.enemiesDestroyed++;
    destroyEnemy(_enemy);
  }
  bullet.kill();
}

function enemySpawnPrize(popX, popY, amt) {
  for (i = 0; i < amt; i++) {
    if (game.rnd.frac() < 0.25) {
      prizeNum++;
      var roll2 = game.rnd.frac();
      if (roll2 < 0.25) {
        spawnPowerup(popX, popY);
      } else if (roll2 < 0.50) {
        spawnMagnet(popX, popY);
      } else if (roll2 < 0.75) {
        spawnMissile(popX, popY);
      } else {
        spawnCoin(popX, popY);
      }
    } else {
      spawnCoin(popX, popY);
    }
  }
}

function spawnMissile(popX, popY) {
  var prize = prizes.create(popX, popY - game.cache.getImage('missile').height * missile.scale / 2, 'missile');
  prize.type = 'missile';
  prize.name = 'prize' + prizeNum;
  prize.body.velocity.setTo(game.rnd.integerInRange(-100, 100), game.rnd.frac() * 2 * missile.initSpeed);
  prize.body.gravity.y = missile.gravity;
  prize.checkWorldBounds = true;
  prize.events.onOutOfBounds.add(prizeOutOfBounds, this);
}

function spawnMagnet(popX, popY) {
  var prize = prizes.create(popX, popY - game.cache.getImage('magnet').height * magnet.scale / 2, 'magnet');
  prize.type = 'magnet';
  prize.name = 'prize' + prizeNum;
  prize.body.velocity.setTo(game.rnd.integerInRange(-100, 100), game.rnd.frac() * 2 * magnet.initSpeed);
  prize.body.gravity.y = magnet.gravity;
  prize.checkWorldBounds = true;
  prize.events.onOutOfBounds.add(prizeOutOfBounds, this);
}

function spawnPowerup(popX, popY) {
  var prize = prizes.create(popX, popY - game.cache.getImage('powerup').height * powerup.scale / 2, 'powerup');
  prize.type = 'powerup';
  prize.name = 'prize' + prizeNum;
  prize.scale.setTo(powerup.scale, powerup.scale);
  prize.body.velocity.setTo(game.rnd.integerInRange(-100, 100), game.rnd.frac() * 2 * powerup.initSpeed);
  prize.body.gravity.y = powerup.gravity;
  prize.checkWorldBounds = true;
  prize.events.onOutOfBounds.add(prizeOutOfBounds, this);
}

function spawnCoin(popX, popY) {
  var prize = prizes.create(popX, popY - game.cache.getImage('coin').height * coin.scale / 2, 'coin');
  prize.type = 'coin';
  prize.name = 'prize' + prizeNum;
  prize.scale.setTo(coin.scale, coin.scale);
  prize.body.velocity.setTo(game.rnd.integerInRange(-100, 100), game.rnd.frac() * 2 * coin.initSpeed);
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
  prizes.remove(prize, true);
}

function playerHit(player, _enemy) {
  if (!indestructable) {
    player.hp -= enemyCollisionDamage;
  }
  enemySpawnPrize(_enemy.x, player.y - 100);
  score.enemiesDestroyed++;
  destroyEnemy(_enemy);
  if (player.hp <= 0) {
    playerDeath();
  }
}

function collectPrize(player, prize) {
  if (prize.type == 'powerup') {
    bulletDamage += powerup.powerUpIncrease;
  }
  if (prize.type == 'magnet') {
    player.magnetized = true;
    if (magnetsCollected + 1 < maxMagnets) {
      magnetsCollected++;
    } else {
      score.magnetBonus++;
    }
  }
  if (prize.type == 'missile') {
    if (missile.numMissiles + 1 < missile.maxMissiles + 1) {
      missile.numMissiles++;
    } else {
      missile.damage += missile.damageIncrement;
    }
    initMissiles();
  }
  destroyPrize(prize);
  score.coinsCollected++;
}

function playerDeath() {
  //bgmusic.stop();
  game.time.events.add(Phaser.Timer.SECOND * 4, transitionToDead, this);
}

function transitionToDead() {
  game.state.start('dead');
}

function initMissiles() {
  missiles = game.add.weapon(missile.numMissiles, 'missile');
  missiles.multifire = true;
  missiles.bulletAngleOffset = 90;
  missiles.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  missiles.bulletSpeed = 500;
  missiles.trackSprite(player, game.cache.getImage('player').width * playerScale.x - game.cache.getImage('player').width / 2, -10);
}