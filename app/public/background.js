// background.js

// Import Socket.IO client
importScripts('socket.io.min.js');

let user_signed_in = false;
let user_access_token = null;
let user_token_valid_through = null;
let socket = null;

function create_oauth(client_id) {
  const CLIENT_ID = client_id;
  const REDIRECT_URI = chrome.identity.getRedirectURL();
  let auth_url = `https://accounts.google.com/o/oauth2/v2/auth?`;

  var auth_params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: "https://www.googleapis.com/auth/userinfo.email openid",
  };
  const url = new URLSearchParams(Object.entries(auth_params));
  url.toString();
  auth_url += url;

  return auth_url;
}


function connectSocket() {
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return;
  }

  console.log('Attempting to connect to backend socket...');

  socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Connected to backend');
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from backend:', reason);
    if (reason === 'io server disconnect') {
      console.log('Disconnected by server, attempting to reconnect...');
      connectSocket();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    console.error('Error details:', error.message, error.description);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

function sendCaptionsToBackend(captionText) {
  if (!socket || !socket.connected) {
    console.log('Socket not connected. Attempting to reconnect...');
    connectSocket();
    return;
  }

  console.log('Sending caption to backend:', captionText);
  socket.emit('advisor_transcription', captionText, (response) => {
    if (response && response.error) {
      console.error('Error sending caption:', response.error);
    } else {
      console.log('Caption sent successfully');
    }
  });
}

// Function to inject the content script
function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['inject.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error injecting script: ' + chrome.runtime.lastError.message);
    } else {
      console.log('Inject script injected successfully');
    }
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
    injectContentScript(tabId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.js received message:", request);

  if (request.message && request.message.message_type === "login") {
    if (user_signed_in && (user_access_token !== null) && (user_token_valid_through >= new Date())) {
      console.log("already signed in");
      sendResponse({
        message: "success",
        access_token: user_access_token,
        valid_through: user_token_valid_through
      });

    } else {
      chrome.identity.launchWebAuthFlow({
        url: create_oauth(request.message.client_id),
        interactive: true,
      }, function (redirect_uri) {
        let rep_str = redirect_uri.replace("#access_token", "?access_token");
        let url = new URL(rep_str);
        user_access_token = url.searchParams.get("access_token")
        const user_access_token_through = url.searchParams.get("expires_in")
        user_token_valid_through = new Date();
        user_token_valid_through.setSeconds(user_token_valid_through.getSeconds() + parseInt(user_access_token_through));
        console.log("token:" + user_access_token);
        console.log("token:" + user_token_valid_through.toISOString());
        if (chrome.runtime.lastError) {
          sendResponse({
            message: "fail"
          });
        } else {
          if (redirect_uri.includes("error")) {
            user_signed_in = false;
            sendResponse({
              message: "fail"
            });
          } else {
            if (user_access_token === null) {
              user_signed_in = false;
              sendResponse({
                message: "fail"
              });

            } else {
              user_signed_in = true;
              sendResponse({
                message: "success",
                access_token: user_access_token,
                valid_through: user_token_valid_through
              });

            }
          }
        }
      });
    }
  } else if (request.message && request.message.message_type === "clear") {
    chrome.identity.clearAllCachedAuthTokens(
      function (callback_check) {
        // do nothing
      }
    );
    user_access_token = null;
    user_signed_in = false;
  }
  

  // Listen for captions from the content script
  if (request.type === 'caption') {
    console.log('Caption received in background:', request.text);
    sendCaptionsToBackend(request.text);
  }

  return true;
});

// Service Worker specific code
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // If this is a navigation preload request
  if (event.preloadResponse) {
    event.respondWith(
      (async function() {
        try {
          const response = await event.preloadResponse;
          if (response) {
            return response;
          }
          return await fetch(event.request);
        } catch (e) {
          console.error('Preload failed:', e);
          return await fetch(event.request);
        }
      })()
    );
  }
});


// Initialize socket connection when the service worker starts
console.log('Initializing socket connection...');
connectSocket();