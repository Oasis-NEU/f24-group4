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

// Function to navigate to the next page
function goToNextPage() {
  window.location.href = '/calendar.html'; // Update this with your actual next page URL
}

// Event Listeners
document.getElementById('login-button').addEventListener('click', connectSpotify);
document.getElementById('go-to-next-page').addEventListener('click', goToNextPage);

// Check authentication on page load
window.onload = handleAuthentication;