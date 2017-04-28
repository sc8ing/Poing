var l = s => console.log(s);

// func(state) called after each update loop
// bw & bh are board height and width (required)
function Game(func, bw, bh) { 
// ops
	let ops = {
		gameSpeed: 1, // how fast to set the main game loop
		scorePauseLength: 3000, // how long to pause the game after scoring
		board: { width: 500, height: 300 },
		ball: { r: 25, v: { x: 100, y: 75 } },
		paddle: { length: 100, thick: 24, speed: 200 }
	};
	// takes the distance from center of paddle -> new x/y speed (parallel to wall)
	// length is the length of the paddle
	let velocityChange = (offset, length) => (offset / (length/2)) * 200;

// data
	let callbackFunc = func;
	let state = initialState();
	let mainInterval;
	
	// holds { player, direction, time, ud }
	// for each input by clients
	this.inputs = []; 

// start the game when called
	this.startGame = () => {
		console.log("starting game (Game.startGame())");
		this.then = Date.now();
		this.now = Date.now();
		mainInterval = setInterval(main, 1);
	};

	let startGame = this.startGame;

// update
	let update = (delta) => {
		if (isNaN(delta)) delta = 0; // something weird's going on
		let inputs = this.inputs;
		// the players' paddles
		let lt = state.left;
		let rt = state.right;
		let tp = state.top;
		let btm = state.bottom;

	// ball update
		let b = state.ball;

		// left paddle (includes corners)
		if (b.x-b.r < lt.thick
			&& b.y + b.r >= lt.o
			&& b.y - b.r <= lt.o + lt.length) {
				b.x = lt.thick + b.r;
				b.v.x *= -1;
				b.v.y = velocityChange(b.y - (lt.o+lt.length/2), lt.length);
		}
		// top paddle
		else if (b.y-b.r < tp.thick
			&& b.x+b.r >= state.board.w - tp.o - tp.length
			&& b.x-b.r <= state.board.w - tp.o) {
				b.y = b.r + tp.thick;
				b.v.y *= -1;
				b.v.x = velocityChange(b.x - (tp.o+tp.length/2), tp.length);
		}
		//right paddle
		else if (b.x+b.r > state.board.w - rt.thick
			&& b.y-b.r <= state.board.h - rt.o
			&& b.y+b.r >= state.board.h - rt.o - rt.length) {
				b.x = state.board.w - b.r-rt.thick;
				b.v.x *= -1;
				b.v.y = velocityChange(b.y - (rt.o+rt.length/2), rt.length);
		}
		//bottom paddle
		else if (b.y+b.r > state.board.h-btm.thick
			&& b.x+b.r >= btm.o
			&& b.x-b.r <= btm.o + btm.length) {
				b.y = state.board.h - b.r - btm.h;
				b.v.y *= -1;
				b.v.x = velocityChange(b.x - (btm.o+btm.length/2), btm.length);
		}
		
		// scoring
		if (b.x + b.r < 0) score(state.left);
		else if (b.x - b.r > state.board.w) score(state.right);
		else if (b.y + b.r < 0) score(state.top);
		else if (b.y - b.r > state.board.w) score(state.bottom);

		b.x += delta * b.v.x;
		b.y += delta * b.v.y;

	//player update
		for (let i=0; i<inputs.length; i++) {
			// we're looking for down/up pairs, & all downs are going to have
			// index < that of their corresponding up, so skip the ups
			// (they've already been done)
			if (inputs[i].uod == "up") continue;

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
				case 'l': pl = state.left; comp = state.board.height; break;
				case 'r': pl = state.right; comp = state.board.height; break;
				case 't': pl = state.top; comp = state.board.width; break;
				case 'b': pl = state.bottom; comp = state.board.width; break;
				default: alert("error in input processing game core"); alert(inputs[i].player);break;
			}

			// actually move (change the local state)
			if (inputs[i].dir == "left") pl.o -= pl.speed * delta;
			else pl.o += pl.speed * delta;
			// and check for boundaries
			if (pl.o < 0) pl.o = 0;
			if (pl.o + pl.length > comp) pl.o = comp - pl.length;
			
			// delete used data
			if (hasUp) {
				console.log("processed keypress pair");
				inputs.splice(i, 1); // delete the down
				inputs.splice(inputs.indexOf(hasUp), 1); // and the up
			} else {
				inputs[i].time = Date.now();
//				console.log("processed single key");
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
			board: { w: bw,  h: bh }
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
	
	// when the ball goes off the screen, update calls score(state.[sideOff])
	// note this is really more like "lose()"; the game's scoring is kind of like golf's
	function score(pl) {
		console.log("goal!");
		clearInterval(mainInterval);
		pl.score++;
		console.log(pl, "just lost a point");
		state.ball = new Ball(state.board.w/2, state.board.h/2);
		setTimeout(startGame, ops.scorePauseLength);
		console.log(state.ball);
	}

	let main = () => {
		this.now = Date.now();
		delta = this.now - this.then;
		update(delta / 1000);
		callbackFunc(state);
		this.then = this.now;
	}
}

// called by client/server when user input
// keydata is a record of the form { sockid, dir, time, upordown }
// player is l/r/t/b; dir is 'left' or 'right'; time is time pressed, uod is up or down press
Game.prototype.move = function(player, dir, time, uod) {
	this.inputs.push({ dir, time, uod, player });
}

module.exports = Game;
