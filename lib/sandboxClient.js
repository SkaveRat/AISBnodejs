var SandboxClient = (function(){

	var socket;
	var port = 41041;
	var host = '127.0.0.1';

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

		socket.on('connect',function(){
			console.log("Conecting to server...");
		});

		socket.on('data',_handleData);

		socket.connect(port,host);
	}

	function _handleData(data) {
		var dataLines = data.toString().split('\n');
		var command = dataLines.shift();

		console.info("Received command " + command);

		switch (command) {
			case '<connect>':
				_sendConnectString();
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

	function _sendConnectString() {
		console.log("Sending connect string");
		var data = [];
		data.push("<connect>");
		data.push(JSON.stringify(clientData));
		_send(data);
	}
})();

module.exports.SandboxClient = SandboxClient;