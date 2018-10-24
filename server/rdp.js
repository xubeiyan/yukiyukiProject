const {desktopCapturer} = require('electron');
const robot = require('robotjs');
robot.setMouseDelay(2);

var localStream,
	screenWidth,
	screenHeight;
	
var config = require('./config.json');

var peer = new Peer(config);

var conn;
var dataConnection;

peer.on('open', (id) => {
	console.log('peer id is ' + id);
});

peer.on('error', (err) => {
	console.log(err);
});

var dest_peer_id = document.querySelector('#dest-peer-id'),
	submit_button = document.querySelector('#submit'),
	message = document.querySelector('#message');
	
// 转换鼠标点击位置，参数为客户端点击位置，客户端显示大小，服务端屏幕大小
var	transformPosition = function (posClient, screenClient, screenServer) {
		var posServer = {
			x: 233,
			y: 322,
		};
		
		// 宽有黑边
		if (screenServer.width * screenClient.height <= screenServer.height * screenClient.width ) {
			// console.log('宽有黑边');
			var validScreenWidth = screenClient.height * screenServer.width / screenServer.height;
			// 点击地方是黑边
			if (posClient.x < (screenClient.width - validScreenWidth) / 2 ||
				posClient.x > (screenClient.width - validScreenWidth) / 2 + validScreenWidth) {
				posServer.x = 'outscreen';
			} else {
				posServer.x = (posClient.x - (screenClient.width - validScreenWidth) / 2) *
					screenServer.width / validScreenWidth;
				posServer.y = posClient.y *
					screenServer.height / screenClient.height;
			}
		// 高有黑边
		} else {
			// console.log('高有黑边');
			var validScreenHeight = screenClient.width * screenServer.height / screenServer.width;
			// 点击地方是黑边
			if (posClient.y < (screenClient.height - validScreenHeight) / 2 ||
				posClient.y > (screenClient.height - validScreenHeight) / 2 + validScreenHeight) {
				posServer.y = 'outscreen';
			} else {
				posServer.x = posClient.x *
					screenServer.width / screenClient.width;
				posServer.y = (posClient.y - (screenClient.height - validScreenHeight) / 2) *
					screenServer.height / screenClient.height;
			}
		}
		console.log('click at (' + posServer.x + ',' + posServer.y + ')');
		return posServer;
	},
	keyValueTransform = function (keyValue) {
		var originStr = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight',
				'Backspace', 'Delete', 'Enter', 'Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown',
				'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
				'PrintScreen', 'Insert', 'Control', 'Alt', 'Shift', 'Meta'],
			newStr = [   'down',        'up',    'left',      'right', 
				'backspace', 'delete', 'enter', 'tab', 'escape', 'home', 'end', 'pageup', 'pagedown',
				'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
				'printscreen', 'insert', 'control', 'alt', 'shift', 'command'];
			
		if (originStr.indexOf(keyValue) !== -1) {
			return newStr[originStr.indexOf(keyValue)];
		} else {
			return keyValue;
		}
	},
	// 
	getKeyModifier = function (event) {
		if (event.key === 'Control' || event.key === 'Alt' 
			|| event.key === 'Shift' || event.key === 'Meta') {
			return undefined;
		}
		var result = [];
		if (event.ctrl) {
			result.push('control');
		}
		
		if (event.shift) {
			result.push('shift');
		}
		
		if (event.alt) {
			result.push('alt');
		}
		
		if (event.meta) {
			result.push('command');
		}
		if (result === []) {
			return undefined;
		} else {
			console.log(result);
			return result;			
		}
	},
	keyboardMouseOperation = function (data) {
		if (data.oprType === 'mousedown') {
			var button = data.which === 3 ? 'right': 'left',
				posClient = {
					x: data.x,
					y: data.y,
				},
				screenClient = {
					width: data.screenWidth,
					height: data.screenHeight,
				},
				screenServer = {
					width: screenWidth,
					height: screenHeight,
				},
				posServer = transformPosition(posClient, screenClient, screenServer);
			if (posServer.x === 'outscreen' || posServer.y === 'outscreen') {
				console.log('receive out screen click');
				return;
			}
			robot.moveMouse(posServer.x, posServer.y);
			robot.mouseToggle('down', button);
		} else if (data.oprType === 'mouseup') {
			var button = data.which === 3 ? 'right': 'left',
				posClient = {
					x: data.x,
					y: data.y,
				},
				screenClient = {
					width: data.screenWidth,
					height: data.screenHeight,
				},
				screenServer = {
					width: screenWidth,
					height: screenHeight,
				},
				posServer = transformPosition(posClient, screenClient, screenServer);
			if (posServer.x === 'outscreen' || posServer.y === 'outscreen') {
				console.log('receive out screen click');
				return;
			}
			robot.moveMouse(posServer.x, posServer.y);
			robot.mouseToggle('up', button);
		} else if (data.oprType === 'keydown') {
			var modifier = getKeyModifier(data);
			// console.log('keydown', modifier);
			if (modifier === undefined) {
				robot.keyToggle(keyValueTransform(data.key), 'down');
			} else {
				robot.keyToggle(keyValueTransform(data.key), 'down', modifier);
			}
		} else if (data.oprType === 'keyup') {
			var modifier = getKeyModifier(data);
			if (modifier === undefined) {
				robot.keyToggle(keyValueTransform(data.key), 'up');
			} else {
				robot.keyToggle(keyValueTransform(data.key), 'up', modifier);
			}
		}
	};
	
submit_button.addEventListener('click', () => {
	console.log('connect...');
	conn = peer.call(dest_peer_id.value, localStream);
	if (dataConnection !== undefined) {
		return;
	}
	dataConnection = peer.connect(dest_peer_id.value);
	var screen = robot.getScreenSize();
		
	screenWidth = screen.width;
	screenHeight = screen.height;
	
	dataConnection.on('data', (data) => {
		console.log('receive data:' + data);
		var jsonData = JSON.parse(data);
		if (jsonData) {
			// console.log(jsonData.oprType);
			message.innerHTML = data;
			keyboardMouseOperation(jsonData);
		} else {
			console.log('receive unsupported message...');
		}
	});
});



desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
	if (error) throw error;
	// console.log('error');
	var screenId;
	for (let i = 0; i < sources.length; ++i) {
		// console.log(sources[i].name);
		if (sources[i].name === 'Screen 1') {
			screenId = sources[i].id;
			break;
		} else if (sources[i].name === 'Entire screen') {
			screenId = sources[i].id;
			break;
		}
	}
	
	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: screenId,
				minWidth: 1280,
				maxWidth: 1280,
				minHeight: 720,
				maxHeight: 720,
			}
		}
	})
	.then((stream) => handleStream(stream))
	.catch((e) => handleError(e))
	return;
});

function handleStream (stream) {
	const video = document.querySelector('video')
	video.srcObject = stream
	localStream = stream;
	video.onloadedmetadata = (e) => video.play()
	
	// pc.onaddstream({stream: stream});
	// pc.addStream(stream);
	
	// pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
		// pc.createAnswer(function (answer) {
			// pc.setLocalDescription(new RTCSessionDescription(answer), function() {
				
			// }, error);
		// })
	// });
}

function handleError (e) {
	console.log(e)
}