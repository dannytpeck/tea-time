PLAYER_SPEED = function() { return 400; }

Player = function (game, x, y, name) {
    
    Phaser.Sprite.call(this, game, x, y, name);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 1);

    this.body.collideWorldBounds = true;
    this.body.setSize(11, 50, 0, -75);
    this.body.maxVelocity.y = 500;
    this.body.drag.x = 2000;

    this.initialX = x;
    this.initialY = y;
    
    //Begin my code
    this.scale.set(0.5); //50%
    
    //Used to keep her immobile during long animations
    this.immobile = false;

    this.animations.add('idle', ['idle001', 'idle002', 'idle003', 'idle002', 'idle001', 'idle004', 'idle005', 'idle006'], 8, true, false);
    this.animations.add('walk', ['walk001', 'walk002', 'walk003', 'walk002', 'walk001', 'walk004', 'walk005', 'walk004'], 10, true, false);
    this.animations.add('turn', ['turn001', 'turn002', 'turn003', 'turn004'], 4, true, false);
    this.animations.add('startfalling', ['falling001', 'falling002', 'falling003', 'falling004']);
    this.animations.add('falling', ['falling005', 'falling006', 'falling007', 'falling006'], 10, true, false);
    this.animations.add('walkslightangle', ['walkslightangle001', 'walkslightangle002', 'walkslightangle003', 'walkslightangle004'], 10, true, false);
    this.animations.add('fallimpact', ['fallimpact', 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017'], 10, false, false);
    this.animations.add('unduck', ['unduck001', 'unduck002', 'unduck003', 'unduck004', 'unduck005', 'unduck006', 'unduck007', 'unduck008', 'unduck009', 'unduck010', 'unduck011'], 10, false, false);
    this.animations.add('inhale', ['duck001', 'duck002', 'duck003', 'duck004', 'duck005', 'duck006', 'duck007', 'duck006', 'duck007', 'duck006', 'duck007'], 10, false);
    this.animations.add('duck', ['duck008', 'duck009', 'duck010', 'duck011', 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017'], 10, false);
    this.animations.add('beginduckwalk', ['duckwalk001', 'duckwalk002', 'duckwalk003'], 10, false);
    this.animations.add('duckwalk', ['duckwalk004', 'duckwalk005', 'duckwalk006', 'duckwalk005'], 10, true);
    
    this.state = this.Standing;
    this.PlayAnim('idle');
    
    this.tweens = {};
    this.tweens.roll = null;

    this.states = {};
    this.states.direction = 'right';
    this.states.crouching = false;
    this.states.hasFlipped = false;
    this.states.upPresseed = false;
    this.states.wasAttacking = false;
    this.states.inWater = false;
    this.states.onCloud = false;
    this.states.inUpdraft = false;
    this.states.droppingThroughCloud = false;
    this.states.onLeftSlope = false;
    this.states.onRightSlope = false;
    
    this.movement = {};
    this.movement.diveVelocity = 0;
    this.movement.jumpSlashVelocity = 0;
    this.movement.startRollTime = game.time.now;
    this.movement.rollPop = false;
    this.movement.rollPrevVel = 0;
    this.movement.rollDirection = 1;
    
    // we need some cursor keys for our controls
    this.cursors = game.input.keyboard.createCursorKeys();
    this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.menuButton = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    // Menu Code
    this.menuWindow = game.add.sprite(game.world.x + 200, game.world.y + 100, 'menu');
    this.menuWindow.fixedToCamera = true;
    
    this.menuWindow.alpha = 0.8;
    this.menuWindow.anchor.set(0.5);

    // Hide it until button is clicked
    this.menuWindow.visible = false;
    this.menuWindow.scale.set(0.1);
    
    this.tween = null;

    // Make camera follow player
    game.camera.follow(this, Phaser.Camera.FOLLOW_PLATFORMER);    
    sfx = game.add.audio('squirm', 1, false);

    
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.preStateUpdate = function() {
    this.body.maxVelocity.x = PLAYER_SPEED();
    this.body.maxVelocity.y = 500;

    this.body.gravity.y = 0;
    this.body.drag.x = 2000;

    /*if(!this.states.inWater && (this.state === this.Running || this.state === this.Rolling)) {
        this.runDust.visible = true;

        this.runDust.y = this.body.y + this.body.height - this.runDust.height;

        //position the dust
        if(this.states.direction === 'right') {
            this.runDust.x = this.body.x - 22;
            this.runDust.scale.x = 1;
        } else {
            this.runDust.x = this.body.x + 32;
            this.runDust.scale.x = -1;
        }
    } else {
        this.runDust.visible = false;
    } */
};

Player.prototype.postStateUpdate = function() {

    if(this.states.inWater) {
        if(this.states.flowLeft || this.states.flowRight) {
            this.body.maxVelocity.x *= 2;
        } else {
            this.body.maxVelocity.x *= 0.7;
        }

        this.body.gravity.y = -300;
    }
    
    /*
    if(this.states.inUpdraft) {
        this.body.acceleration.y = -1000;

        if(this.body.velocity.y > 300) {
            //this.body.velocity.y = 300;
        }
    } else {
        this.body.acceleration.y = 0;
    }

    if(frauki.states.flowDown) {
        this.body.acceleration.y = 500;
    } else if(frauki.states.flowUp) {
        this.body.acceleration.y = -500;
    }

    if(frauki.states.flowLeft) {
        this.body.acceleration.x = -600;
    } else if(frauki.states.flowRight) {
        this.body.acceleration.x = 600;
    }

    //reset the double jump flag
    if(this.body.onFloor()) {
        this.states.hasFlipped = false;
        this.movement.rollBoost = 0;
    }

    if(this.Attacking()) {
        game.physics.arcade.overlap(frauki.attackRect, Frogland.GetCurrentObjectGroup(), Collision.OverlapAttackWithObject);
        game.physics.arcade.overlap(frauki.attackRect, projectileController.projectiles, ProjectileHit);
        //game.physics.arcade.overlap(frauki.attackRect, Frogland.GetCurrentCollisionLayer(), TilesHit);
    }*/
    
    //if(this.state === this.Running && this.animations.currentAnim.name === 'run') {
    //   events.publish('play_sound', {name: 'running'});
    //} else {
    //    events.publish('stop_sound', {name: 'running'});
    //}
};

Player.prototype.update = function() {
    
    this.preStateUpdate();
    this.state();
    this.postStateUpdate();

    //debug
    //this.game.debug.text('crouching?' + this.states.crouching + 'touchingRight?' + this.touchingRight(this) + ' Velocity Y:' + this.body.velocity.y, 16, 24);

    // Resets player velocity every update
    this.body.velocity.x = 0;

    if (this.cursors.left.isDown && !this.immobile) {
        this.body.velocity.x = -MOVE_SPEED;
        this.SetDirection('left');
        this.state === this.Running;
        //if (!sfx.isPlaying) {
        //    sfx.play();
        //}
        if (!this.falling) {
            if (this.states.crouching) {
                this.PlayAnim('duckwalk');
            }
            else {
                this.PlayAnim('walk');
            }
        }
    }
    else if (this.cursors.right.isDown && !this.immobile) {
        this.body.velocity.x = MOVE_SPEED;
        this.SetDirection('right');
        this.state === this.Running;
        //if (!sfx.isPlaying) {
        //    sfx.play();
        //}
        if (!this.falling) {
            if (this.states.crouching) {
                this.PlayAnim('duckwalk');
            }
            else {
                this.PlayAnim('walk');
            }
        }
    }
    else {
        if (!this.falling && !this.states.crouching) {
            this.state = this.Standing;
            this.PlayAnim('idle');
        }
    }

    // Crouching animation
    if (!this.states.crouching && this.cursors.down.isDown) {
        this.immobile = true; //stop left/right movement during animation
        this.states.crouching = true; //this must go here to prevent animation from starting over and over again forever
        this.PlayAnim('inhale');
        
        this.events.onAnimationComplete.addOnce(function(){
	        this.animations.play('duck', 10, false, false);
	        
	        this.events.onAnimationComplete.addOnce(function(){
	            this.animations.play('beginduckwalk', 10, false, false);
	            
                this.events.onAnimationComplete.addOnce(function(){
	                this.animations.play('duckwalk', 10, true, false);
	                this.immobile = false;
	                this.setPlayerSize(); // Make smaller when crouching
	            }, this);
	        }, this);
        }, this);
    }
    
    // Player stands up when the up arrow is pressed
    if (!this.immobile && this.states.crouching && this.cursors.up.isDown) {
        this.immobile = true;
        this.animations.play('unduck', 10, false); 

        this.events.onAnimationComplete.addOnce(function() {
            this.states.crouching = false;
            this.immobile = false;
            this.setPlayerSize(); // Make larger when player stands up
        }, this);
    }
    
    // Player jumps if the jump button is pressed
    //if (this.jumpButton.isDown && this.time.now > this.jumpTimer && this.touchingDown(this.player) ) {
    //    this.player.body.velocity.y = JUMP_HEIGHT;
    //    this.jumpTimer = this.time.now + 400;
    //    }

    // Stop falling when player touches the ground
    if (this.falling && this.touchingDown(this)) {
        this.animations.play('fallimpact', 10, false);
        
        this.events.onAnimationComplete.addOnce(function() {
            this.falling = false;
            this.states.crouching = true;
            this.animations.play('duckwalk', 10, true);
        }, this);
    }

    // Falling animation    
    if (!this.states.crouching && !this.falling && this.body.velocity.y > 500) {
        this.falling = true;
        this.animations.play('startfalling', 10, false, false);
        
        this.events.onAnimationComplete.addOnce(function() {
	        this.animations.play('falling', 10, true, false);
        }, this);
    } 

    if (this.menuButton.isDown) {
        if (this.menuWindow.visible) {
            this.closeWindow();
        }
        else {
            this.openWindow();
        }
    }

};

Player.prototype.SetDirection = function(dir) {
    if(this.states.direction !== dir && this.animations.paused === false) {
        this.states.direction = dir;

        dir === 'left' ? this.scale.x = -0.5 : this.scale.x = 0.5;
    }
};

Player.prototype.PlayAnim = function(name) {
    if(this.animations.currentAnim.name !== name) {
        this.animations.play(name);
    }
};

Player.prototype.setPlayerSize = function() {
    if (this.states.crouching) {
        //body size half
    }
    else {
        //return body to full size
    }
};

Player.prototype.touchingDown = function(someone) {
    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;
    for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = this.game.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"
        if (c.bodyA === someone.body.data || c.bodyB === someone.body.data)        {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
            if (c.bodyA === someone.body.data) d *= -1;
            if (d > 0.5) result = true;
        }
    } 
    return result;
};

Player.prototype.touchingRight = function(someone) {
    var xAxis = p2.vec2.fromValues(1, 0);
    var result = false;
    for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = this.game.physics.p2.world.narrowphase.contactEquations[i];
        if (c.bodyA === someone.data || c.bodyB === someone.data)        {
            var d = p2.vec2.dot(c.normalA, xAxis); // Normal dot X-axis
            if (c.bodyA === someone.data) d *= -1;
            if (d > 0.5) result = true;
        }
    } 
    return result;
};




//////////////////STATES/////////////////
Player.prototype.Standing = function() {
    this.PlayAnim('idle');

    if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    } else if(this.body.velocity.y > 10) {
        this.state = this.Falling;
    } else if(this.body.velocity.x !== 0) {
        this.state = this.Running;
    } else if(this.states.crouching) {
        this.state = this.Crouching;
    }
};

Player.prototype.Running = function() {

    //if((frauki.states.flowLeft || frauki.states.flowRight) && !inputController.dpad.left && !inputController.dpad.right) {
    //    this.PlayAnim('fall');
    //} else {
    this.PlayAnim('run');
    //}

    if(this.body.velocity.x === 0 && this.body.onFloor()) {
        this.state = this.Standing;
    } else if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    } else if(this.body.velocity.y > 150) {
        this.state = this.Peaking;
    }
};

