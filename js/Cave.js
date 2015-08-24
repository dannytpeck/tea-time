var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 400;
var JUMP_HEIGHT = -700;
var GRAVITY = 500; //1400

BasicGame.Cave = function (game) {
    
    this.player;
    this.facing = 'right';
    
    this.cursors;
    this.jumpButton;
    this.jumpTimer = 0;
    
    // Flags for various actions
    this.isDucking = false;
    this.canJump = true;
    this.falling = false;
    this.playedFallIntro = false;
    this.isFlattened = false;
    
    this.menuButton;
    this.menuWindow;
    this.tween = null;
    
    this.hills;
    this.bg;
    this.exit;
    this.result = 'Nothing to report!';
    
    this.timeCheck;
    this.delay = 0;

};

BasicGame.Cave.prototype = {

/*
	preload: function () {

		// Here we load the assets our game needs.

        // Load the json tilemaps created with tiled (cachekey, filename, type of tilemap parser)
        this.load.tilemap('testmap', 'assets/test-tilemap-polygon.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('forest', 'assets/forest.json', null, Phaser.Tilemap.TILED_JSON);  

        // Load the tileset images used in tiled to create the map  (cachekey, filename)
        this.load.image('test-tileset', 'assets/test-tileset.png');

        // Load the player's spritesheet
        this.load.spritesheet('player', 'assets/slimegirl.png', 400, 400);

        this.load.image('menu', 'assets/menu window.png');
        
        // Load the background images
        this.load.image('tutorialcave', 'assets/Tutorial Cave.png');
        this.load.image('forestbg', 'assets/The Forest.png');
        
        this.load.image('caveexit', 'assets/tutorial-cave-exit.png');

	},
*/	
    create: function () {

        // Enable P2
        this.physics.startSystem(Phaser.Physics.P2JS);
    
        // Turn on impact events for the world, without this we get no collision callbacks
        this.physics.p2.setImpactEvents(true);
        
        // Makes objects bounce off each other
        // this.physics.p2.restitution = 0.8;
    
        // this creates an almost realistic gravity
        this.physics.p2.gravity.y = GRAVITY; 

        this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'tutorialcave');

        // now lets initialise the tilemap .. first we create a new tilemap and for further references we put it on "mymap"    (testmap is the cachekey given in the preload function - the cachekey was your own choice)
        this.mymap = this.add.tilemap('testmap');
        //now we add a tilsetimage to the created map-object residing on "mymap" - the name of the tilesetimage is stored in the json file and needs to be the exact same name.. you already chose the right name in your preload function - now use this cachekey 
        this.mymap.addTilesetImage('test-tileset');
        
        //create layers - every layer needs to be initialised.. you can leave some layers out - they wont be displayed then
        // on "mymap" we initialise a new layer - the layer with the name "layer1"  - this needs to be the exact same name as defined in tiled - it's stored in the json file
        this.layermain = this.mymap.createLayer('layer1');
        
        this.layersecondary = this.mymap.createLayer('layer2');
        // again, for further reference we put this layerobject on a variable - for example "layerbackground"
        this.layerbackground = this.mymap.createLayer('layer3');
        
        // this resizes the game world to the size of the given layer.. in that case "layerbackground"  it doesn't matter which layer we use because all of them have the same size
        this.layerbackground.resizeWorld();
        
        // here we activate a possible collision for all tiles on layer1 except the one with the index 0 (the index starts with 1 (first tile) so this means "collide with all tiles on the tilset that are placed on the layer)
        this.mymap.setCollisionByExclusion([0],true, 'layer1');
        
        // here we use a different approach - we activate the potential collision for all tiles with an index between 1 and 20 (again all tiles of the tilesetimage - there are only 20 tiles on it)
        // we don't activate collision for the last layer because we don't need it .. it will act as some sort of background
        // although we could do it because no actual collision will happen until we convert all the tiles marked as collideable to physics bodies with convertTilemap()
        this.mymap.setCollisionBetween(1,20,true,'layer2');
        
        // in p2 physics you will have to create physics bodies out of the tiles..  tiles that touch each other will create one big physics body instead of several small ones 
        // convertTilemap will create an array of all physics bodies 
        this.layermain_tiles = this.physics.p2.convertTilemap(this.mymap, this.layermain);
        this.layersecondary = this.physics.p2.convertTilemap(this.mymap, this.layersecondary);
        
        // this converts the polylines of the tiled - object layer into physics bodies.. make sure to use the "polyline" tool and not the "polygon" tool - otherwise it will not work!!
        /*these polyline physics bodies will not be visible - so make sure you paint your hills and slanted tiles on a layer that acts as background (without collision enabled) */
        this.layerobjects_tiles = this.physics.p2.convertCollisionObjects(this.mymap,"objects1");
        
        //this adds our player to the scene  (xposition, yposition, cachekey)
        //this.player = this.game.add.sprite(200, this.game.world.height - 300, 'player');
        this.player = this.game.add.sprite(200, this.game.world.height - 300, 'slimegirl', 'walk001');
        
        this.player.scale.set(0.4); //40%
        //player.scale.x = 0.5;
        //player.scale.y = 0.5;

        // enable physics for the player (p2)
        this.physics.p2.enable(this.player);
    
        // set the anchor to the exact middle of the player (good for flipping the image on the same place)
        this.player.anchor.setTo(0.5,0.5);
        
        // in p2 rotation is possible.. i don't want this on my player 
        this.player.body.fixedRotation = true;
        
        // instead of a rectangle I want a circle (radius, offsetX, offsetY)
        this.player.body.setCircle(50,0,0);
    
        // this adds our animations for later use (custom cachekey, frames used for the animation, frames played per second, loop )
        // this.player.animations.add('walk', [0, 1, 2, 1, 0, 3, 4, 3], 10, true);
        
        // Use an atlas instead (generateFrameNames('animation name', firstIndex, lastIndex, suffixString, zeroPadding)
        //this.player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 1, 5, '', 3), 10, true, false);
        // 1-2-3-2-1-4-5-4
        this.player.animations.add('walk', ['walk001', 'walk002', 'walk003', 'walk002', 'walk001', 'walk004', 'walk005', 'walk004'], 10, true, false);
        // 1-2-3-2-1-4-5-6
        this.player.animations.add('idle', ['idle001', 'idle002', 'idle003', 'idle002', 'idle001', 'idle004', 'idle005', 'idle006'], 8, true, false);

        this.player.animations.add('turn', ['turn001', 'turn002', 'turn003', 'turn004'], 4, true, false);
        
        this.player.animations.add('startfalling', ['falling001', 'falling002', 'falling003', 'falling004']);
        // 5-6-7-6
        this.player.animations.add('falling', ['falling005', 'falling006', 'falling007', 'falling006'], 10, true, false);
        
        // 1-2-3-2
        this.player.animations.add('walkslightangle', ['walkslightangle001', 'walkslightangle002', 'walkslightangle003', 'walkslightangle004'], 10, true, false);

        this.player.animations.add('fallimpact', [/*'fallimpact',*/ 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017'], 10, false, false);

        this.player.animations.add('unduck', ['unduck001', 'unduck002', 'unduck003', 'unduck004', 'unduck005', 'unduck006', 'unduck007', 'unduck008', 'unduck009', 'unduck010', 'unduck011'], 10, false, false);

        //when she's ducking, I imagined she'd do 1-5 and then 6-7-6-7-6-7 and then 8-18
        this.player.animations.add('inhale', ['duck001', 'duck002', 'duck003', 'duck004', 'duck005', 'duck006', 'duck007', 'duck006', 'duck007', 'duck006', 'duck007'], 10, true);
        this.player.animations.add('duck', ['duck008', 'duck009', 'duck010', 'duck011', 'duck012', 'duck013', 'duck014', 'duck015', 'duck016', 'duck017', 'duck018'], 10, true);
        
        // we need some cursor keys for our controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.menuButton = this.input.keyboard.addKey(Phaser.Keyboard.ESC);
    
        // Make camera follow player
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
    
        // Menu Code
        this.menuWindow = this.add.sprite(this.world.x + 200, this.world.y + 100, 'menu');
        this.menuWindow.fixedToCamera = true;
        
        this.menuWindow.alpha = 0.8;
        this.menuWindow.anchor.set(0.5);
    
        // Hide it until button is clicked
        this.menuWindow.visible = false;
        this.menuWindow.scale.set(0.1); 
    
        //  Check for the player hitting another object
        this.player.body.onBeginContact.add(this.blockHit, this);

        // Add exit and enable physics so it can be "touched"
        this.exit = this.add.sprite(32, 256, 'caveexit');
        this.physics.p2.enable(this.exit);
        this.exit.body.static = true;

        this.timeCheck = this.time.now;
    
    },

    update: function () {

        // Resets player velocity every update
        this.player.body.velocity.x = 0;

        
        // test for 3 second delay with a delay = 3000 milliseconds
        if (this.time.now - this.timeCheck > this.delay) {

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -MOVE_SPEED;
                this.facing = 'left';
                if (!this.falling && !this.isDucking) {
                    this.player.animations.play('walk');
                }
            }
            else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = MOVE_SPEED;
                this.facing = 'right';
                if (!this.falling && !this.isDucking) {
                    this.player.animations.play('walk');
                }
            }
            else {
                if (!this.falling && !this.isDucking) {
                    this.player.animations.play('idle');
                }
            }
    
            // Player ducks if they press down arrow
            if ((!this.isFlattened || !this.isDucking) && this.touchingDown(this.player) && this.cursors.down.isDown) {
                this.isDucking = true;
                //this.player.animations.play('inhale', 10, true);
                this.player.animations.play('duck', 10, false); 

                //this.player.events.onAnimationLoop.addOnce(function(){
                //    this.player.animations.play('duck', 10, true); 
                //}, this);

                // Make box smaller when ducking
                //this.setPlayerSize();
            }
            
            // Player stands up when down arrow is released
            if ((this.isFlattened || this.isDucking) && this.cursors.down.isUp) {
                this.player.animations.play('unduck', 10, false); 

                this.player.events.onAnimationComplete.addOnce(function(){
                    this.isDucking = false;
                    this.isFlattened = false;
                    this.canJump = true;
                }, this);

                // Make box larger when standing
                // this.setPlayerSize();
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
    
            // Stop falling when player touches the ground
            if (this.falling && this.touchingDown(this.player)) {
                this.player.animations.play('fallimpact', 10, false);
                this.player.events.onAnimationComplete.addOnce(function(){
                    this.falling = false;
                    this.isFlattened = true;
                }, this);
            }

            // Falling animation    
            if (!this.falling && this.player.body.velocity.y > 100) {
                this.falling = true;
                this.player.animations.play('startfalling', 10, false, false);
                
                this.player.events.onAnimationComplete.addOnce(function(){
			        this.player.animations.play('falling', 10, true, false);
		        }, this);
            } 

            if (this.facing == 'left' && this.player.scale.x > 0) {
                this.player.scale.x *= -1;
            }
            else if (this.facing == 'right' && this.player.scale.x < 0) {
                this.player.scale.x *= -1;
            }
            
            if (this.menuButton.isDown) {
                if (this.menuWindow.visible) {
                    this.closeWindow();
                }
                else {
                    this.openWindow();
                }
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
    
        if (this.tween !== null && this.tween.isRunning) {
            return;
        }
        
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        this.tween = this.add.tween(this.menuWindow.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
        this.menuWindow.visible = true;
    
    },
    
    closeWindow: function() {
    
        if (this.tween && this.tween.isRunning) {
            return;
        }
    
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        this.tween = this.add.tween(this.menuWindow.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
        this.menuWindow.visible = false;
    
    },
    
    loadForest: function() {
        this.state.start('Forest');
        //this.bg.destroy();
        //this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'forestbg');
        //this.bg.sendToBack();
        //this.player.body.x = 2100;
        //this.player.body.y = 400;
        
        //Need to delete the collision boxes for the map and create new ones for the new map
        //mymap = game.add.tilemap('testmap');
        //mymap.addTilesetImage('test-tileset');    
        //layerobjects_tiles = game.physics.p2.convertCollisionObjects(mymap,"objects1");  //Remove the original ones???
    }

};
