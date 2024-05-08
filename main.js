const { app, BrowserWindow, ipcMain } = require('electron');
const SpotifyWebApi = require('spotify-web-api-node');

let mainWindow;

function createWindow() {
    console.log('making window');
 const  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');

  // Open DevTools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle authentication callback
app.on('login', (event, callbackURL) => {
    console.log('handling auth');
  const url = new URL(callbackURL);
  const code = url.searchParams.get('code');

  // Use the code to get access token
  spotifyApi.authorizationCodeGrant(code).then(data => {
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    mainWindow.webContents.send('authenticated');
  }).catch(err => {
    console.error('Error authenticating with Spotify:', err);
  });
});

// Receive client ID and client secret from renderer process
ipcMain.on('spotifyCredentials', (event, credentials) => {
  const { clientId, clientSecret } = credentials;
  const redirectUri = 'http://localhost:8888/callback'; // Should match the redirectUri in your Electron main process

  const spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri
  });

  // Save spotifyApi object for future use, e.g., make API requests
});
