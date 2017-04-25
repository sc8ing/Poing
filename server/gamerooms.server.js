let l = s => console.log(s);
GameManager = require('./gamemanager.server.js');

// how many players to start a game with
let numPlayers = 2;

module.exports = function(io) {
	let wl = []; // essentially a queue (waitlist), used before game start to match players

	io.on('connection', function(socket) {
		wl.push(socket);

		l("io connection");
		l("\twaitlist length: " + wl.length);

		if (wl.length >= numPlayers)
			startGame(wl.splice(0, numPlayers));

		socket.on('disconnect', function() {
			// remove empty socket from waitlist
			if (wl.indexOf(socket) > -1)
				wl.splice(wl.indexOf(socket), 1);

			l("io disconnect");
			l("\twaitlist length: " + wl.length);
		});
	});

	function startGame(socks) {
		l("found enough players, starting new game");
		let gameManager = new GameManager(socks, io);
	}
};
