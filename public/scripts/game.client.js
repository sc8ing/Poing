// state: contains ball and players[] -- how about boundaries?


let makeGame = function(element, width, height) {

// external dependencies
	// socket io cdn linked to in html file
	let socket = io();

	// create a Game (but don't start it) also linked from html file
	let g;
	if (width && height) g = new Game(render, width, height);
	else g = new Game(render);

// data
	// holds l/r/t/b when server tells client what position they are
	this.pos;

// setup server listening
	socket.on('gameStartAt', function(time) {
		clearInterval(loadingIntvl); // get rid of the waiting bubbles
		console.log("received gameStartAt, starting in " + (time-Date.now())/1000 + "seconds");
		setTimeout(() => { g.startGame(); }, time - Date.now());
	// setup user input listening
		document.body.addEventListener("keydown", function(e) {sendKeyPressed("down", e)});
		document.body.addEventListener("keyup", function(e) {sendKeyPressed("up", e)});
	});

	socket.on('position', position => this.pos = position);

	socket.on('override', state => { g.override(state); });

	socket.on('keypress', keydata => {
		g.move(keydata.player, keydata.dir, keydata.time, keydata.upordown);
	});

	socket.on('score', (scoreData) => {
		g.pause();
		g.resetAfterScore();
		g.externalScore(scoreData.player);
		setTimeout(scoreData.timeTillContinue, g.startGame);
	});


// create the canvas
	let canvas = document.createElement('canvas');
	canvas.width = 500;
	canvas.height = 300;
	element.appendChild(canvas);
	let c = canvas.getContext("2d");

//another load screen to replace bubbles
let colorRotation = ["#50d0ac", "#45b495", "#39947b", "#2e7460", "#215446", "#132f27"];

// waiting bubbles
	let numLoadingDots = 5;
	let x=0;
	let loadingIntvl = setInterval(function() {
		c.clearRect(0, 0, canvas.width, canvas.height);
		c.font = "40px Courier";
		let dots = "";
		for(let a=0; a<numLoadingDots; a++){
			c.beginPath();
			c.fillStyle = colorRotation[x%colorRotation.length];
			c.arc(canvas.width/2 + (30*a), canvas.height/2, 10, 0, 2*Math.PI);
			c.fill();
			c.closePath();
			x++;
		}
	}, 300);

// **** done (wait for game start) ****

// tells server and game core details of keypress event
	let sendKeyPressed = (uod, e) => { // uod: key pressed or released ("up" or "down")
		/* testing */
		if (e.keyCode == 73) g.logInputs();
		let key = e.keyCode;
		let time = Date.now();
		let upordown = uod;

		let dir = false;
		if (key == 38 || key == 37) dir="left";
		else if (key == 39 || key == 40) dir="right";
		if (!dir) return; // don't send anything if it wasn't a left or right key

		// alerts server
		socket.emit('keypress', { dir, time, upordown});

		// alerts Game
		g.move(this.pos, dir, time, uod);
	}

// render
	function render(state) {
		let p1 = state.left;
		let p2 = state.top;
		let p3 = state.right;
		let p4 = state.bottom;

	  //canvas is just the template.
		c.clearRect(0, 0, canvas.width, canvas.height);

		//Ball
		c.beginPath();
		c.fillStyle = 'darkslategrey';
		c.arc(state.ball.x, state.ball.y, state.ball.r, 0, 2*Math.PI);
		c.fill();
		c.strokeStyle = 'green';
		c.stroke();
		c.closePath();

		//p1 LEFT
		c.beginPath();
		c.rect(0, p1.o, p1.thick, p1.length);
		c.fillStyle = 'firebrick';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p2 TOP
		c.beginPath();
		c.rect(p2.o, 0, p2.length, p2.thick);
		c.fillStyle = 'dodgerblue';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p3 RIGHT
		c.beginPath();
		c.rect(canvas.width, canvas.height - p3.o, -p3.thick, -p3.length);
		c.fillStyle = 'yellow';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p4 BOTTOM
		c.beginPath();
		c.rect(p4.o, canvas.height, p4.length, -p4.thick);
		c.fillStyle = 'orange';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();
	}
}
