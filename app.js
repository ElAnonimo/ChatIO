var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	usernames = [];		// Array of Connected Users

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Server side
io.sockets.on('connection', function(socket) {
	socket.on('new user', function(data, callback) {
		if (usernames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});
	
	// Update usernames
	function updateUsernames() {
		io.sockets.emit('usernames', usernames);
	};
	
	// Send message
	socket.on('send message', function(data) {
		io.sockets.emit('new message', { msg: data, user: socket.username });
	});
	
	// Disconnect and delete the username from the chat
	socket.on('disconnect', function(data) {
		if ( !socket.username) {
			return;
		}
		
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	});
});