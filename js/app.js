var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 200;
var JUMP_HEIGHT = -700;
var GRAVITY = 1400;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    // this loads an image (in that case an image that is usable as tilingimage in x and y directions)
    game.load.image('stars', 'assets/stars-tilingsprite.png');

    // another image that can be used as tiling image in the x direction
    game.load.image('hills', 'assets/hills-tilingsprite.png');
    
    // this loads the json tilemap created with tiled (cachekey, filename, type of tilemap parser)
    game.load.tilemap('testmap', 'assets/test-tilemap-polygon.json', null, Phaser.Tilemap.TILED_JSON);  
    //game.load.tilemap('testmap', 'assets/tutorialcave.json', null, Phaser.Tilemap.TILED_JSON);  
    
    // this loads a very important image - it is the tileset image used in tiled to create the map  (cachekey, filename)
    game.load.image('test-tileset', 'assets/test-tileset.png');
    //game.load.image('test-tileset', 'assets/tutorialcave.png');

    //game.load.spritesheet('player', 'assets/slimegirl.png', 42, 64);
    game.load.spritesheet('player', 'assets/maincharacter.png', 200, 200);
    
    game.load.image('menu', 'assets/menu window.png');
    
    game.load.image('tutorialcave', 'assets/Tutorial Cave.png');

}

var bg;
var map;
var layer;

var player;
var facing = 'left';

var cursors;
var jumpButton;
var jumpTimer = 0;

// Flags for various actions
var isDucking = false;
var canJump = true;

var menuButton;
var popup;
var tween = null;

var stars;
var hills;

function create() {

    //this will start the powerful p2 physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    
    // this creates an almost realistic gravity
    game.physics.p2.gravity.y = GRAVITY; 
    
    // this adds a tiling sprite that covers the whole canvas - the size of the canvas (800x640) is set below when you create a new phaser game
    //stars = game.add.tileSprite(0,0,800,640,'stars');
    stars = game.add.tileSprite(0, 0, 3200, 2400, 'tutorialcave');
    //stars.fixedToCamera = true;
    
    // these hills are spanned over the whole map  - the map is 40x20 tiles at 32x32 pixels so the whole map is 1280x640 pixels in size
    hills = game.add.tileSprite(0,0,1280,640,'hills');
    
    // now lets initialise the tilemap .. first we create a new tilemap and for further references we put it on "mymap"    (testmap is the cachekey given in the preload function - the cachekey was your own choice)
    mymap = game.add.tilemap('testmap');
    //now we add a tilsetimage to the created map-object residing on "mymap" - the name of the tilesetimage is stored in the json file and needs to be the exact same name.. you already chose the right name in your preload function - now use this cachekey 
    mymap.addTilesetImage('test-tileset');
    
    //create layers - every layer needs to be initialised.. you can leave some layers out - they wont be displayed then
    // on "mymap" we initialise a new layer - the layer with the name "layer1"  - this needs to be the exact same name as defined in tiled - it's stored in the json file
    layermain = mymap.createLayer('layer1');
    
    layersecondary = mymap.createLayer('layer2');
    // again, for further reference we put this layerobject on a variable - for example "layerbackground"
    layerbackground = mymap.createLayer('layer3');
    
    // this resizes the game world to the size of the given layer.. in that case "layerbackground"  it doesn't matter which layer we use because all of them have the same size
    layerbackground.resizeWorld();
    
    // here we activate a possible collision for all tiles on layer1 except the one with the index 0 (the index starts with 1 (first tile) so this means "collide with all tiles on the tilset that are placed on the layer)
    mymap.setCollisionByExclusion([0],true, 'layer1');
    
    // here we use a different approach - we activate the potential collision for all tiles with an index between 1 and 20 (again all tiles of the tilesetimage - there are only 20 tiles on it)
    // we don't activate collision for the last layer because we don't need it .. it will act as some sort of background
    // although we could do it because no actual collision will happen until we convert all the tiles marked as collideable to physics bodies with convertTilemap()
    mymap.setCollisionBetween(1,20,true,'layer2');
    
    // in p2 physics you will have to create physics bodies out of the tiles..  tiles that touch each other will create one big physics body instead of several small ones 
    // convertTilemap will create an array of all physics bodies 
    layermain_tiles = game.physics.p2.convertTilemap(mymap, layermain);
    layersecondary = game.physics.p2.convertTilemap(mymap, layersecondary);
    
    // this converts the polylines of the tiled - object layer into physics bodies.. make sure to use the "polyline" tool and not the "polygon" tool - otherwise it will not work!!
    /*these polyline physics bodies will not be visible - so make sure you paint your hills and slanted tiles on a layer that acts as background (without collision enabled) */
    layerobjects_tiles = game.physics.p2.convertCollisionObjects(mymap,"objects1");
    
    //this adds our player to the scene  (xposition, yposition, cachekey)
    player = game.add.sprite(150, 250, 'player');
    
    // enable physics for the player (p2)
    game.physics.p2.enable(player);
    player.body.bounce = 1;

    //use this if you want to see the shapes. This enables debugging for the body.
    //Remove in production!
    game.physics.p2.enable(player, true);
    
    // set the anchor to the exact middle of the player (good for flipping the image on the same place)
    player.anchor.setTo(0.5,0.5);
    
    // in p2 rotation is possible.. i don't want this on my player 
    player.body.fixedRotation = true;
    
    // camera will always center on the player
    game.camera.follow(player); 
    
    // instead of a rectangle I want a circle (radius, offsetX, offsetY)
    player.body.setCircle(100,0,0);

    // this adds our animations for later use (custom cachekey, frames used for the animation, frames played per second, loop )
    player.animations.add('walk', [0], 10, true);
    //player.animations.add('jump-left', [16], 10, true);
    //player.animations.add('jump-right', [17], 10, true);
    //player.animations.add('fall-left', [18], 10, true);
    //player.animations.add('fall-right', [19], 10, true);
    //player.animations.add('wallstick-left', [20], 10, true);
    //player.animations.add('wallstick-right', [21], 10, true);
    //player.animations.add('duck-left', [22], 10, true);
    //player.animations.add('duck-right', [23], 10, true);

    // we need some cursor keys for our controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    menuButton = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    // Make camera follow player
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
    
    /* Pop up window code */
    
    //  You can drag the pop-up window around
    popup = game.add.sprite(game.world.x, game.world.y, 'menu');
    popup.fixedToCamera = true;
    
    popup.alpha = 0.8;
    popup.scale.set(0.1); 
    //popup.anchor.set(0.5);
    //popup.inputEnabled = true;
    //popup.input.enableDrag();

    // Hide it until button is clicked
    popup.visible = false;

}

