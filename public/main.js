/* globals Phaser, Weapon, EnemyGroup */
const game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render })
window.game = game
function preload () {
  game.load.spritesheet('cat', 'cat_fighter.png', 64, 64)
  game.load.spritesheet('bullet', 'fireball_normal.png', 32, 32)
  game.load.spritesheet('enemy', 'monster1.png', 64, 64)
  game.load.image('debug-grid', 'debug-grid-1920x1920.png')
}

game.CATEGORY_BULLET = 1
game.CATEGORY_ENEMY = 2
game.CATEGORY_PLAYER = 3

let player
let cursors
let fireButton
let weapon
let enemyGroup

function create () {
  game.physics.startSystem(Phaser.Physics.BOX2D)

  game.add.tileSprite(0, 0, 1920, 1920, 'debug-grid')
  game.world.setBounds(0, 0, 1920, 1920)
  game.physics.box2d.setBoundsToWorld()

  /**
   * player
   */
  player = game.add.sprite(game.world.centerX, game.world.centerY, 'cat')
  game.player = player
  game.physics.box2d.enable(player)
  player.speed = 200
  player.body.fixedRotation = true
  player.body.setRectangle(13, 28, -1, 8)

  game.camera.follow(player/* , Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1 */)

  // weapon
  weapon = new Weapon(game)
  weapon.trackedSprite = player

  // enemy
  enemyGroup = new EnemyGroup(game)

  cursors = game.input.keyboard.createCursorKeys()
  fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
  // stop the event from propagating up to the browser
  game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ])
}

let nextEnemy = 0
let spawnRate = 500
function spawnEnemies () {
  if (game.time.time < nextEnemy) { return }

  // if (Math.random() < 0.5) {
  //   window.lastEnemy = enemyGroup.spawn(Math.random() < 0.5 ? 0 : game.world.width, game.world.randomY)
  // } else {
  //   window.lastEnemy = enemyGroup.spawn(game.world.randomX, Math.random() < 0.5 ? 0 : game.world.height)
  // }
  enemyGroup.spawn(game.world.centerX - 100, game.world.centerY)

  nextEnemy = game.time.time + spawnRate
}

function update () {
  spawnEnemies()

  const { body, scale, speed } = player
  body.setZeroVelocity()
  if (cursors.left.isDown) {
    body.moveLeft(speed)
    scale.setTo(-1, 1)
  } else if (cursors.right.isDown) {
    body.moveRight(speed)
    scale.setTo(1, 1)
  }

  if (cursors.up.isDown) {
    body.moveUp(speed)
  } else if (cursors.down.isDown) {
    body.moveDown(speed)
  }

  // update direction
  const { velocity } = body
  // if just starting to fireball, not 'charge' yet (i.e. still in 'ready'),
  // lock the direction so fireball won't fly to wrong direction
  if (velocity.x !== 0 || velocity.y !== 0) {
    // update direction
    player.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
  }

  if (fireButton.isDown) {
    weapon.fireAngle = player.direction
    weapon.fire()

    // trackOffset
    weapon.trackOffset.x = 0
    weapon.trackOffset.y = 0
    if (this.direction <= 45 && this.direction >= -45) {
      // right
      weapon.trackOffset.x = 10
    } else if (this.direction <= -135 || this.direction >= 135) {
      // left
      weapon.trackOffset.x = -10
    }
    if (this.direction >= 45 && this.direction <= 135) {
      // down
      weapon.trackOffset.y = 10
    } else if (this.direction <= -45 && this.direction >= -135) {
      // up
      weapon.trackOffset.y = -10
    }
  }
}

function render () {
  game.debug.box2dWorld()
}
