var events = require('events');
var net = require('net');

var socket = net.Socket();
var port = 41041;
var host = '127.0.0.1';
var self;

var clientData = {
	"__class__": "ConnectClient",
	"__value__": {
		"language": "node.js",
		"commanderName": null
	}
};

socket.on('connect',function(){
	console.log("Connecting to server...");
});

function _convertTeamData(teamName, teamData) {
	teamData = teamData.__value__;
	return {
		"name": teamName,
		"members": teamData.members,
		"flagScoreLocation": teamData.flagScoreLocation,
		"flag": teamData.flag,
		"botSpawnArea": teamData.botSpawnArea
	}
}

function _convertFlagData(flagName, rawGameinfo) {
	return {
		"position": rawGameinfo.flags[flagName].__value__.position,
		"carrier": rawGameinfo.flags[flagName].__value__.carrier,
		"name": rawGameinfo.flags[flagName].__value__.name,
		"respawnTimer": rawGameinfo.flags[flagName].__value__.respawnTimer,
		"team": rawGameinfo.flags[flagName].__value__.team
	}
}


function _getConvertedBots(rawGameinfo) {
	var bots = rawGameinfo.bots;
	var botHash = {};
	Object.keys(bots).forEach(function(botName) {
		botHash[botName] = bots[botName].__value__;
	});
	return botHash;
}

function _convertGameInfo(rawGameinfo) {
	var myTeamName = rawGameinfo.team;
	var enemyTeamName = rawGameinfo.enemyTeam;
	var myTeamData = rawGameinfo.teams[myTeamName];
	var enemyTeamData = rawGameinfo.teams[enemyTeamName];
	var info = {
		"myTeam": _convertTeamData(myTeamName, myTeamData),
		"enemyTeam": _convertTeamData(enemyTeamName, enemyTeamData),
		"flags": {
			"BlueFlag": _convertFlagData("BlueFlag",rawGameinfo),
			"RedFlag": _convertFlagData("RedFlag",rawGameinfo)
		},
		"bots": _getConvertedBots(rawGameinfo)

	};
	return info;
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

function _handleShutdown() {
	self.emit('shutdown');
}

function _handleTick(tickData) {
	var rawObject = JSON.parse(tickData);
	self.emit('tick',_convertGameInfo(rawObject.__value__));
}


function _send(lines) {
	var data = "";
	if(lines instanceof Array)
	{
		data += lines.shift() + "\n";
		lines.forEach(function(line){
			data += JSON.stringify(line) + "\n";
		});

	}
	console.log("SENT ---\n"+data+"---");
	socket.write(data);
}

function _handleInitialize(initializeData) {
	initializeData.forEach(function(rawData) {
		var rawObject = JSON.parse(rawData);
		if(rawObject.__class__ == "LevelInfo")
			self.emit('levelinfo',rawObject.__value__);
		if(rawObject.__class__ == "GameInfo")
			self.emit('gameinfo',_convertGameInfo(rawObject.__value__));
	});
}

function _sendConnectString() {
	console.log("Sending connect string");
	var data = [];
	data.push("<connect>");
	data.push(clientData);
	_send(data);
}

function SandboxClient(botname) {
	clientData.__value__.commanderName = botname;

	events.EventEmitter.call(this);
	self = this;

	socket.on('data',_handleData);
}

SandboxClient.super_ = events.EventEmitter;
SandboxClient.prototype = Object.create(events.EventEmitter.prototype, {
	constructor: {
		value: SandboxClient,
		enumerable: false
	}
});



SandboxClient.prototype.attack = function(bot, target, lookAt) {
	var data = [];
	data.push('<command>');
	var commandData = {
		"__class__": "Attack",
		"__value__": {
			"lookAt": lookAt,
			"bot": bot,
			"target": target,
			"description": ""
		}
	};
	data.push(commandData);
	_send(commandData);
}

SandboxClient.prototype.defend = function(bot, facingDirection) {
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

SandboxClient.prototype.move = function(bot, target) {
	var data = [];
	data.push('<command>');
	var commandData = {
		"__class__": "Move",
		"__value__": {
			"bot": bot,
			"target": target,
			"description": ""
		}
	};
	data.push(commandData);
	_send(data);
}

SandboxClient.prototype.charge = function(bot, target) {
	var data = [];
	data.push('<command>');
	var commandData = {
		"__class__": "Charge",
		"__value__": {
			"bot": bot,
			"target": target,
			"description": ""
		}
	};
	data.push(commandData);
	_send(data);
}


SandboxClient.prototype.connect = function() {
	socket.connect(port,host);
}

module.exports = SandboxClient;