function update() {
    
    // this moves the background "hills" relative to the camera (with 20% of it's speed) and creates the well known parallax effect
    hills.x = game.camera.x * 0.2;
    
    // Resets player velocity every update
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.scale.x = -1;  // a little trick... flips the image to the left
        player.body.velocity.x = -MOVE_SPEED;
        
        if (isDucking) {
            player.animations.play('walk');
        }
        else {
            player.animations.play('walk');
        }
        facing = 'left';
    }
    else if (cursors.right.isDown) {
        player.scale.x = 1;
        player.body.velocity.x = MOVE_SPEED;
        
        if (isDucking) {
            player.animations.play('walk');
        }
        else {
            player.animations.play('walk');
        }
        facing = 'right';
    }
    else {
        player.animations.stop();
        player.scale.x = 1;

        if (facing == 'left') {
            if (isDucking) {
                player.frame = 0;
            }
            else {
                player.frame = 0;
            }
        }
        else {
            if (isDucking) {
                player.frame = 0;
            }
            else {
                player.frame = 0;
            }
        }
    }
    
    // Player ducks if they press down arrow
    if (touchingDown(player) && cursors.down.isDown) {
        isDucking = true;
        canJump = false;
        
        // Make box smaller when ducking
        setPlayerSize();
    }
    
    // Player stands when down arrow is released
    if (isDucking && cursors.down.isUp) {
        isDucking = false;
        canJump = true;
        
        // Make box larger when standing
        setPlayerSize();
    }
    
    // Player jumps if the jump button is pressed
    if (canJump && jumpButton.isDown && game.time.now > jumpTimer && ( touchingDown(player) /*|| player.body.onWall()*/)) {
        //if (player.body.touching.left || player.body.touching.right) {
        //    player.body.velocity.y = JUMP_HEIGHT * 0.65;
        //}
        //else {
        player.body.velocity.y = JUMP_HEIGHT;
        //}
        jumpTimer = game.time.now + 400;
    }

    // Jumping animation
    if (player.body.velocity.y < -50) {
        player.scale.x = 1;
        if (facing == 'left') {
            player.animations.play('walk');
        }
        else if (facing == 'right') {
            player.animations.play('walk');
        }
    }

    // Falling animation    
    if (player.body.velocity.y > 100) {
        player.scale.x = 1;
        if (facing == 'left') {
            player.animations.play('walk');
        }
        else if (facing == 'right') {
            player.animations.play('walk');
        }
    }
    
    // Sticking to walls animation
    //if (player.body.onWall()) {
    //    facing == 'left'? player.animations.play('wallstick-left') : player.animations.play('wallstick-right');
    //}
    
    if (menuButton.isDown) {
        if (popup.visible) {
            closeWindow();
        }
        else {
            openWindow();
        }
    }
}

/*
this function uses the p2 collision calculations that are done on every step to find out if the player collides with something on the bottom - it returns true if a collision is happening
*/
function touchingDown(someone) {
    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;
    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"
        if (c.bodyA === someone.body.data || c.bodyB === someone.body.data)        {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
            if (c.bodyA === someone.body.data) d *= -1;
            if (d > 0.5) result = true;
        }
    } return result;
}

function render () {

    //game.debug.body(player);
    //game.debug.bodyInfo(player, 16, 24);
    game.debug.text('isDucking:' + isDucking + 'Velocity Y:' + player.body.velocity.y, 16, 128);
    // Camera
    //game.debug.cameraInfo(game.camera, 32, 32);

}

function setPlayerSize() {
    if (isDucking) {
        player.body.setCircle(50, 0, 0);
    }
    else {
        player.body.setCircle(100, 0, 0);
    }
}

function openWindow() {

    if (tween !== null && tween.isRunning)
    {
        return;
    }
    
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    tween = game.add.tween(popup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    popup.visible = true;

}

function closeWindow() {

    if (tween && tween.isRunning)
    {
        return;
    }

    //  Create a tween that will close the window, but only if it's not already tweening or closed
    tween = game.add.tween(popup.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
    popup.visible = false;

}
