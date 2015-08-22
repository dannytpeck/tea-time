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
    
    game.load.image('background', 'assets/sky.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('wall', 'assets/wall.png');

}

var bg;
var map;
var layer;

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var platforms;
var isDucking = false;

function create() {

    // Enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level1');
    
    map.addTilesetImage('tiles-1');
    
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    
    layer = map.createLayer('Tile Layer 1');
    
    // Uncomment to see collision tiles
    layer.debug = true;
    
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

    // Make camera follow player
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
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
    
    if (player.body.onFloor() && cursors.down.isDown) {
        //Duck!
        isDucking = true;
    }
    
    if (cursors.down.isUp) {
        isDucking = false;
    }
    
    if (jumpButton.isDown && game.time.now > jumpTimer && (player.body.onFloor() || player.body.onWall())) {
    //if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
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
    
    if (player.body.touching.left) {
        player.animations.play('wallstick-left');
    }
    
    if (player.body.touching.right) {
        player.animations.play('wallstick-right');
    }
    
    // Make smaller if ducking
    setPlayerSize();
    
}

function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    game.debug.body(player);
    game.debug.bodyInfo(player, 16, 24);
    game.debug.text('isDucking:' + isDucking, 16, 128);

}

function setPlayerSize() {
    if (isDucking) {
        player.body.setSize(36, 22, 3, 37);
    }
    else {
        player.body.setSize(36, 54, 3, 5);
    }
}
