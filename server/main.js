const {app, BrowserWindow} = require('electron');
const robot = require('robotjs');
  
let mainWindow;
  
function createWindow () {   
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({width: 600, height: 400});
	var screen = robot.getScreenSize();
	mainWindow.setPosition(screen.width - 600, screen.height - 450);
	// 然后加载应用的 index.html。
	mainWindow.loadFile('index.html');
	
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

app.on('ready', createWindow);