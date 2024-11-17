// Include the Google API client library
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let gapiLoaded = false;

/**
 * Load the Google API client library and initialize it.
 */
function loadGapi() {
  if (!gapiLoaded) {
    gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with your API key
        clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace with your client ID
        scope: SCOPES,
      });
      gapiLoaded = true;
    });
  }
}

/**
 * Sign in the user upon button click.
 */
function handleAuthClick() {
  if (!gapiLoaded) {
    console.error('GAPI not loaded yet. Try again later.');
    return;
  }
  gapi.auth2.getAuthInstance().signIn().then(() => {
    listEvents();
  });
}

/**
 * Sign out the user upon button click.
 */
function handleSignoutClick() {
  if (!gapiLoaded) {
    console.error('GAPI not loaded yet. Try again later.');
    return;
  }
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * List the next 10 events on the user's primary calendar.
 */
function listEvents() {
  gapi.client.calendar.events
    .list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })
    .then((response) => {
      const events = response.result.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.forEach((event) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    })
    .catch((error) => {
      console.error('Error fetching events', error);
    });
}

// Add event listeners to the buttons
document.getElementById('auth-button').addEventListener('click', handleAuthClick);

// Load the GAPI library when the page loads
document.addEventListener('DOMContentLoaded', loadGapi);
