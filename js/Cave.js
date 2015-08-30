//CONSTANTS
var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 400;
var JUMP_HEIGHT = -700;
var GRAVITY = 1400; //1400

TeaTime.Cave = function (game) {
  
    this.hills;
    this.exit;
    
};

TeaTime.Cave.prototype = {
    
    create: function () {
    
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = GRAVITY;

        //this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'tutorialcave');
        this.game.stage.backgroundColor = '#27066A';
    
        this.mymap = this.add.tilemap('cave');
        this.mymap.addTilesetImage('cave_tileset');
        
        this.layermain = this.mymap.createLayer('layer1');
        this.layersecondary = this.mymap.createLayer('layer2');
        this.layertertiary = this.mymap.createLayer('layer3');
        this.layermain.resizeWorld();
        
        this.mymap.setCollisionByExclusion([0],true, 'layer1');
        //this.mymap.setCollisionBetween(1,20,true,'layer2');

                /*
                
                var Map = function(game, key, tileWidth, tileHeight, width, height) {  
                  Phaser.Tilemap.call(this, game, key, tileWidth, tileHeight, width, height);
                  
                this.addTilesetImage('gameSpriteSheet');
                
                
                var ground = this.createLayer('ground'); // This is layer index '0'
                ground.resizeWorld();
                
                this.createLayer('roads'); // layer index 1
                
                // player should go here at layer index 2
                
                var buildings = this.createLayer('buildings'); // layer index 3
                this.setCollisionByExclusion([], true, buildings);
                
                var trees = this.createLayer('trees'); // etc.
                };
                
                */

        // set up start location and add player to the map
        var startX = 850;
        var startY = this.world.height - 800;
        this.player = new Player(this.game, startX, startY, 'slimegirl');
        //this.game.add.existing(this.player);
        this.game.world.addAt(this.player, 2); // this is above the ground elements and below the buildings and trees
    
        // Add exit and enable physics so it can be "touched"
        this.exit = this.add.sprite(32, 256, 'caveexit');

    },

    update: function () {
        this.physics.arcade.collide(this.player, this.layermain);
    },

    render: function() {

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
