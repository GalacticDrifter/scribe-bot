console.log('Inject script loaded');

// Function to find and observe the captions container
const findCaptionsContainer = () => {
  console.log('Searching for captions container...');
  // Look for any div that contains caption text
  const containers = document.querySelectorAll('div[jscontroller][jsaction]');
  
  for (let container of containers) {
    if (container.textContent.trim().length > 0) {
      console.log('Potential captions container found. Observing...');
      observeCaptions(container);
      return;
    }
  }
  
  console.log('Captions container not found. Retrying...');
  setTimeout(findCaptionsContainer, 1000);
};

// Function to observe changes in the captions container
const observeCaptions = (container) => {
  console.log('Setting up MutationObserver for captions container');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const captionText = container.textContent.trim();
        if (captionText.length > 0) {
          console.log('Caption detected:', captionText);
          sendCaptionToBackground(captionText);
        }
      }
    });
  });

  observer.observe(container, {
    childList: true,
    characterData: true,
    subtree: true
  });
  console.log('MutationObserver set up successfully');
};


// Function to send captured captions to the background script
const sendCaptionToBackground = (captionText) => {
  console.log('Sending caption to background:', captionText);
  chrome.runtime.sendMessage({ type: 'caption', text: captionText }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending caption:', chrome.runtime.lastError);
    } else {
      console.log('Caption sent successfully');
    }
  });
};

// Start observing the captions container
console.log('Starting caption observation process');
findCaptionsContainer();