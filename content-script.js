// Content script to detect meeting join and automatically open AI helper
(function() {
  let meetingDetected = false;
  let observer = null;

  // Meeting detection patterns
  const meetingIndicators = {
    google: [
      '[data-self-name]', // Google Meet participant
      '[jscontroller="kWHSsc"]', // Meet controls
      '.google-meet-participant'
    ],
    zoom: [
      '#wc-container-right', // Zoom controls
      '.participants-list-container',
      '[aria-label*="mute"]'
    ],
    teams: [
      '[data-tid="calling-screen"]',
      '.calling-screen',
      '[data-tid="roster-content"]'
    ]
  };

  function detectMeetingPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('meet.google.com')) return 'google';
    if (hostname.includes('zoom.us')) return 'zoom';
    if (hostname.includes('teams.microsoft.com')) return 'teams';
    return null;
  }

  function checkForMeetingJoin() {
    const platform = detectMeetingPlatform();
    if (!platform) return false;

    const indicators = meetingIndicators[platform];
    return indicators.some(selector => document.querySelector(selector));
  }

  function notifyMeetingJoined() {
    if (meetingDetected) return;
    
    meetingDetected = true;
    console.log('Meeting joined detected, notifying extension...');
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'meetingJoined',
      platform: detectMeetingPlatform(),
      url: window.location.href
    }).catch(err => console.log('Failed to notify extension:', err));
  }

  function startMeetingDetection() {
    // Initial check
    if (checkForMeetingJoin()) {
      setTimeout(notifyMeetingJoined, 2000); // Small delay to ensure meeting is fully loaded
      return;
    }

    // Set up observer for dynamic content
    observer = new MutationObserver((mutations) => {
      if (checkForMeetingJoin()) {
        setTimeout(notifyMeetingJoined, 2000);
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Fallback timeout check
    setTimeout(() => {
      if (!meetingDetected && checkForMeetingJoin()) {
        notifyMeetingJoined();
      }
    }, 10000);
  }

  // Start detection when page is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMeetingDetection);
  } else {
    startMeetingDetection();
  }

  // Handle navigation changes (SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      meetingDetected = false;
      startMeetingDetection();
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for messages from webpage or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'trigger_ai_helper') {
      console.log('Manual AI helper trigger received');
      // Notify background script to show overlay
      chrome.runtime.sendMessage({
        action: 'showAIHelper',
        manual: true,
        url: window.location.href
      });
      sendResponse({ success: true });
    }
    return true; // Will respond asynchronously
  });

})();