var l = s => console.log(s);

// func(state) called after each update loop
// bw & bh are board height and width (required)
function Game(func, bw, bh) { 
// ops
	let ops = {
		gameSpeed: 1, // how fast to set the main game loop
		scorePauseLength: 3000, // how long to pause the game after scoring
		board: { width: 500, height: 300 },
		ball: { r: 25, v: { x: 0, y: 130 } },
		paddle: { length: 100, thick: 24, speed: 200 }
	};
	// takes the distance from center of paddle -> new x/y speed (parallel to wall)
	// length is the length of the paddle
	let velocityChange = (offset, length) => (offset / (length/2)) * 200;

// data
	let callbackFunc = func;
	this.state = initialState();
	this.mainInterval;
	
	// holds { player, dir, time, uod }
	// for each input by clients
	this.inputs = []; 

	this.gamePaused = true; // inputs not accepted unless false

// start the game when called
	this.startGame = () => {
		console.log("starting game (Game.startGame())");
		this.gamePaused = false;
		this.then = Date.now();
		this.now = Date.now();
		this.mainInterval = setInterval(main, ops.gameSpeed);
	};

	let startGame = this.startGame;

// update
	let update = (delta) => {
		if (isNaN(delta)) delta = 0; // something weird's going on
		let inputs = this.inputs;
		// the players' paddles
		let lt = this.state.left;
		let rt = this.state.right;
		let tp = this.state.top;
		let btm = this.state.bottom;

	// ball update
		let b = this.state.ball;

		// left paddle (includes corners)
		if (b.x-b.r < lt.thick && b.x > lt.thick
			&& b.y + b.r >= lt.o
			&& b.y - b.r <= lt.o + lt.length) {
				b.x = lt.thick + b.r;
				b.v.x *= -1;
				b.v.y = velocityChange(b.y - (lt.o+lt.length/2), lt.length);
		}
		// top paddle
		else if (b.y-b.r < tp.thick && b.y > tp.thick
			&& b.x+b.r >= this.state.board.w - tp.o - tp.length
			&& b.x-b.r <= this.state.board.w - tp.o) {
				b.y = b.r + tp.thick;
				b.v.y *= -1;
				b.v.x = velocityChange(b.x - (tp.o+tp.length/2), tp.length);
		}
		//right paddle
		else if (b.x+b.r > this.state.board.w - rt.thick && b.x < this.state.board.w - rt.thick
			&& b.y-b.r <= this.state.board.h - rt.o
			&& b.y+b.r >= this.state.board.h - rt.o - rt.length) {
				b.x = this.state.board.w - b.r-rt.thick;
				b.v.x *= -1;
				b.v.y = velocityChange(b.y - (this.state.board.h - (rt.o+rt.length/2)), rt.length);
		}
		//bottom paddle
		else if (b.y+b.r > this.state.board.h-btm.thick && b.y < this.state.board.h - btm.thick
			&& b.x+b.r >= btm.o
			&& b.x-b.r <= btm.o + btm.length) {
				b.y = this.state.board.h - b.r - btm.thick;
				b.v.y *= -1;
				b.v.x = velocityChange(b.x - (btm.o+btm.length/2), btm.length);
		}
		
		// scoring
		if (b.x + b.r < 0) score(this.state.left);
		else if (b.x - b.r > this.state.board.w) score(this.state.right);
		else if (b.y + b.r < 0) score(this.state.top);
		else if (b.y - b.r > this.state.board.w) score(this.state.bottom);

		b.x += delta * b.v.x;
		b.y += delta * b.v.y;

	//player update
		if (inputs.length > 0) 
		for (let i=0; i<inputs.length; i++) {
			// we're looking for down/up pairs, & all downs are going to have
			// index < that of their corresponding up, so skip the ups
			// (they've already been done)
			if (inputs[i].uod == "up") {
				if (i == 0) inputs.splice(0, 1);
				continue
			}
			
			// check for corresponding "up" key later in the array
			let hasUp = false;
			for (let j=i; j<inputs.length; j++) {
				if (inputs[j].player == inputs[i].player
					&& inputs[j].dir == inputs[i].dir
					&& inputs[j].uod == "up") {
						hasUp = inputs[j];
						break;
				}
			}
			// delta (time between down & up||now for this key)
			let dta = (hasUp ? hasUp.time : Date.now()) - inputs[i].time;

			let pl; // player
			let comp; // side of board to check boundaries against
			switch(inputs[i].player) { // (same as inputs[j].player)
				case 'l': pl = this.state.left; comp = this.state.board.h; break;
				case 'r': pl = this.state.right; comp = this.state.board.h; break;
				case 't': pl = this.state.top; comp = this.state.board.w; break;
				case 'b': pl = this.state.bottom; comp = this.state.board.w; break;
				default: console.log("error in gc input processing, input:", inputs[i]);break;
			}

			// actually move (change the local state)
			if (inputs[i].dir == "left") pl.o -= pl.speed * delta;
			else pl.o += pl.speed * delta;

			// and check for boundaries
			let pastBoundary = true;
			if (pl.o < 0) { pl.o = 0; }
			else if (pl.o + pl.length > comp) { pl.o = comp - pl.length; }
			else pastBoundary = false;
			
			// delete used data
			if (hasUp) {
				inputs.splice(i, 1); // delete the down
				inputs.splice(inputs.indexOf(hasUp), 1); // and the up
			} else {
				inputs[i].time = Date.now();
				if (pastBoundary) inputs.splice(i, 1); // otherwise it gets stuck
			}
		}
	}
	let dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1,2));


	function initialState() {
		let bw = ops.board.width;
		let bh = ops.board.height;
		return {
			ball: startBall(bw/2, bh/2),
			left: new Player(bh/2-ops.paddle.length/2),
			top: new Player(bw/2-ops.paddle.length/2),
			right: new Player(bw/2-ops.paddle.length/2),
			bottom: new Player(bw/2-ops.paddle.length/2),
			board: { w: bw,  h: bh },
			score: { player: null, justScored: false }
		}
	}

	function startBall(x, y) {
		if (this.state)
			return new Ball(this.state.board.w/2, this.state.board.w/2);
		else
			return new Ball(x, y);
	}

	function Player(o) { // o is offset (left is 0, relative to position)
		this.o = o;
		this.length = ops.paddle.length;
		this.thick = ops.paddle.thick;
		this.speed = ops.paddle.speed;
		this.score = 0;
	}

	function Ball(x, y) {
		this.x = x;
		this.y = y;
		this.r = ops.ball.r;
		this.v = { x: ops.ball.v.x, y: ops.ball.v.y };
	}
	this.Ball = Ball;
	
	// when the ball goes off the screen, update calls score(state.[sideOff])
	// note this is really more like "lose()"; the game's scoring is kind of like golf's
	let score = pl => {
		this.state.score.justScored = true;
		let player;
		switch(pl) {
				case this.state.left: player = 'l'; break;
				case this.state.right: player = 'r'; break;
				case this.state.top: player = 't'; break;
				case this.state.bottom: player = 'b'; break;

		}
		this.state.score.player = player;
	}

	let main = () => {
		this.now = Date.now();
		delta = this.now - this.then;
		update(delta / 1000);
		callbackFunc(this.state);
		this.then = this.now;
	}
}

