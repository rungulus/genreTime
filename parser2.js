const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const config = require('./config');


const app = express();
const port = 3000;

const spotifyApi = new SpotifyWebApi({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri
  });
  

// Function to append data to JSON file
function appendToJsonFile(data) {
  fs.appendFile('playlist.json', JSON.stringify(data) + '\n', 'utf8', (err) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log('Data appended to JSON file successfully.');
    }
  });
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Authentication
app.get('/login', (req, res) => {
  const scopes = ['user-read-recently-played'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    res.send('Authenticated!');
  } catch (error) {
    res.send('Error authenticating with Spotify.');
  }
});

// Get user's recently played tracks and log into JSON file
app.get('/tracks', async (req, res) => {
  try {
    const { body: { items } } = await spotifyApi.getMyRecentlyPlayedTracks();
    const tracks = items.map(item => {
      const track = item.track;
      const genres = track.artists.map(artist => artist.genres).flat();
      const timestamp = new Date(item.played_at).getTime() / 1000;
      return {
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        genres,
        timestamp
      };
    });
    appendToJsonFile(tracks);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get genres of each track
app.get('/genres/:trackId', async (req, res) => {
  const { trackId } = req.params;
  try {
    const { body: { genres } } = await spotifyApi.getTrack(trackId);
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Organize genres by time
// Implement logic to group genres by time and calculate most played genre for each hour

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
