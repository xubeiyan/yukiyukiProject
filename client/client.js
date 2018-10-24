var config = require('./config.json');

var peer = new Peer(config);

var video = document.querySelector('video'),
	server_peer_id = document.querySelector('#server-peer-id'),
	connect_button = document.querySelector('#connect-button');

var dataConn;

var width = 1280,
	height = 720;

peer.on('open', (id) => {
	document.querySelector('#peerid').value = id;
});

peer.on('call', (call) => {
	call.answer();
	call.on('stream', (stream) => {
		video.srcObject = stream;
		video.play();
	});
});

peer.on('error', (err) => {
	console.log(err);
});

peer.on('connection', (dataConnection) => {
	dataConn = dataConnection;
});



video.addEventListener('mousedown', (e) => {
	if (dataConn === undefined) {
		return;
	}
	
	// console.log(e);
	var data = {
		oprType: 'mousedown',
		x: e.layerX,
		y: e.layerY,
		screenWidth: width,
		screenHeight: height,
		which: e.which,
	};
	
	dataConn.send(JSON.stringify(data));
});

video.addEventListener('mouseup', (e) => {
	if (dataConn === undefined) {
		return;
	}
	var data = {
		oprType: 'mouseup',
		x: e.layerX,
		y: e.layerY,
		screenWidth: width,
		screenHeight: height,
		which: e.which,
	};
	
	dataConn.send(JSON.stringify(data));
});

document.addEventListener('keydown', (e) => {
	if (dataConn === undefined) {
		return;
	}
	
	var data = {
		oprType: 'keydown',
		key: e.key,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		alt: e.altKey,
		meta: e.metaKey,
	};
	
	dataConn.send(JSON.stringify(data));
});

document.addEventListener('keyup', (e) => {
	if (dataConn === undefined) {
		return;
	}
	
	var data = {
		oprType: 'keyup',
		key: e.key,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		alt: e.altKey,
		meta: e.metaKey,
	};
	
	dataConn.send(JSON.stringify(data));
});

