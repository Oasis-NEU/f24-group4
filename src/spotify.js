// src/spotify.js
import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SCOPES } from './config.js';

// Function to start the Spotify login process
document.getElementById('login-button').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = authUrl;
});

// Function to handle the token from Spotify's redirect
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (hash) {
    const token = new URLSearchParams(hash.substring(1)).get('access_token');
    localStorage.setItem('spotifyAccessToken', token);
    window.location.hash = ''; // Clear the hash from the URL
  }
});