module.exports = function(callback) {
	let intervalSpeed = 10;

	let state = {
		ball: {
			x: 100,
			y: 100,
			v: { x: 200, y: 100 },
			r: 75
		},
		paddles: [
			{ o: 10 },
			{ o: 20 },
			{ o: 90 },
			{ o: 60 },
		]
	};

	let keyPresses = [
		
	];
	function update(delta) {
//		if (keyPresses.length != 0) console.log(keyPresses);
	}

	let now = Date.now();
	let then = Date.now();
	function main() {
		now = Date.now();
		delta = now - then;

		update(delta);
		callback(state);

		then = now;
	}

			// socket it, direction (l/r), time pressed, upordown
	this.keypress = function(keydata) {
		console.log(keydata);
		keyPresses.push(keydata);
	}
	this.start = function() {
		let interval = setInterval(main, intervalSpeed);
	}
};
