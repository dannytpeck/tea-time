var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 200;
var JUMP_HEIGHT = -700;
var GRAVITY = 1500;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    
    game.load.spritesheet('player', 'assets/slimegirl.png', 42, 64);    
    
    game.load.image('background', 'assets/beginningcavebg.png');
    game.load.image('menu', 'assets/menu window.png');

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

function create() {

    // Enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level1');
    
    map.addTilesetImage('tiles-1');
    
    map.setCollisionByExclusion([ 13, 14, 15, 16, 17, 46, 47, 48, 49, 50, 51 ]);
    
    layer = map.createLayer('Tile Layer 1');
    
    // Uncomment to see collision tiles
    // layer.debug = true;
    
    layer.resizeWorld();
    
    game.physics.arcade.gravity.y = GRAVITY;
    
    // The player and its settings
    player = game.add.sprite(32, 32, 'player');
    
    // Enable physics on the player
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // Player physics properties
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    setPlayerSize();

    // Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11, 12, 13, 14, 15], 10, true);
    player.animations.add('jump-left', [16], 10, true);
    player.animations.add('jump-right', [17], 10, true);
    player.animations.add('fall-left', [18], 10, true);
    player.animations.add('fall-right', [19], 10, true);
    player.animations.add('wallstick-left', [20], 10, true);
    player.animations.add('wallstick-right', [21], 10, true);
    player.animations.add('duck-left', [22], 10, true);
    player.animations.add('duck-right', [23], 10, true);

    // Our controls
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
    
    // Collide the player with the layer
    game.physics.arcade.collide(player, layer);
    
    // Reset the player's velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        // Move to the left
        player.body.velocity.x = -MOVE_SPEED;
        
        if (isDucking) {
            player.animations.play('duck-left');
        }
        else {
            player.animations.play('left');
        }
        facing = 'left';
    }
    else if (cursors.right.isDown) {
        // Move to the right
        player.body.velocity.x = MOVE_SPEED;
        
        if (isDucking) {
            player.animations.play('duck-right');
        }
        else {
            player.animations.play('right');
        }
        facing = 'right';
    }
    else {
        player.animations.stop();

        if (facing == 'left') {
            if (isDucking) {
                player.frame = 22;
            }
            else {
                player.frame = 0;
            }
        }
        else {
            if (isDucking) {
                player.frame = 23;
            }
            else {
                player.frame = 8;
            }
        }
    }
    
    // Player ducks if they press down arrow
    if (player.body.onFloor() && cursors.down.isDown) {
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
    if (canJump && jumpButton.isDown && game.time.now > jumpTimer && (player.body.onFloor() || player.body.onWall())) {
        if (player.body.touching.left || player.body.touching.right) {
            player.body.velocity.y = JUMP_HEIGHT * 0.65;
        }
        else {
            player.body.velocity.y = JUMP_HEIGHT;
        }
        jumpTimer = game.time.now + 400;
    }

    // Jumping animation
    if (player.body.velocity.y < -50) {
        if (facing == 'left') {
            player.animations.play('jump-left');
        }
        else if (facing == 'right') {
            player.animations.play('jump-right');
        }
    }

    // Falling animation    
    if (player.body.velocity.y > 0) {
        if (facing == 'left') {
            player.animations.play('fall-left');
        }
        else if (facing == 'right') {
            player.animations.play('fall-right');
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

function render () {

    //game.debug.body(player);
    //game.debug.bodyInfo(player, 16, 24);
    //game.debug.text('isDucking:' + isDucking, 16, 128);
    // Camera
    game.debug.cameraInfo(game.camera, 32, 32);

}

function setPlayerSize() {
    if (isDucking) {
        player.body.setSize(42, 32, 0, 32);
    }
    else {
        player.body.setSize(42, 64, 0, 0);
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
