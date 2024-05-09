// main.js
const { app, BrowserWindow, ipcMain } = require('electron')
const SpotifyWebApi = require('spotify-web-api-node');
const electronOauth2 = require('electron-oauth2');
const config = require('./config');
const fs = require('fs');

let mainWindow

function createWindow () {
  if (mainWindow) {
    return;
  }

  mainWindow = new BrowserWindow({width: 800, height: 600})

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

  const windowParams = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    }
  }

  const options = {
    scope: 'user-read-recently-played',
    showDialog: true
  }

  const spotifyOauth = electronOauth2(windowParams, options);

  spotifyOauth.getAccessToken({})
  .then(token => {
    spotifyApi.setAccessToken(token.access_token);

    mainWindow.webContents.send('fetching-history');

    spotifyApi.getMyRecentlyPlayedTracks({})
      .then(data => {
        fs.writeFile('listening_history.json', JSON.stringify(data.body), err => {
          if (err) console.error('Error writing file:', err);
          mainWindow.webContents.send('history-fetched');
        });
      })
      .catch(err => {
        console.error('Something went wrong:', err);
      });
  });

mainWindow.loadFile('index.html')

mainWindow.on('closed', function () {
  mainWindow = null
})
}

app.on('ready', createWindow)