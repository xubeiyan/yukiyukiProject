const {app, globalShortcut, BrowserWindow} = require('electron');
  
let mainWindow;
  
function createWindow () {   
	// 取消所有热键注册
	globalShortcut.unregisterAll();
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({width: 1280, height: 720});

	// 然后加载应用的 index.html。
	mainWindow.loadFile('index.html');
	
	// mainWindow.setMenu(null);
	
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

app.on('ready', createWindow);