//Player.prototype.Jumping = function() {
    //if(this.animations.name !== 'roll_jump' || (this.animations.name === 'roll_jump' && this.animations.currentAnim.isFinished)) {
//        this.PlayAnim('jump');
//    }

//    if(this.body.velocity.y >= 0) {
//        this.state = this.Peaking;
//    }
//};

//Player.prototype.Peaking = function() {
//    this.PlayAnim('peak');

//    this.body.gravity.y = game.physics.arcade.gravity.y * 2;

//    if(this.body.velocity.y < 0) {
//        this.state = this.Jumping;
//    } else if(this.body.onFloor()) {
//        this.state = this.Landing;
//    } else if(this.animations.currentAnim.isFinished) {
//        this.state = this.Falling;
//    }
//};

Player.prototype.Falling = function() {
    this.PlayAnim('fall');

    //if(!this.states.inUpdraft) {
    this.body.gravity.y = game.physics.arcade.gravity.y * 2;
    //}

    //if they jump into water, make sure they slow the hell down
    if(this.states.inWater && this.body.velocity.y > 300) {
        this.body.velocity.y = 300;
    }

    if(this.body.onFloor()) {
        
        if(this.body.velocity.x === 0) {
            if(this.states.crouching)
                this.state = this.Crouching;
            else
                this.state = this.Landing;
        }
        else {
            this.state = this.Running;
        }

        //if(!frauki.states.inWater) effectsController.JumpDust(frauki.body.center);

    } else if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    }
};

Player.prototype.Landing = function() {
    this.PlayAnim('land');

    if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    }
    
    if(this.body.velocity.x !== 0) {
        this.state = this.Running;
    }

    if(this.animations.currentAnim.isFinished) {
        if(this.body.velocity.x === 0) {
            this.state = this.Standing;
        } else {
            this.state = this.Running;
        }
    }
};

Player.prototype.Crouching = function() {
    this.PlayAnim('crouch');

    if(!this.states.crouching || this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        this.state = this.Standing;
    }
};

Player.prototype.openWindow = function() {
    
    if (this.tween !== null && this.tween.isRunning) {
        return;
    }
        
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    this.tween = this.game.add.tween(this.menuWindow.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    this.menuWindow.visible = true;
    
};
    
Player.prototype.closeWindow = function() {
    
    if (this.tween && this.tween.isRunning) {
        return;
    }
    
    //  Create a tween that will close the window, but only if it's not already tweening or closed
    this.tween = this.game.add.tween(this.menuWindow.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
    this.menuWindow.visible = false;
    
};