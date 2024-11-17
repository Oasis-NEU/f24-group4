import React, { useState, useEffect } from 'react';

const App = () => {
  const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const GOOGLE_CLIENT_ID = '79987944929-ib5s7kotamfa74porgsv1jqhifr1n2b0.apps.googleusercontent.com';
  const GOOGLE_REDIRECT_URI = window.location.origin + '/calendar.html';

  const SPOTIFY_SCOPES = 'playlist-modify-private';
  const SPOTIFY_CLIENT_ID = '9699efd9706b432db830fa403b2feca0'; // Replace with your Spotify client ID
  const SPOTIFY_REDIRECT_URI = window.location.origin + '/spotify.html';

  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [mood, setMood] = useState('');

  const connectGoogleCalendar = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      GOOGLE_REDIRECT_URI
    )}&scope=${encodeURIComponent(GOOGLE_SCOPES)}&include_granted_scopes=true&access_type=offline`;
    window.location.href = authUrl;
  };

  const connectSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
      SPOTIFY_REDIRECT_URI
    )}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}`;
    window.location.href = authUrl;
  };

  const handleGoogleAuthentication = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: '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', // Replace with actual client secret
            code: authCode,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });
        const data = await response.json();
        if (data.access_token) {
          setGoogleAccessToken(data.access_token);
          const events = await listGoogleEvents(data.access_token);
          setEvents(events);
          const mood = analyzeSchedule(events);
          setMood(mood);
        }
      } catch (error) {
        console.error('Google authentication error:', error);
      }
    }
  };

  const handleSpotifyAuthentication = () => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      setSpotifyAccessToken(accessToken);
    }
  };

  const listGoogleEvents = async (accessToken) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${startOfDay}&timeMax=${endOfDay}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  };

  const analyzeSchedule = (events) => {
    let busyMinutes = 0;
    events.forEach((event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      busyMinutes += (end - start) / (1000 * 60); // Convert milliseconds to minutes
    });

    if (busyMinutes > 240) return 'relaxing';
    if (busyMinutes > 120) return 'energetic';
    return 'chill';
  };

  const processSpotifyPlaylist = async () => {
    if (spotifyAccessToken) {
      try {
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        });
        const userData = await userResponse.json();
        const userId = userData.id;

        const playlistId = await createSpotifyPlaylist(spotifyAccessToken, userId, mood);
        const tracks = await fetchTracksForMood(mood);
        await addTracksToSpotifyPlaylist(spotifyAccessToken, playlistId, tracks);
      } catch (error) {
        console.error('Error processing Spotify playlist:', error);
      }
    }
  };

  const createSpotifyPlaylist = async (accessToken, userId, mood) => {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Playlist`,
        description: `A ${mood} playlist based on your day's schedule.`,
        public: false,
      }),
    });
    const playlistData = await response.json();
    return playlistData.id;
  };

  const addTracksToSpotifyPlaylist = async (accessToken, playlistId, tracks) => {
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: tracks }),
    });
  };

  const fetchTracksForMood = async (mood) => {
    const trackUris = {
      relaxing: ['spotify:track:24emu3sabKISjRkrys28jq?si=8636f10b0a6240a0'], // Replace with actual track URIs
      energetic: ['spotify:track:2MvvoeRt8NcOXWESkxWn3g?si=1599cef7eaed4745'],
      chill: ['spotify:track:0PLhwCmQ7cC3ThRGPn3HxF?si=527adf3eda6f489d'],
    };
    return trackUris[mood] || [];
  };

  useEffect(() => {
    handleGoogleAuthentication();
    handleSpotifyAuthentication();
  }, []);

  return (
    <div>
      <h1>Connect Your Google Calendar and Spotify</h1>
      <button onClick={connectGoogleCalendar}>Connect Google Calendar</button>
      <button onClick={connectSpotify}>Connect Spotify</button>
      <div>
        <h2>Your Mood: {mood}</h2>
        {mood && spotifyAccessToken && <button onClick={processSpotifyPlaylist}>Create Playlist</button>}
      </div>
      <div>
        <h3>Today's Events</h3>
        {events.map((event, index) => (
          <div key={index}>{event.summary}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
