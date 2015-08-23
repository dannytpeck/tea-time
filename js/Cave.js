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
    
    this.menuButton;
    this.menuWindow;
    this.tween = null;
    
    this.hills;
    this.bg;
    this.exit;
    this.result = 'Nothing to report!';
    
};

BasicGame.Cave.prototype = {

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

        // Add exit and enable physics so it can be "touched"
        this.exit = this.add.sprite(500, this.game.world.height - 300, 'caveexit');
        this.physics.p2.enable(this.exit);
        

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
        this.player = this.game.add.sprite(200, this.game.world.height - 300, 'player');
        this.player.scale.set(0.5);
        //player.scale.x = 0.5;
        //player.scale.y = 0.5;

        // enable physics for the player (p2)
        this.physics.p2.enable(this.player);
    
        // set the anchor to the exact middle of the player (good for flipping the image on the same place)
        this.player.anchor.setTo(0.5,0.5);
        
        // in p2 rotation is possible.. i don't want this on my player 
        this.player.body.fixedRotation = true;
        
        // instead of a rectangle I want a circle (radius, offsetX, offsetY)
        this.player.body.setCircle(100,0,0);
    
        // this adds our animations for later use (custom cachekey, frames used for the animation, frames played per second, loop )
        this.player.animations.add('walk', [0, 1, 2, 1, 0, 3, 4, 3], 10, true);
        //player.animations.add('jump-left', [16], 10, true);
        //player.animations.add('jump-right', [17], 10, true);
        //player.animations.add('fall-left', [18], 10, true);
        //player.animations.add('fall-right', [19], 10, true);
        //player.animations.add('wallstick-left', [20], 10, true);
        //player.animations.add('wallstick-right', [21], 10, true);
        //player.animations.add('duck-left', [22], 10, true);
        //player.animations.add('duck-right', [23], 10, true);
    
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
        this.exit = this.add.sprite(500, this.game.world.height - 300, 'caveexit');
        this.physics.p2.enable(this.exit);
        this.exit.body.static = true;

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
