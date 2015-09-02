PLAYER_SPEED = function() { return 400; }
JUMP_HEIGHT = function() { return -700; }

Player = function (game, x, y, name) {
    
    Phaser.Sprite.call(this, game, x, y, name);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);

    this.body.collideWorldBounds = true;
    this.body.maxVelocity.y = 500;
    this.body.drag.x = 2000;
    this.body.setSize(250, 350, 0, 15);
    //this.body.setSize(355, 125, 0, 70);

    this.initialX = x;
    this.initialY = y;
    
    //Begin my code
    this.scale.set(0.5); //50%
    
    //Used to keep her immobile during long animations
    this.immobile = false;
    var fps = 8;

    this.animations.add('idle',     ['idle001', 'idle002', 'idle003', 'idle002', 'idle001', 'idle004', 'idle005', 'idle006'], fps, true);
    this.animations.add('walk',     ['walk001', 'walk002', 'walk003', 'walk002', 'walk001', 'walk004', 'walk005', 'walk004'], fps, true);
    this.animations.add('turn',     ['turn001', 'turn002', 'turn003', 'turn004', 'turn005'], fps*2, false);
    this.animations.add('beginfalling', ['fall001', 'fall002', 'fall003', 'fall004'], fps, false);
    this.animations.add('falling',  ['falling001', 'falling002', 'falling003', 'falling002'], fps, true);
    this.animations.add('land',     ['fallimpact', 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017', 'duck018'], fps, false);
    this.animations.add('unduck',   ['unduck001', 'unduck002', 'unduck003', 'unduck004', 'unduck005', 'unduck006', 'unduck007', 'unduck008', 'unduck009', 'unduck010', 'unduck011'], fps, false);
    this.animations.add('inhale',   ['duck001', 'duck002', 'duck003', 'duck004', 'duck005', 'duck006', 'duck007', 'duck006', 'duck007', 'duck006', 'duck007'], fps*2, false);
    this.animations.add('duck',     ['duck008', 'duck009', 'duck010', 'duck011', 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017', 'duck018'], fps, false);
    this.animations.add('duckwalk', ['duckwalk001', 'duckwalk002', 'duckwalk003', 'duckwalk002'], fps, true);
    this.animations.add('duckidle', ['duckidle001', 'duckidle002', 'duckidle003', 'duckidle004', 'duckidle005'], fps, true);
    this.animations.add('duckturn', ['duckturn001', 'duckturn002', 'duckturn003', 'duckturn004'], fps*2, false);
    
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
    
    this.jumpTimer = 0;

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

    // Text STUFF
    this.text;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;


Player.prototype.update = function() {
    
    this.state();

    this.game.input.onDown.addOnce(this.updateText, this);
        
    // debug stuff
    // this.game.debug.text('this.states.crouching?: ' + this.states.crouching + 'this.state?: ' + this.state, 16, 24);
    this.game.debug.bodyInfo(this, 16, 24);
    //this.game.debug.text("Hi there", 16, 24);
    this.game.debug.body(this);


    if (this.cursors.left.isDown && !this.immobile) {
        this.body.velocity.x = -MOVE_SPEED;
        //if (!sfx.isPlaying) {
        //    sfx.play();
        //}
    }
    else if (this.cursors.right.isDown && !this.immobile) {
        this.body.velocity.x = MOVE_SPEED;
        //if (!sfx.isPlaying) {
        //    sfx.play();
        //}
    }
    else {
        //Uh... do nothing
    }

    // If player presses Down, drop into a pool of goo
    if (!this.immobile && !this.states.crouching && this.cursors.down.isDown) {
        //this.immobile = true; //stop left/right movement during animation
        this.states.crouching = true; //this must go here to prevent animation from starting over and over again forever
        this.setPlayerSize();
    }
    
    // If player presses Up, stand up
    // if (!this.immobile && this.states.crouching && this.cursors.up.isDown) {
        
    //     this.states.crouching = false;
    //     this.setPlayerSize();
        
        
        
    //    this.immobile = true;
    //  this.animations.play('unduck', 10, false); 

    //    this.events.onAnimationComplete.addOnce(function() {
    //        this.states.crouching = false;
    //        this.state = this.Standing;
    //        this.immobile = false;
    //        this.setPlayerSize(); // Make larger when player stands up
    //    }, this);
    //}
    
    // Player jumps if the jump button is pressed
    if (this.jumpButton.isDown /* && this.body.onFloor() && this.game.time.now > this.jumpTimer */ )
    {
        this.body.velocity.y = JUMP_HEIGHT;
        this.jumpTimer = this.game.time.now + 750;
    }

    // Stop falling when player touches the ground
    //if (this.falling && this.touchingDown(this)) {
    //    this.animations.play('fallimpact', 10, false);
        
    //    this.events.onAnimationComplete.addOnce(function() {
    //        this.falling = false;
    //        this.states.crouching = true;
    //        this.animations.play('duckwalk', 10, true);
    //    }, this);
    //}

    // Falling animation    
    //if (!this.states.crouching && !this.falling && this.body.velocity.y > 500) {
    //    this.falling = true;
    //    this.animations.play('beginfalling', 10, false, false);
        
    //    this.events.onAnimationComplete.addOnce(function() {
	//        this.animations.play('falling', 10, true, false);
    //    }, this);
    //} 

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
        this.body.setSize(355, 128, 0, 70);
    }
    else {
        this.body.setSize(250, 350, 0, 15);
    }
};

//////////////////STATES/////////////////
Player.prototype.Standing = function() {

    this.PlayAnim('idle');

    if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    } else if(this.body.velocity.y > 10) {
        this.state = this.Falling;
    } else if(this.body.velocity.x !== 0) {
        this.state = this.Walking;
    } else if(this.states.crouching) {
        this.state = this.Inhaling;
    }
};

Player.prototype.Walking = function() {

    this.PlayAnim('walk');

    if(this.body.velocity.x === 0 && this.body.onFloor()) {
        this.state = this.Standing;
    } else if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    } else if(this.body.velocity.y > 150) {
        this.state = this.BeginFalling;
    } else if(this.states.direction == 'right' && this.body.velocity.x < 0) {
        this.SetDirection('left');
        this.state = this.Turning;
    } else if(this.states.direction == 'left' && this.body.velocity.x > 0) {
        this.SetDirection('right');
        this.state = this.Turning;
    }
};

Player.prototype.Crouchwalking = function() {

    this.PlayAnim('duckwalk');

    if(this.body.velocity.x === 0 && this.body.onFloor()) {
        this.state = this.Crouching;
    } else if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    } else if(this.body.velocity.y > 150) {
        this.state = this.BeginFalling;
    } else if(this.states.direction == 'right' && this.body.velocity.x < 0) {
        this.SetDirection('left');
        this.state = this.Crouchturning;
    } else if(this.states.direction == 'left' && this.body.velocity.x > 0) {
        this.SetDirection('right');
        this.state = this.Crouchturning;
    }
};

