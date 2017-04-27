// added score attribute to Player object



// func(state) called after each update loop
// bw & bh are board height and width (required)
function Game(func, bw, bh) { 
// ops
	let ops = {
		gameSpeed: 1, // how fast to set the main game loop
		scorePauseLength: 3000, // how long to pause the game after scoring
		board: { width: bw || 500, height: bh || 600 },
		ball: { r: 25, v: { x: 0, y: 75 } },
		paddle: { length: 100, thick: 24, speed: 200 }
	};

// data
	let callbackFunc = func;
	let state = initialState(bw, bh);
	let mainInterval;
	
	// holds { player, direction, time, ud }
	// for each input by clients
	this.inputs = []; 

// start the game when called
	this.startGame = function() {
		this.then = Date.now();
		this.now = Date.now();
		mainInterval = setInterval(main, 1);
	}

// update
	function update(delta, bw, bh) {
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
				//b.v.y = b.y - (lt.o + lt.length/2) add func to do this later
		}
		// top paddle
		else if (b.y-b.r < tp.thick
			&& b.x+b.r >= state.board.w - tp.o - tp.length
			&& b.x-b.r <= state.board.w - tp.o) {
				b.y = b.r + tp.thick;
				b.v.y *= -1;
				//b.x += tp.x_spd/2; add later (based off distance from center of paddle)
		}
		//right paddle
		else if (b.x+b.r > state.board.w-rt.thick
			&& b.y-b.r <= state.board.h-rt.o
			&& b.y+b.r >= state.board.h - rt.o - rt.length) {
				b.x = state.board.w-b.r-rt.thick;
				b.v.x *= -1;
				//b.v.y += rt.y_spd/2;
		}
		//bottom paddle
		else if (b.y+b.r > state.board.h-bt.thick
			&& b.x+b.r >= bt.o
			&& b.x-b.r <= bt.o + bt.length) {
				b.y = state.board.h - b.r - bt.h;
				b.v.y *= -1;
				//b.x_spd += bt.x_spd/2;
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
			if (inputs[i].ud == "up") continue;

			// check for corresponding "up" key later in the array
			let hasUp = false;
			for (let j=i; j<inputs.length; j++) {
				if (inputs[j].player == inputs[i].player
					&& inputs[j].direction == inputs[i].direction
					&& inputs[j].ud == "up")
						hasUp = inputs[j];

			// find date to move player
				// delta (time between down & up||now for this key)
				let dta = (hasUp ? hasUp.time : Date.now()) - inputs[i].time;
				// don't want to incorporate the time used from this loop into the next one
				if (!hasUp) inputs[i].time = Date.now(); 

				let pl; // player
				let comp; // side of board to check boundaries against
				switch(inputs[j].player) { // (same as inputs[i].player)
					case 'l': pl = state.left; comp = state.board.height; break;
					case 'r': pl = state.right; comp = state.board.height; break;
					case 't': pl = state.top; comp = state.board.width; break;
					case 'b': pl = state.bottom; comp = state.board.width; break;
				}

				// actually move (change the local state)
				if (inputs[j].direction == "left") pl.o -= pl.speed * delta;
				else pl.o += pl.speed * delta;
				// and check for boundaries
				if (pl.o < 0) pl.o = 0;
				if (pl.o + pl.length > comp) pl.o = comp - pl.length;

/*
				if (inputs[j].player == 'l'){
					pl = state.left;
					if (inputs[j].direction == "left"){
						if (pl.y <= 0) {
							pl.y = 0;
							pl.y_spd = 0;
						} else {
							pl.y_spd = 4;
							pl.y -= pl.y_spd * dta;
						}
					} else {
						if (pl.y+pl.w >= state.board.h) {
							pl.y = state.board.h - pl.w;
							pl.y_spd = 0;
						} else {
							pl.y_spd = 4;
							pl.y += pl.y_spd * dta;
						}
					}
					state.left = pl;
				} else if (inputs[j].player == 't'){
					pl = state.top;
					if (inputs[j].direction == "left"){
						if (pl.x >= state.board.w){
							pl.x = state.board.w - pl.w;
							pl.x_spd = 0;
						} else {
							pl.x_spd = 4;
							pl.x += pl.x_spd * dta;
						}
					} else {
						if (pl.x <= 0){
							pl.x = 0;
							pl.x_spd = 0;
						} else {
							pl.x_spd = 4;
							pl.x -= pl.x_spd * dta;
						}
					}
					state.top = pl;
				} else if (inputs[j].player == 'r'){
					pl = state.right;
					if (inputs[j].direction == "left"){
						if (pl.y >= state.board.h){
							pl.y = state.board.h - pl.w;
							pl.y_spd = 0;
						} else {
							pl.y_spd = 4;
							pl.y += pl.y_spd * dta;
						}
					} else {
						if (pl.y <= 0){
							pl.y = 0;
							pl.y_spd = 0;
						} else {
							pl.x_spd = 4;
							pl.y -= pl.y_spd * dta;
						}
					}
					state.right = pl;
				} else {
					pl = state.bottom;
					if (inputs[j].direction == "left"){
						if (pl.x <= 0){
							pl.x = 0;
							pl.x_spd = 0;
						} else {
							pl.x_spd = 4;
							pl.x -= pl.x_spd * dta;
						}
					} else {
						if (pl.x >= state.board.w){
							pl.x = state.board.w - pl.w;
							pl.x_spd = 0;
						} else {
							pl.x_spd = 4;
							pl.x += pl.x_spd * dta;
						}
					}
					state.bottom = pl;
				}
*/
			}
		}
	}
	let dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1,2));


	function initialState(bw, bh) {
		ball: startBall(),
		left: new Player(bh/2-ops.paddle.length/2),
		top: new Player(bw/2-ops.paddle.length/2),
		right: new Player(bw/2-ops.paddle.length/2),
		bottom: new Player(bw/2-ops.paddle.length/2),
		board: { w: bw,  h: bh }
	}

	function startBall() {
		return new Ball(this.state.board.w/2, this.state.board.h/2);
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
		clearInterval(mainInterval);
		pl.score++;
		state.ball = startBall();
		setTimeout(() => startGame(), ops.scorePauseLength);
	}

	function main() {
		now = Date.now();
		delta = now - then;
		update(delta / 1000, bw, bh);
		callbackFunc(state);
		then = now;
	}
}

// called by client/server when user input
Game.prototype.move = function(player, direction, time, ud){
	this.inputs.push({player, direction, time, ud});
}
