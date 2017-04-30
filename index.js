let port = 3000;

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let gameRooms = require('./gamerooms.server.js')(io);

app.get('/*', function(req, res) {
	res.sendFile(__dirname + '/public/' + req.params[0]);
//	res.sendFile(__dirname + "/index.html");
});

http.listen(3000, console.log("listening on *:" + port));
