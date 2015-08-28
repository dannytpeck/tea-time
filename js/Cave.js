//CONSTANTS
var WIDTH = 800;
var HEIGHT = 600;
var MOVE_SPEED = 400;
var JUMP_HEIGHT = -700;
var GRAVITY = 1400; //1400

TeaTime.Cave = function (game) {
  
    this.hills;
    this.bg;
    this.exit;
    
};

TeaTime.Cave.prototype = {
    
    create: function () {
    
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = GRAVITY;

        this.bg = this.add.tileSprite(0, 0, 3200, 2400, 'tutorialcave');
    
        // now lets initialise the tilemap .. first we create a new tilemap and for further references we put it on "mymap"    (testmap is the cachekey given in the preload function - the cachekey was your own choice)
        this.mymap = this.add.tilemap('cave');
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
        //this.layermain_tiles = this.physics.p2.convertTilemap(this.mymap, this.layermain);
        //this.layersecondary = this.physics.p2.convertTilemap(this.mymap, this.layersecondary);
    
        // this converts the polylines of the tiled - object layer into physics bodies.. make sure to use the "polyline" tool and not the "polygon" tool - otherwise it will not work!!
        /*these polyline physics bodies will not be visible - so make sure you paint your hills and slanted tiles on a layer that acts as background (without collision enabled) */
        //this.layerobjects_tiles = this.physics.p2.convertCollisionObjects(this.mymap,"objects1");
        
        // set up start location and add player to the map
        var startX = 150;
        var startY = this.world.height - 400;
        this.player = new Player(this.game, startX, startY, 'slimegirl');
        this.game.add.existing(this.player);
    
        this.exit = this.add.sprite(32, 256, 'caveexit');
    
        // Menu Code
        //this.menuWindow = this.add.sprite(this.world.x + 200, this.world.y + 100, 'menu');
        //this.menuWindow.fixedToCamera = true;
        
        //this.menuWindow.alpha = 0.8;
        //this.menuWindow.anchor.set(0.5);
    
        // Hide it until button is clicked
        //this.menuWindow.visible = false;
        //this.menuWindow.scale.set(0.1); 
    
        // Add exit and enable physics so it can be "touched"
        this.exit = this.add.sprite(32, 256, 'caveexit');

        this.timeCheck = this.time.now;
    
    },

    update: function () {

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
