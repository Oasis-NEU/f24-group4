import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SCOPES } from './config.js';

// Function to redirect to Spotify login
function connectSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = authUrl; // Redirect to Spotify authorization
}

// Function to check if user is authenticated
function handleAuthentication() {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get('access_token');

  if (accessToken) {
    // Store access token in localStorage (optional)
    localStorage.setItem('spotifyAccessToken', accessToken);
    
    // Show the "Go to Next Page" button
    document.getElementById('next-page-button').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
  } else {
    // If no access token, show the login button
    document.getElementById('login-button').style.display = 'block';
    document.getElementById('next-page-button').style.display = 'none';
  }
}

// Function to create a playlist based on the mood
async function createPlaylist(accessToken, userId, mood) {
  const playlistName = `${mood.charAt(0).toUpperCase() + mood.slice(1)} Playlist`;
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description: `A ${mood} playlist based on your day's schedule.`,
      public: false,
    }),
  });
  const playlistData = await response.json();
  return playlistData.id;
}

// Function to add tracks to the playlist
async function addTracksToPlaylist(accessToken, playlistId, tracks) {
  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: tracks }),
  });
}

// Function to analyze the schedule and create the playlist
async function processPlaylistBasedOnSchedule(events) {
  const mood = analyzeSchedule(events); // Assuming analyzeSchedule is available
  console.log('Determined Mood:', mood);

  const spotifyAccessToken = localStorage.getItem('spotifyAccessToken');
  if (spotifyAccessToken) {
    // Retrieve user ID from Spotify API
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyAccessToken}` },
    });
    const userData = await userResponse.json();
    const userId = userData.id;

    // Create a playlist and add tracks
    const playlistId = await createPlaylist(spotifyAccessToken, userId, mood);

    // Fetch tracks for the mood
    const tracks = await fetchTracksForMood(mood); // Implement this function to get tracks based on mood
    await addTracksToPlaylist(spotifyAccessToken, playlistId, tracks);
  } else {
    console.error('Spotify access token not available.');
  }
}

// Function to navigate to the next page
function goToNextPage() {
  window.location.href = '/calendar.html'; // Update this with your actual next page URL
}

// Event Listeners
document.getElementById('login-button').addEventListener('click', connectSpotify);
document.getElementById('go-to-next-page').addEventListener('click', goToNextPage);

// Check authentication on page load
window.onload = handleAuthentication;

// Helper function to analyze schedule
function analyzeSchedule(events) {
  let busyMinutes = 0;
  events.forEach((event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    busyMinutes += (end - start) / (1000 * 60); // Convert milliseconds to minutes
  });

  if (busyMinutes > 240) return 'relaxing'; // More than 4 hours of events
  if (busyMinutes > 120) return 'energetic'; // 2-4 hours of events
  return 'chill'; // Less than 2 hours
}
