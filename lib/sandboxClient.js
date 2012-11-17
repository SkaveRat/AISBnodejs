var events = require('events');
var sys = require('sys');

SandboxClient = (function(){
	var socket;
	var port = 41041;
	var host = '127.0.0.1';
	var self;

	var clientData = {
		"__class__": "ConnectClient",
		"__value__": {
			"language": "node.js",
			"commanderName": "testCommander"
		}
	};

	/**
	 * @Constructor
	 */
	return function(socketIn) {
		socket = socketIn;
		self = this;

		events.EventEmitter.call(this);

		socket.on('connect',function(){
			console.log("Conecting to server...");
		});

		socket.on('data',_handleData);

		return {
			'connect': connect,
			'defend': defend,
			'move': move,
			'attack': attack,
			'charge': charge
		}

	}

	function defend(bot, facingDirection) {
		var data = [];
		data.push('<command>');
		var commandData = {
			"__class__": "Defend",
			"__value__": {
				"facingDirection": facingDirection,
				"bot": bot,
				"description": ""
			}
		};

		data.push(JSON.stringify(commandData));
		_send(data);
	}

	function attack(bot, target, lookAt) {
		var data = [];
		data.push('<command>');
		var commandData = {
			"__class__": "Attack",
			"__value__": {
				"lookAt": lookAt,
				"bot": bot,
				"target": [target],
				"description": ""
			}
		};
		data.push(commandData);
		_send(commandData);
	}

	function charge(bot, target) {
		var data = [];
		data.push('<command>');
		var commandData = {
			"__class__": "Charge",
			"__value__": {
				"bot": bot,
				"target": [target],
				"description": ""
			}
		};
		data.push(commandData);
		_send(data);
	}

	function move(bot, target) {
		var data = [];
		data.push('<command>');
		var commandData = {
			"__class__": "Move",
			"__value__": {
				"bot": bot,
				"target": [target],
				"description": ""
			}
		};
		data.push(commandData);
		_send(data);
	}

	function connect() {
		socket.connect(port,host);
	}

	function _handleData(data) {
		var dataLines = data.toString().split('\n');
		dataLines.pop(); // remove last empty item
		var command = dataLines.shift();

		console.info("Received command " + command);

		switch (command) {
			case '<connect>':
				_sendConnectString();
				break;
			case '<initialize>':
				_handleInitialize(dataLines);
				break;
			case '<tick>':
				_handleTick(dataLines);
				break;
			case '<shutdown>':
				_handleShutdown();
				break;
			default:
				console.error("ERROR: unexpected command: " + command);
		}
	}

	function _send(lines) {
		var data;
		if(lines instanceof Array)
			data = lines.join("\n",lines);
		data += "\n";
		console.log("SENT ---\n"+data+"\n---");
		socket.write(data);
	}

	function _handleShutdown() {
		self.emit('shutdown');
	}

	function _handleTick(tickData) {
		var rawObject = JSON.parse(tickData);
		self.emit('tick',rawObject.__value__);
	}

	function _handleInitialize(initializeData) {
		initializeData.forEach(function(rawData) {
			var rawObject = JSON.parse(rawData);
			if(rawObject.__class__ == "LevelInfo")
				self.emit('levelinfo',rawObject.__value__);
			if(rawObject.__class__ == "GameInfo")
				self.emit('gameinfo',rawObject.__value__);
		});
	}

	function _sendConnectString() {
		console.log("Sending connect string");
		var data = [];
		data.push("<connect>");
		data.push(JSON.stringify(clientData));
		_send(data);
	}
})();

sys.inherits(SandboxClient,events.EventEmitter);
module.exports.SandboxClient = SandboxClient;