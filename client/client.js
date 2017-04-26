//state: contains ball and players[] -- how about boundaries?

function makeGame(element, width, height){
	let pos = "";

	let canvas = document.createElement('canvas');
	canvas.width = width || 600;
	canvas.height = height || 500;
	element.appendChild(canvas);
	let c = canvas.getContext("2d");

	function render(state) {
		let p1 = state.players[0];
		let p2 = state.players[1];
		let p3 = state.players[2];
		let p4 = state.players[3];

	  //canvas is just the template.
		c.clearRect(0, 0, canvas.width, canvas.height);

		//Ball
		c.beginPath();
		c.fillStyle = 'darkslategrey';
		c.arc(state.ball.x, state.ball.y, state.ball.r, 0, 2*Math.PI);
		c.fill();
		c.closePath();
		c.strokeStyle = 'green';
		c.stroke();

		//p1 LEFT
		c.beginPath();
		c.rect(p1.x, p1.y, 10, 100);
		// c.rect(0, 100, 10, 100);
		c.fillStyle = 'firebrick';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p2 TOP
		c.beginPath();
		// c.rect(100, 0, 10, 100);
		c.rect(p2.x,p2.y, 0, 10, 100);
		c.fillStyle = 'dodgerblue';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p3 RIGHT
		c.beginPath();
		// c.rect(490, 100, 10, 100);
		c.rect(p3.x,p3.y, 0, 10, 100);
		c.fillStyle = 'yellow';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//p4 BOTTOM
		c.beginPath();
		// c.rect(490, 100, 10, 100);
		c.rect(p2.x,p2.y, 0, 10, 100);
		c.fillStyle = 'orange';
		c.fill();
		c.strokeStyle = 'black';
		c.stroke();
		c.closePath();

		//Mid Line
		// c.beginPath();
		// c.strokeStyle = 'black';
		// c.moveTo(250,0);
		// c.lineTo(250,300);
		// c.stroke();
		// c.closePath();
	}

	let g = new Game(render);


	//deal with server and core communication
	let socket = io();
	socket.on('gameStartAt', function(time){
		setTimeout(time-Date.now(), function(){
			g.startGame();
		});
	});

	document.body.addEventListener("keydown", function(e) {sendKeyPressed("down", e)});
	document.body.addEventListener("keyup", function(e) {sendKeyPressed("up", e)});

	socket.on('playerPosition', function(position){
		this.pos = position;
	});

	//tells server and game core details of keypress event
	function sendKeyPressed(uod, e){
		let key = e.keyCode;
		let sockid = socket.id;
		let dir = "";

		if(key == 38 || key == 37){
			dir="left";
		}

		if(key == 39 || key == 40){
			dir="right";
		}

		let time = Date.now();
		let upordown = uod;

		//alerts server
		socket.emit('keypress', {sockid, dir, time, upordown});
		//alerts game
		g.move(pos, dir, time, uod);
	}
}
