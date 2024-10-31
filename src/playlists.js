// src/playlists.js

// Retrieve the access token from localStorage
const token = localStorage.getItem('spotifyAccessToken');

async function getPlaylists() {
  if (!token) {
    console.log("No Spotify token found.");
    return;
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();

    // Check if playlists exist
    if (data.items) {
      displayPlaylists(data.items);
    } else {
      console.log("No playlists found or token expired.");
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
}

function displayPlaylists(playlists) {
  const container = document.querySelector('.container');
  container.innerHTML = '<h2>Your Spotify Playlists</h2><ul>';

  playlists.forEach(playlist => {
    const listItem = document.createElement('li');
    listItem.textContent = playlist.name;
    container.appendChild(listItem);
  });

  container.innerHTML += '</ul>';
}

// Fetch and display playlists on page load
window.addEventListener('load', getPlaylists);