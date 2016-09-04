/* globals TeaTime, Phaser */
TeaTime.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

TeaTime.Preloader.prototype = {

	preload: function () {
	
		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');
	
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);
	
		//	Here we load the rest of the assets our game needs.
		//this.load.image('titlepage', 'images/title.jpg');
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		//this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
	
	
		// My Assets
		
    // Load the json tilemaps created with tiled (cachekey, filename, type of tilemap parser)
    this.load.tilemap('testmap', 'assets/test-tilemap-polygon.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('forest', 'assets/forest.json', null, Phaser.Tilemap.TILED_JSON);  

    // Load the tileset images used in tiled to create the map  (cachekey, filename)
    this.load.image('test-tileset', 'assets/test-tileset.png');

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

    this.load.atlas('slimegirl', 'assets/sprites/slimegirl_animations.png', 'assets/sprites/slimegirl_animations.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);        

	},
	
	create: function () {
	
		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
	
	},
	
	update: function () {
	
		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		{
			this.ready = true;
			//this.state.start('MainMenu');
			this.state.start('Cave');
		}
	
	}

};