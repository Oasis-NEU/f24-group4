const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CLIENT_ID = '79987944929-l9v1f4imvt83bbc8b080mjkff6ut82iu.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCekAi7h3qbfRi8Eh402GL1VC7FD2DWfRk';
const REDIRECT_URI = window.location.origin + '/calendar.html'; // Update if needed

// Function to redirect to Google login
function connectGoogleCalendar() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}&include_granted_scopes=true`;
  window.location.href = authUrl; // Redirect to Google authorization
}

// Function to handle user authentication
function handleAuthentication() {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get('access_token');

  if (accessToken) {
    // Store access token in localStorage (optional)
    localStorage.setItem('googleCalendarAccessToken', accessToken);

    // Show the "Go to Next Page" button
    document.getElementById('next-page-button').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';

    // Load events after authentication
    listEvents(accessToken);
  } else {
    // If no access token, show the login button
    document.getElementById('login-button').style.display = 'block';
    document.getElementById('next-page-button').style.display = 'none';
  }
}

// Function to list the next 10 events on the user's primary calendar
async function listEvents(accessToken) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`,
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
      console.log('Upcoming 10 events:');
      data.items.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        const eventElement = document.createElement('div');
        eventElement.textContent = `${start} - ${event.summary}`;
        eventsContainer.appendChild(eventElement);
      });
    } else {
      console.log('No upcoming events found.');
      eventsContainer.textContent = 'No upcoming events found.';
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    alert('Failed to fetch events. Please try again.');
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
