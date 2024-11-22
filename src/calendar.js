const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CLIENT_ID = '79987944929-ib5s7kotamfa74porgsv1jqhifr1n2b0.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/calendar.html';

// Function to redirect to Google login
function connectGoogleCalendar() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}&include_granted_scopes=true&access_type=offline`;
  window.location.href = authUrl;
}

// Function to handle user authentication and exchange authorization code for access token
async function handleAuthentication() {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  if (authCode) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: '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',
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
        if (!events || events.length === 0) {
          alert('No events found in your Google Calendar.');
          return;
        }

        processPlaylistBasedOnSchedule(events);
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

function analyzeSchedule(events) {
  let busyMinutes = 0;

  events.forEach((event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    busyMinutes += (end - start) / (1000 * 60);
  });

  // Determine mood based on busy minutes
  if (busyMinutes > 240) return 'relaxing';
  if (busyMinutes > 120) return 'energetic';
  return 'chill'; // Less than 2 hours
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

    if (!response.ok) {
      throw new Error(`Google Calendar API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    alert(`Failed to fetch events: ${error.message}`);
    return [];
  }
}

// Function to show the "Go to Next Page" button
function showNextPageButton() {
  const nextPageButton = document.getElementById('next-page-button');
  if (nextPageButton) {
    nextPageButton.style.display = 'block';
  }
}

// Wrap event listeners in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', connectGoogleCalendar);
  }

  const nextPageButton = document.getElementById('go-to-next-page');
  if (nextPageButton) {
    nextPageButton.addEventListener('click', goToNextPage);
  }
});

// Handle authentication on page load
window.onload = handleAuthentication;
