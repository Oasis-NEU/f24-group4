const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CLIENT_ID = '79987944929-ib5s7kotamfa74porgsv1jqhifr1n2b0.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCekAi7h3qbfRi8Eh402GL1VC7FD2DWfRk';
const REDIRECT_URI = window.location.origin + '/calendar.html';

// Function to redirect to Google login
function connectGoogleCalendar() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}&include_granted_scopes=true&access_type=offline`;
  window.location.href = authUrl; // Redirect to Google authorization
}

// Function to handle user authentication and exchange authorization code for access token
async function handleAuthentication() {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');s

  if (authCode) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: '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', // Replace with actual client secret
          code: authCode,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        console.log('Access Token:', data.access_token);
        localStorage.setItem('googleCalendarAccessToken', data.access_token);
        const events = await listEvents(data.access_token);
        processPlaylistBasedOnSchedule(events);
        const mood = analyzeSchedule(events);
        console.log('Determined Mood:', mood); // You can pass this mood to Spotify API
        showNextPageButton();
      } else {
        console.error('Error exchanging code for token:', data);
        alert('Authorization failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
    }
  } else {
    console.error('Authorization code not found.');
  }
}

// Function to list events for one day
async function listEvents(accessToken) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${startOfDay}&timeMax=${endOfDay}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = ''; // Clear previous events

    if (data.items && data.items.length > 0) {
      console.log('Events for today:');
      data.items.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        const eventElement = document.createElement('div');
        eventElement.textContent = `${start} - ${event.summary}`;
        eventsContainer.appendChild(eventElement);
      });
      return data.items; // Return events to be analyzed
    } else {
      console.log('No events found for today.');
      eventsContainer.textContent = 'No events found for today.';
      return [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    alert('Failed to fetch events. Please try again.');
    return [];
  }
}

// Function to analyze the user's schedule and determine the mood
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

// Function to show the "Go to Next Page" button
function showNextPageButton() {
  const nextPageButton = document.getElementById('next-page-button');
  if (nextPageButton) {
    nextPageButton.style.display = 'block';
  }
}

// Function to navigate to the next page
function goToNextPage() {
  window.location.href = '/next.html'; // Update with your next page URL
}

// Event listeners
document.getElementById('login-button').addEventListener('click', connectGoogleCalendar);
document.getElementById('go-to-next-page').addEventListener('click', goToNextPage);

// Handle authentication on page load
window.onload = handleAuthentication;
