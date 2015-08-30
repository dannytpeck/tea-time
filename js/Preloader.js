TeaTime.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

TeaTime.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		this.background = this.add.sprite(0, 0, 'loadingScreen');
		this.background.animations.add('loadingAnimation', ['loadingscreen001', 'loadingscreen002', 'loadingscreen003', 'loadingscreen004', 
														    'loadingscreen005', 'loadingscreen006', 'loadingscreen007', 'loadingscreen008',
							                                'loadingscreen009', 'loadingscreen010', 'loadingscreen011', 'loadingscreen012', 
							                                'loadingscreen013', 'loadingscreen014', 'loadingscreen015', 'loadingscreen016'], 10, true);
		this.background.animations.play('loadingAnimation');


		//this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');


		// Load sfx
    	this.load.audio('squirm', ['audio/squirm.ogg']);

		
        // Load the json tilemaps created with tiled (cachekey, filename, type of tilemap parser)
        this.load.tilemap('cave', 'assets/cave.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('forest', 'assets/forest.json', null, Phaser.Tilemap.TILED_JSON);  

        // Load the tileset images used in tiled to create the map  (cachekey, filename)
        this.load.image('cave_tileset', 'assets/cave_tileset.png');

        this.load.image('menu', 'assets/menu window.png');

		// TEST 
    	this.load.image('trans', 'assets/climbwallup_001.png');
        
        // Load the background images
        this.load.image('tutorialcave', 'assets/Tutorial Cave.png');
        this.load.image('forestbg', 'assets/The Forest.png');

		// Load the exit images        
        this.load.image('caveexit', 'assets/tutorial-cave-exit.png');
        
		//  Phaser can load Texture Atlas files that use either JSON Hash or JSON Array format.
	    //  As with all load operations the first parameter is a unique key, which must be unique between all image files.
	    //  Next is the texture atlas itself, in this case slimegirl_animations.png
	    //  Finally is the path to the JSON file that goes with the atlas.
	    //  Note that the JSON file should be saved with UTF-8 encoding or some browsers (such as Firefox) won't load it.
	
	    this.load.atlas('slimegirl', 'assets/sprites/sganimations.png', 'assets/sprites/sganimations.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);        

	},

	create: function () {
	    this.textStyle = { font: "48px bubblegumregular", fill: "#05F08A", wordWrap: true, wordWrapWidth: 800, align: "center" };
	    this.text = this.game.add.text(0, 0, "Tea Time", this.textStyle);
	    this.text.setText("Tea Time");
	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.ready == false)
		{
			this.ready = true;
			//this.state.start('MainMenu');
			this.state.start('Cave');
		}

	}

};
