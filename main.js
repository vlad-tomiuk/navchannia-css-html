const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			contextIsolation: true
		}
	});

	win.loadFile(path.join(__dirname, 'build', 'index.html'));
	win.setMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});