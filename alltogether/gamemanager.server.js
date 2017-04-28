/*
	could add:
		**A better syncing

	Currently at: socks[i].on('keypress'.... (taking input from clients & buffering the game & sending to others)
*/


let l = s => console.log(s);
Game = require('./game.core.server.js');

// how often to update the clients on gamestate
let syncStateIvlSpeed = 50;
let gameStartWaitTime = 1000;

module.exports = function(socks, io) {
	// setup the game (but don't start it)
		let game = new Game(storeState);
		// socks[i] is t/r/b/l
		let positions = ['t', 'r', 'b', 'l'];

	// put all the sockets in a room together
	// and setup the client->server interaction
	// also tell them their positions
		let room = socks[0].id;
		for (let i=0; i<socks.length; i++) {
			socks[i].join(room);

			// add keypresses to the game's input buffer
			// & tell everyone else
			socks[i].on('keypress', function(keydata) {
				keydata.player = positions[socks.indexOf(this)];
				socks[i].broadcast.in(room).emit('keypress', keydata);
				game.move(keydata.player, keydata.dir, keydata.time, keydata.upordown);
			});
			// tell people what position they are
			socks[i].emit('position', positions[i]);
		}

	// determine a time for everyone to start & go
		let startTime = Date.now() + gameStartWaitTime;
		setTimeout(startGame, startTime - Date.now());
		io.in(room).emit('gameStartAt', startTime);
		l("game starting in " + (startTime - Date.now())/1000 + " seconds");

	//********************************************//

		function startGame() {
			game.startGame();
			let syncStateIvl = setInterval(syncState, syncStateIvlSpeed);
		}

		// game.core.js calls the callback really fast, so just save the state
		let storedState;
		function storeState(state) { storedState = state; }

		//**A add a time with it, so the client can calculate how old the message is.
		// override the client's state (though they should agree)
		function syncState() {
			io.in(room).emit('stateUpdate', storedState);
		}
};

