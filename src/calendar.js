const CLIENT_ID = '79987944929-ib5s7kotamfa74porgsv1jqhifr1n2b0.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const REDIRECT_URI = window.location.origin + '/calendar.html';

// Function to handle authentication and fetch events
async function fetchCalendarEvents() {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  if (authCode) {
    try {
      // Exchange the auth code for an access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: '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', // Replace with your actual secret
          code: authCode,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        const events = await listEvents(tokenData.access_token);
        displayEvents(events);
      } else {
        console.error('Failed to retrieve access token:', tokenData);
        document.getElementById('events-container').innerText =
          'Failed to fetch events. Please try again.';
      }
    } catch (error) {
      console.error('Error during authentication or event retrieval:', error);
      document.getElementById('events-container').innerText =
        'An error occurred while fetching events.';
    }
  } else {
    // Redirect to Google authorization if no auth code is found
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES)}&access_type=offline`;
    window.location.href = authUrl;
  }
}

// Function to list today's events
async function listEvents(accessToken) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${startOfDay}&timeMax=${endOfDay}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching events: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Function to display events in the HTML
function displayEvents(events) {
  const container = document.getElementById('events-container');
  container.innerHTML = ''; // Clear previous content

  if (events.length === 0) {
    container.innerText = 'No events found for today.';
    return;
  }

  events.forEach((event) => {
    const eventElement = document.createElement('div');
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);

    eventElement.innerHTML = `
      <h3>${event.summary || 'No Title'}</h3>
      <p><strong>Start:</strong> ${start.toLocaleString()}</p>
      <p><strong>End:</strong> ${end.toLocaleString()}</p>
    `;
    container.appendChild(eventElement);
  });
}

// Fetch events on page load
document.addEventListener('DOMContentLoaded', fetchCalendarEvents);
