//CONSTANTS
var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 400;
var JUMP_HEIGHT = -700;
var GRAVITY = 1400; //1400

TeaTime.Cave = function (game) {
  
    this.exit;
    
};

TeaTime.Cave.prototype = {
    
    create: function () {
    
        this.physics.startSystem(Phaser.Physics.ARCADE);
        // this.physics.arcade.gravity.y = GRAVITY;
        // 40 works well
        this.physics.arcade.TILE_BIAS = 40;

        //this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'tutorialcave');
        this.game.stage.backgroundColor = '#27066A';
    
        this.mymap = this.add.tilemap('cave');
        this.mymap.addTilesetImage('cave_tileset');
        
        this.layermain = this.mymap.createLayer('layer1');
        this.layersecondary = this.mymap.createLayer('layer2');
        this.layertertiary = this.mymap.createLayer('layer3');
        this.layermain.resizeWorld();
        
        //this.mymap.setCollisionByExclusion([20], true, 'layer1');
        this.mymap.setCollisionBetween(0, 20, true, 'layer1');

        // set up start location and add player to the map
        var startX = 850;
        var startY = this.world.height - 800;
        this.player = new Player(this.game, startX, startY, 'slimegirl');
        this.game.world.addAt(this.player, 1); // on layer 1, behind layer 2
    
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
        
        // Makes every tile in the tilemap able to be jumped up through
        /*
        this.mymap.forEach(function (t) { 
            if (t) { 
                t.collideDown = false;
            }
        }, this.game, 0, 0, this.mymap.width, this.mymap.height, this.layermain);
        */
    },

    update: function () {
        this.physics.arcade.collide(this.player, this.layermain);

        //If player presses Up while crouching, stand up
        if (!this.player.immobile && this.player.states.crouching && this.player.cursors.up.isDown && !this.tileIsAbovePlayer()) {
            this.player.states.crouching = false;
            this.player.setPlayerSize();
        }
        
    },

    tileIsAbovePlayer: function () {
        return this.mymap.getTileWorldXY(this.player.body.x, this.player.body.y - 1, 64, 64, this.layermain) !== null ||
               this.mymap.getTileWorldXY(this.player.body.x + 31, this.player.body.y - 1, 64, 64, this.layermain) !== null ||
               this.mymap.getTileWorldXY(this.player.body.x + 62, this.player.body.y - 1, 64, 64, this.layermain) !== null ||
               this.mymap.getTileWorldXY(this.player.body.x + 93, this.player.body.y - 1, 64, 64, this.layermain) !== null ||
               this.mymap.getTileWorldXY(this.player.body.x + 125, this.player.body.y - 1, 64, 64, this.layermain) !== null;
    },

    loadForest: function () {
        this.state.start('Forest');
    },

    quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

    }
            
};