//Just for debug purposes
Player.prototype.Jumping = function() {
    //this.PlayAnim('idle');

    if(this.body.velocity.y >= 0) {
        this.state = this.BeginFalling;
    }
};

Player.prototype.BeginFalling = function() {
    this.PlayAnim('beginfalling');

    //this.body.gravity.y = game.physics.arcade.gravity.y * 2;

    if(this.body.onFloor()) {
        this.state = this.Landing;
    } else if(this.animations.currentAnim.isFinished) {
        this.state = this.Falling;
    }
};

Player.prototype.Falling = function() {
    this.PlayAnim('falling');

    //this.body.gravity.y = this.game.physics.arcade.gravity.y * 2;

    //if they jump into water, make sure they slow the hell down
    if(this.states.inWater && this.body.velocity.y > 300) {
        this.body.velocity.y = 300;
    }

    if(this.states.direction == 'right' && this.body.velocity.x < 0) {
        this.SetDirection('left');
    } else if(this.states.direction == 'left' && this.body.velocity.x > 0) {
        this.SetDirection('right');
    }

    if(this.body.onFloor()) {
        this.state = this.Landing;
    } else if(this.body.velocity.y < 0) {
        this.state = this.Jumping;
    }
};

Player.prototype.Landing = function() {
    this.PlayAnim('land');
    this.states.crouching = true; //Land in a crouch

    if(this.animations.currentAnim.isFinished) {
        if(this.body.velocity.x === 0) {
            this.state = this.Crouching;
            this.setPlayerSize();
        } else {
            this.state = this.Crouchwalking;
            this.setPlayerSize();
        }
    }
};

Player.prototype.Inhaling = function() {
    this.PlayAnim('inhale');

    if(this.animations.currentAnim.isFinished) {
        this.state = this.BeginCrouching;
    }
};

Player.prototype.BeginCrouching = function() {
    this.PlayAnim('duck');

    if(this.animations.currentAnim.isFinished) {
        this.state = this.Crouching;
    }
};

Player.prototype.Crouching = function() {
    this.PlayAnim('duckidle');

    if(!this.states.crouching) {
        this.state = this.RisingUp;
    } else if(this.body.velocity.x !== 0) {
        this.state = this.Crouchwalking;
    }
};

Player.prototype.RisingUp = function() {
    this.PlayAnim('unduck');

    if(this.animations.currentAnim.isFinished) {
        this.state = this.Turning;
    }
};

Player.prototype.Turning = function() {
    this.PlayAnim('turn');
    
    if(this.animations.currentAnim.isFinished) {
        this.state = this.Standing;
    }
};

Player.prototype.Crouchturning = function() {
    this.PlayAnim('duckturn');
    
    if(this.animations.currentAnim.isFinished) {
        this.state = this.Crouchwalking;
    }
};
//////////////////STATES END/////////////////




Player.prototype.openWindow = function() {
    
    if (this.tween !== null && this.tween.isRunning) {
        return;
    }
        
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    this.tween = this.game.add.tween(this.menuWindow.scale).to( { x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
    this.menuWindow.visible = true;
    this.immobile = true;


    this.textStyle = { font: "32px bubblegumregular", fill: "#05F08A", wordWrap: true, wordWrapWidth: 390, align: "left" };
    this.text = this.game.add.text(0, 0, "", this.textStyle);
    this.text.setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...");
    this.text.anchor.set(0.5, 0.5);
    
    this.text.x = this.menuWindow.x + 10;
    this.text.y = this.menuWindow.y + 10;
    this.text.visible = true;
};
    
Player.prototype.closeWindow = function() {
    
    if (this.tween && this.tween.isRunning) {
        return;
    }
    
    //  Create a tween that will close the window, but only if it's not already tweening or closed
    this.tween = this.game.add.tween(this.menuWindow.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
    this.menuWindow.visible = false;
    this.text.visible = false;
    this.immobile = false;
    
};