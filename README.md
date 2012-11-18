AI Sandbox - nodeJS client
==========================

Introduction
------------

This is a client for the networkClient of [AI Sandbox](http://aisandbox.com/).

**WARNING:** The API is not finished and will probably change in the future!

Usage example
-----

	var SandboxClient = require('./lib/sandboxClient.js');

	var client = new SandboxClient("myBotName");
	client.connect();

	// initial game- and levelinfo
	client.on('gameinfo',function(gameinfo)(
		console.log(gameinfo);
	);
	client.on('levelinfo',function(levelinfo)(
		console.log(levelinfo);
	);

	//tick call
	client.on('tick',function(tickdata)(
		console.log(tickdata);
	);

API
---

### SandboxClient#Constructor(commandername)

Use `commandername` to give the commander a name which is being send to the server.

### SandboxClient.connect()

Connects to the running AI Sandbox server on localhost:41041

### SandboxClient.defend(botname, facingDirection)

Sends the `bot` into defending position. Looking into the direction of `facingDirection`

Example:

	client.defend("bot0",[10,20]);

### SandboxClient.move(botname, targets)

Sends the bot to the given coordinates. `target` is can array of waypoints. The waypoints will be used in order.

Example:

	var coords = [
		[10,20],
		[15,25]
	];
	client.move("bot0",coords);

### SandboxClient.attack(botname, target, lookAt)

Will attack the given `target` coordinate, while looking towards `lookAt`

Example:

	client.attack("bot0",[10,10],[15,15]);

### SandboxClient.charge(botname, target)

Will make the `bot` run towards `target`

Example:

	client.charge("bot0",[10,10]);

### Event: tick

	function(tickdata){}

Contains the tickdata of the current tick.

See gameinfo Event for datasctructure

This event is fired about every 0.1s

### Event: gameinfo

	function(gameinfo){}

The initial gameinfo event. Fired once after initialization of game.

Data structure example:

	{ myTeam:
	   { name: 'Blue',
		 members: [ 'Blue0', 'Blue1', 'Blue2', 'Blue3', 'Blue4' ],
		 flagScoreLocation: [ 82, 20 ],
		 flag: 'BlueFlag',
		 botSpawnArea: [ [50,50], [100,100] ] },
	  enemyTeam:
	   { name: 'Red',
		 members: [ 'Red0', 'Red1', 'Red2', 'Red3', 'Red4' ],
		 flagScoreLocation: [ 6, 30 ],
		 flag: 'RedFlag',
		 botSpawnArea: [ [5,5], [10,10] ] },
	  flags:
	   { BlueFlag:
		  { position: [50, 50],
			carrier: null,
			name: 'BlueFlag',
			respawnTimer: 0.1,
			team: 'Blue' },
		 RedFlag:
		  { position: [10, 20],
			carrier: null,
			name: 'RedFlag',
			respawnTimer: 0.1,
			team: 'Red' } },
	  bots:
	   { Red3:
		  { seenBy: [],
			state: 0,
			health: 0,
			name: 'Red3',
			team: 'Red',
			visibleEnemies: [],
			position: null,
			flag: null,
			facingDirection: null,
			seenlast: null },
	   [...]
	   }
	}

### Event: levelinfo

	function(levelinfo){}

The initial levelinfo event. Fired once after initialization of game.

[See AI Sandbox Docs for Levelinfo](http://aisandbox.com/documentation/network.html#levelinfo)

### Event: shutdown

Fired once after finished game. Can be used for cleanup after game

