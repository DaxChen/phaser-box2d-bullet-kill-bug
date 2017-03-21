/* globals Phaser, PIXI */

class Bullet extends Phaser.Sprite {
  constructor (game, key) {
    super(game, 0, 0, key)
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    this.checkWorldBounds = true
    this.outOfBoundsKill = true

    // physics
    game.physics.box2d.enable(this)
    this.body.setRectangle(12, 12, 8, 0)
    this.body.fixedRotation = true
    this.body.setCollisionCategory(game.CATEGORY_BULLET)
    this.body.bullet = true
    // this.body.sensor = true

    this.exists = false
    this.body.kill()

    // these are relative expensive
    // this.checkWorldBounds = true
    // this.outOfBoundsKill = true

    this.data = {
      fromX: 0,
      fromY: 0,
      rotateToVelocity: true
    }

    // contact callbacks
    this.body.setCategoryContactCallback(game.CATEGORY_ENEMY, this.hitEnemy, this)
  }

  kill () {
    this.body.kill()
    // this.alive = false
    this.exists = false
    // this.visible = false
    // this.data.bulletUID = null

    // this.data.bulletManager.onKill.dispatch(this)

    return this
  }

  fire (x, y, angle, speed) {
    this.reset(x, y)
    // this.scale.set(1)

    // although we are using Box2D physics, this helper method is still okay!
    const v = this.game.physics.arcade.velocityFromAngle(angle, speed)
    this.body.velocity.x = v.x
    this.body.velocity.y = v.y

    this.angle = angle

    // first frame rotation
    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    // this.body.gravity.set(gx, gy)
  }

  update () {
    if (!this.exists) { return }

    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    // if (this.scaleSpeed > 0) {
    //   this.scale.x += this.scaleSpeed
    //   this.scale.y += this.scaleSpeed
    // }
  }

  // body1 is the bullet, body2 is the enemy. use body1.sprite, body2.sprite to get sprite
  hitEnemy (body1, body2, fixture1, fixture2, begin) {
    if (!begin) { return }
    console.log('hit!')

    if (body2.sprite) {
      body2.sprite.hit(body1.sprite)
    }

    // It is possible for the bullet to collide with more than one tile body
    // in the same timestep, in which case this will run twice, so we need to
    // check if the sprite has already been destroyed.
    if (body1.sprite) {
      // this.kill()
      this.destroy()
    }
  }
}

class Weapon extends Phaser.Group {
  constructor (game) {
    super(game, game.world, 'Weapon Group', false, true/* , Phaser.Physics.BOX2D */)

    this._nextFire = 0
    this.bulletSpeed = 600
    this.fireRate = 100
    this.fireAngle = Phaser.ANGLE_UP
    this.trackedSprite = null
    this.trackOffset = new Phaser.Point()

    for (var i = 0; i < 10; i++) {
      this.add(new Bullet(game, 'bullet'), true)
    }
  }

  fire () {
    if (this.game.time.now < this._nextFire) { return }

    const x = this.trackedSprite.x + this.trackOffset.x
    const y = this.trackedSprite.y + this.trackOffset.y

    let bullet = this.getFirstExists(false)
    if (!bullet) {
      bullet = new Bullet(this.game, 'bullet')
      this.add(bullet, true)
    }

    bullet.data.fromX = x
    bullet.data.fromY = y

    bullet.fire(x, y, this.fireAngle, this.bulletSpeed, 0, 0)

    this._nextFire = this.game.time.now + this.fireRate
  }
}
window.Weapon = Weapon
