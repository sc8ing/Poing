// changed Player object to have offset, not x & y
// changed Player object to have length and thickness, not width & height
// also moved this into default options
// Player movement is 1d, so changed this to speed instead of x/y speed
// (rewired update to work with these changes)
// moved resetting of ball to after it goes off the board
//
// * corner of paddle hit?

// func(state) called after each update loop
// bw & bh are board height and width (required)
function Game(func, bw, bh) { 
// ops
	let ops = {
		board: { width: 500, height: 600 },
		ball: { r: 25, v: { x: 0, y: 75 },
		paddle: { length: 100, thick: 24, speed: 200 }
	};

// data
	let callbackFunc = func;
	let state = initialState(bw, bh);
	
	// holds { player, direction, time, ud }
	// for each input by clients
	this.inputs = []; 

// start the game when called
	this.startGame = function() {
		this.then = Date.now();
		this.now = Date.now();
		setInterval(main, 1);
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
/****************
				b.y_spd += rt.y_spd/2;
			} else {
				state.ball = startBall(bw, bh);
			}

		}  //bottom paddle
		else if (b.y-b.r > state.board.h-bt.h && b.y+b.r < state.board.h-bt.h){
			if (b.x-b.r >= bt.x && b.x+b.r <= bt.x+bt.w){
				b.y = state.board.h-b.r-bt.h;
				b.y_spd *=  -1;
				b.x_spd += bt.x_spd/2;
			} else {
				state.ball = startBall(bw, bh);
			}
		}

		b.x += delta * b.v.x;
		b.y += delta * b.v.y;

		state.ball = b;


		//player update
		for (let i=0; i<inputs.length; i++){
			if (inputs[i].ud == "up") continue;
			let hasUp = false;
			for (let j=i; j<inputs.length; j++){
				if (inputs[j].player == inputs[i].player && inputs[j].direction == inputs[i].direction && inputs[j].ud == "up"){
					hasUp = inputs[j];
				}
				let dta;
				if (hasUp == false){
					dta = Date.now() - inputs[i].time;
					inputs[i].time = Date.now();
				} else {
					dta = hasUp.time - inputs[i].time;
				}
				let pl;
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
	}

	function Ball(x, y) {
		this.x = x;
		this.y = y;
		this.r = ops.ball.r;
		this.v = { x: ops.ball.v.x, y: ops.ball.v.y };
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
