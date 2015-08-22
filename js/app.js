var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 150;
var JUMP_SPEED = -700;
var GRAVITY = 1500;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('sky', 'assets/sky.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.spritesheet('player', 'assets/slimegirl.png', 42, 64);

}

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var platforms;
var jumping;
var jumps;
    
function create() {

    // We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Draw background(sky) on the screen
    game.add.sprite(0, 0, 'sky');
    
    // The platforms group contains the ground and the ledges the player can jump on
    platforms = game.add.group();
    
    // Enable physics for any object that is created in this group
    platforms.enableBody = true;
    
    // Create the ground
    var ground = platforms.create(0, game.world.height - 32, 'platform');
    
    // Scale it to fit the width of the game (the original sprite is 400x32)
    ground.scale.setTo(2, 1); //width multiplier, height multiplier
    
    // This stops the ground from falling away when its jumped on
    ground.body.immovable = true;

    // Create two ledges
    var ledge = platforms.create(400, 400, 'platform');
    ledge.body.immovable = true;
    ledge = platforms.create(-150, 250, 'platform');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 100, 'player');
    
    // Enable physics on the player
    //game.physics.arcade.enable(player);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // Player physics properties. (Give a little bounce)
    player.body.bounce.y = 0.2;
    player.body.gravity.y = GRAVITY;
    player.body.maxVelocity.y = 500;
    player.body.collideWorldBounds = true;
    
    // Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11, 12, 13, 14, 15], 10, true);
    
    // Our controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    // Flag to track if the jump button is pressed
    jumping = false;
    
}

function update() {
    
    // Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);
    
    // Reset the player's velocity (movement)
    player.body.velocity.x = 0;
    
    if (cursors.left.isDown) {
        // Move to the left
        player.body.velocity.x = -MOVE_SPEED;
        
        if (facing != 'left') {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown) {
        // Move to the right
        player.body.velocity.x = MOVE_SPEED;
        
        if (facing != 'right') {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 8;
            }

            facing = 'idle';
        }
    }
    
    // Allow the player to jump if they are touching the ground
    //if (jumpButton.isDown && player.body.touching.down && game.time.now > jumpTimer) {
    //    player.body.velocity.y = JUMP_HEIGHT;
    //    jumpTimer = game.time.now + 750;
   // }
    
    // Set a variable that is true when the player is touching the ground
    var onTheGround = player.body.touching.down;
    
    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        jumps = 2;
        jumping = false;
    }
    
    // Jump!
    if (jumps > 0 && jumpButtonIsActive(5)) {
        player.body.velocity.y = JUMP_SPEED;
        jumping = true;
    }
    
    console.log(jumping);
    
    // Reduce the number of available jumps if the jump input is released
    if (jumping && jumpButtonReleased) {
        jumps--;
        jumping = false;
    }    
    
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
var jumpButtonIsActive = function(duration) {
    var isActive = false;

    isActive = game.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, duration);

    return isActive;
};

// This function returns true when the player releases the "jump" control
var jumpButtonReleased = function() {
    var released = false;

    released = game.input.keyboard.upDuration(Phaser.Keyboard.SPACEBAR);

    return released;
};