// called by client/server when user input
// player is l/r/t/b; dir is 'left' or 'right'; time is time pressed, uod is up or down press
Game.prototype.pause = function() {
	clearInterval(this.mainInterval);
	this.gamePaused = true;
}
Game.prototype.externalScore = function(player) {
		switch(player) { // (same as inputs[j].player)
		case 'l': pl = this.state.left; break;
		case 'r': pl = this.state.right; break;
		case 't': pl = this.state.top; break;
		case 'b': pl = this.state.bottom; break;
	}
	clearInterval(this.mainInterval);
	this.gamePaused = true;
	this.state.score.justScored = false;
	pl.score++;
}
Game.prototype.resetAfterScore = function() {
	this.inputs = [];
	this.state.ball = new this.Ball(this.state.board.w/2, this.state.board.h/2);
}
Game.prototype.move = function(player, dir, time, uod) {
	if (this.gamePaused) return;
	for (let i=0; i<this.inputs.length; i++) // avoid two of the same key
		if (this.inputs[i].player == player
			&& this.inputs[i].dir == dir
			&& this.inputs[i].uod == uod) return;
	this.inputs.push({ dir, time, uod, player });
}
Game.prototype.override = function(state) {
	this.state = state;
};
Game.prototype.logInputs = function() { console.log(this.inputs); }

module.exports = Game;
