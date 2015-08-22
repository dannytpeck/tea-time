var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 200;
var JUMP_HEIGHT = -700;
var GRAVITY = 1500;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('player', 'assets/slimegirl.png', 42, 64);    
    game.load.image('sky', 'assets/sky.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('wall', 'assets/wall.png');

}

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var platforms;

function create() {

    // We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Draw background(sky) on the screen
    //game.add.sprite(0, 0, 'sky');
    
    game.add.tileSprite(0, 0, 1600, 600, 'sky');
    game.world.setBounds(0, 0, 1600, 600);
    
    // The player and its settings
    player = game.add.sprite(32, game.world.height - 100, 'player');
    
    // Enable physics on the player
    game.physics.arcade.enable(player);

    // Player physics properties. (Give a little bounce)
    player.body.gravity.y = GRAVITY;
    player.body.maxVelocity.y = 500;
    player.body.collideWorldBounds = true;
    
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

    // The platforms group contains the ground and the ledges the player can jump on
    platforms = game.add.group();
    
    // Enable physics for any object that is created in this group
    platforms.enableBody = true;
    
    // Create the ground
    var ground = platforms.create(0, game.world.height - 32, 'platform');
    
    // Scale it to fit the width of the game (the original sprite is 400x32)
    ground.scale.setTo(4, 1); //width multiplier, height multiplier
    
    // This stops the ground from falling away when its jumped on
    ground.body.immovable = true;

    // Create ledges and walls
    var ledge = platforms.create(400, 400, 'platform');
    ledge.body.immovable = true;
    ledge = platforms.create(-120, 250, 'platform');
    ledge.body.immovable = true;
    ledge = platforms.create(800, 0, 'wall');
    ledge.body.immovable = true;
    
    // Our controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Make camera follow player
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
}

function update() {
    
    // Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);
    
    // Reset the player's velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        // Move to the left
        player.body.velocity.x = -MOVE_SPEED;
        
        player.animations.play('left');
        facing = 'left';
    }
    else if (cursors.right.isDown) {
        // Move to the right
        player.body.velocity.x = MOVE_SPEED;
        
        player.animations.play('right');
        facing = 'right';
    }
    else {
        player.animations.stop();

        if (facing == 'left') {
            player.frame = 0;
        }
        else {
            player.frame = 8;
        }
    }
    
    if (player.body.touching.down && cursors.down.isDown) {
        //Duck!
        player.body.velocity.x = 0;
        
        if (facing == 'left') {
            player.animations.play('duck-left');
        }
        else if (facing == 'right') {
            player.animations.play('duck-right');
        }
    }
    
    if (jumpButton.isDown && game.time.now > jumpTimer && (player.body.touching.down || player.body.touching.left || player.body.touching.right)) {
        if (player.body.touching.left || player.body.touching.right) {
            player.body.velocity.y = JUMP_HEIGHT * 0.65;
        }
        else {
            player.body.velocity.y = JUMP_HEIGHT;
        }
        jumpTimer = game.time.now + 400;
    }

    // Falling animation    
    if (player.body.velocity.y < 0) {
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
}

function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    game.debug.bodyInfo(player, 16, 24);

}