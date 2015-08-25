var PLAYER_SPEED = 400;

var Player = function (game, x, y, name) {
    
    Phaser.Sprite.call(this, game, x, y, name);
    //game.physics.enable(this, Phaser.Physics.ARCADE);
    game.physics.p2.enable(this);
    
    this.anchor.setTo(0.5, 0.5);

    this.body.collideWorldBounds = true;
    //this.body.setSize(11, 50, 0, -75);
    //this.body.maxVelocity.y = 500;
    //this.body.drag.x = 2000;

    //this.initialX = x;
    //this.initialY = y;
    
    this.scale.set(0.4); //40%
    this.body.fixedRotation = true;
    this.body.setCircle(75,0,0);

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
    
    
    
    
    
    
    // we need some cursor keys for our controls
    this.cursors = game.input.keyboard.createCursorKeys();
    this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.menuButton = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    // Make camera follow player
    game.camera.follow(this, Phaser.Camera.FOLLOW_PLATFORMER);    
    
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    
    // Resets player velocity every update
    this.body.velocity.x = 0;

    if (this.cursors.left.isDown && !this.immobile) {
        this.body.velocity.x = -PLAYER_SPEED;
        this.facing = 'left';
        if (!this.falling) {
            if (this.ducking) {
                this.PlayAnim('duckwalk');
            }
            else {
                this.PlayAnim('walk');
            }
        }
    }
    else if (this.cursors.right.isDown && !this.immobile) {
        this.body.velocity.x = PLAYER_SPEED;
        this.facing = 'right';
        if (!this.falling) {
            if (this.ducking) {
                this.PlayAnim('duckwalk');
            }
            else {
                this.PlayAnim('walk');
            }
        }
    }
    else {
        if (!this.falling && !this.ducking) {
            this.PlayAnim('idle');
        }
    }

    // Ducking animation
    if (!this.ducking && this.cursors.down.isDown) {
        this.immobile = true; //stop left/right movement during animation
        this.ducking = true; //this must go here to prevent animation from starting over and over again forever
        this.PlayAnim('inhale');
        
        this.events.onAnimationComplete.addOnce(function(){
	        this.animations.play('duck', 10, false, false);
	        
	        this.events.onAnimationComplete.addOnce(function(){
	            this.animations.play('beginduckwalk', 10, false, false);
	            
                this.events.onAnimationComplete.addOnce(function(){
	                this.animations.play('duckwalk', 10, true, false);
	                this.immobile = false;
	                this.setPlayerSize(); // Make smaller when ducking
	            }, this);
	        }, this);
        }, this);
    }
    
    // Player stands up when the up arrow is pressed
    if (this.ducking && this.cursors.up.isDown) {
        this.immobile = true;
        this.animations.play('unduck', 10, false); 

        this.events.onAnimationComplete.addOnce(function() {
            this.ducking = false;
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
            this.ducking = true;
            this.animations.play('duckwalk', 10, true);
        }, this);
    }

    // Falling animation    
    if (!this.ducking && !this.falling && this.body.velocity.y > 500) {
        this.falling = true;
        this.animations.play('startfalling', 10, false, false);
        
        this.events.onAnimationComplete.addOnce(function() {
	        this.animations.play('falling', 10, true, false);
        }, this);
    } 

    // Sprite flipping

    if (this.facing == 'left' && this.scale.x > 0) {
        this.scale.x *= -1;
    }
    else if (this.facing == 'right' && this.scale.x < 0) {
        this.scale.x *= -1;
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

Player.prototype.PlayAnim = function(name) {
    if(this.animations.currentAnim.name !== name) {
        this.animations.play(name);
    }
};

Player.prototype.setPlayerSize = function() {
    if (this.ducking) {
        this.body.setCircle(20, 0, 55);
    }
    else {
    this.body.setCircle(75, 0, 0);
    }
};