TeaTime.Forest = function (game) {

    this.isDucking = false;
    
    this.jumpTimer = 0;
    this.canJump = true;

};

TeaTime.Forest.prototype = {

    create: function () {

        this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'forestbg');
        this.player = this.game.add.sprite(this.game.world.width - 300, 300, 'player');
        this.player.scale.set(0.5);
        
        // Enable P2 physics on the player
        this.physics.p2.enable(this.player);

        // set the anchor to the exact middle of the player (good for flipping the image on the same place)
        this.player.anchor.setTo(0.5,0.5);
        
        // in p2 rotation is possible.. i don't want this on my player 
        this.player.body.fixedRotation = true;
        
        // instead of a rectangle I want a circle (radius, offsetX, offsetY)
        this.player.body.setCircle(100,0,0);



        // Physics Code
        // Enable P2 Physics on the world
        this.physics.startSystem(Phaser.Physics.P2JS);
    
        // Turn on impact events for the world, without this we get no collision callbacks
        this.physics.p2.setImpactEvents(true);
        
        // this creates an almost realistic gravity
        this.physics.p2.gravity.y = GRAVITY; 


        // Camera Code
        // Make camera follow the player
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

        
        // Controller Code
        // Set up control keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.menuButton = this.input.keyboard.addKey(Phaser.Keyboard.ESC);

        
        /* Set up map and collisions */
        
        // now lets initialise the tilemap .. first we create a new tilemap and for further references we put it on "mymap"    (testmap is the cachekey given in the preload function - the cachekey was your own choice)
        this.mymap = this.add.tilemap('forest');
        //now we add a tilsetimage to the created map-object residing on "mymap" - the name of the tilesetimage is stored in the json file and needs to be the exact same name.. you already chose the right name in your preload function - now use this cachekey 
        this.mymap.addTilesetImage('test-tileset');

        // this converts the polylines of the tiled - object layer into physics bodies.. make sure to use the "polyline" tool and not the "polygon" tool - otherwise it will not work!!
        /*these polyline physics bodies will not be visible - so make sure you paint your hills and slanted tiles on a layer that acts as background (without collision enabled) */
        this.layerobjects_tiles = this.physics.p2.convertCollisionObjects(this.mymap,"objects1");

    },

    update: function () {

        // Resets player velocity every update
        this.player.body.velocity.x = 0;
    
        if (this.cursors.left.isDown) {
            this.player.scale.x = -0.5;
            this.player.body.velocity.x = -MOVE_SPEED;
            
            if (this.isDucking) {
                this.player.animations.play('walk');
            }
            else {
                this.player.animations.play('walk');
            }
            this.facing = 'left';
        }
        else if (this.cursors.right.isDown) {
            this.player.scale.x = 0.5;
            this.player.body.velocity.x = MOVE_SPEED;
            
            if (this.isDucking) {
                this.player.animations.play('walk');
            }
            else {
                this.player.animations.play('walk');
            }
            this.facing = 'right';
        }
        else {
            this.player.animations.stop();
    
            if (this.facing == 'left') {
                if (this.isDucking) {
                    this.player.frame = 0;
                }
                else {
                    this.player.frame = 0;
                }
            }
            else {
                if (this.isDucking) {
                    this.player.frame = 0;
                }
                else {
                    this.player.frame = 0;
                }
            }
        }
        
        // Player ducks if they press down arrow
        if (this.touchingDown(this.player) && this.cursors.down.isDown) {
            this.isDucking = true;
            this.canJump = false;
            
            // Make box smaller when ducking
            this.setPlayerSize();
        }
        
        // Player stands when down arrow is released
        if (this.isDucking && this.cursors.down.isUp) {
            this.isDucking = false;
            this.canJump = true;
            
            // Make box larger when standing
            this.setPlayerSize();
        }
        
        // Player jumps if the jump button is pressed
        if (this.canJump && this.jumpButton.isDown && this.time.now > this.jumpTimer && this.touchingDown(this.player) ) {
            this.player.body.velocity.y = JUMP_HEIGHT;
            this.jumpTimer = this.time.now + 400;
        }
    
        // Jumping animation
        if (this.player.body.velocity.y < -50) {
            if (this.facing == 'left') {
                this.player.animations.play('walk');
            }
            else if (this.facing == 'right') {
                this.player.animations.play('walk');
            }
        }
    
        // Falling animation    
        if (this.player.body.velocity.y > 100) {
            if (this.facing == 'left') {
                this.player.animations.play('walk');
            }
            else if (this.facing == 'right') {
                this.player.animations.play('walk');
            }
        }
        
        if (this.facing == 'left' && this.player.scale.x === 1) {
            this.player.scale.x = -1;
        }
        else if (this.facing == 'right' && this.player.scale.x === -1) {
            this.player.scale.x = 1;
        }
        
        if (this.menuButton.isDown) {
            if (this.menuWindow.visible) {
                this.closeWindow();
            }
            else {
                this.openWindow();
                //delete this later, testing out possible ways to destroy everything and rebuild
                this.world.removeAll();
                this.player = this.add.sprite(200, this.world.height - 300, 'player');
                this.player.scale.set(0.5);
                this.player.anchor.setTo(0.5,0.5);
                
                this.physics.p2.enable(this.player);
                this.player.body.fixedRotation = true;
                this.player.body.setCircle(100,0,0);
                this.player.animations.add('walk', [0, 1, 2, 1, 0, 3, 4, 3], 10, true);
            }
        }
        
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },
    
    /*
     *  This function uses the p2 collision calculations that are done on every step to find out if 
     *  the player collides with something on the bottom - it returns true if a collision is happening
     */
    touchingDown: function (someone) {
        
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;
        
        for (var i = 0; i < this.physics.p2.world.narrowphase.contactEquations.length; i++) {
            var c = this.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"
            if (c.bodyA === someone.body.data || c.bodyB === someone.body.data)        {
                var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                if (c.bodyA === someone.body.data) d *= -1;
                if (d > 0.5) result = true;
            }
        } 
        
        return result;
    },
    
    // Callback function used when player hits another object
    blockHit: function (body, bodyB, shapeA, shapeB, equation) {
    
        //  The block hit something.
        //  
        //  This callback is sent 5 arguments:
        //  
        //  The Phaser.Physics.P2.Body it is in contact with. *This might be null* if the Body was created directly in the p2 world.
        //  The p2.Body this Body is in contact with.
        //  The Shape from this body that caused the contact.
        //  The Shape from the contact body.
        //  The Contact Equation data array.
        //  
        //  The first argument may be null or not have a sprite property, such as when you hit the world bounds.
        if (body && body.sprite) {
            if (body.sprite.key == 'caveexit') {
                this.loadForest();
                this.result = 'LOADING FOREST AREA';
            }
        }
    },
    
    setPlayerSize: function() {
        if (this.isDucking) {
            this.player.body.setCircle(50, 0, 50);
        }
        else {
            this.player.body.setCircle(100, 0, 0);
        }
    },
    
    openWindow: function() {
    
        if (this.tween !== null && this.tween.isRunning)
        {
            return;
        }
        
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        this.tween = this.add.tween(this.menuWindow.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
        this.menuWindow.visible = true;
    
    },
    
    closeWindow: function() {
    
        if (this.tween && this.tween.isRunning)
        {
            return;
        }
    
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        this.tween = this.add.tween(this.menuWindow.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
        this.menuWindow.visible = false;
    
    }

};
