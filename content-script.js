// Content script to detect meeting join and automatically open AI helper
(function() {
  let meetingDetected = false;
  let observer = null;
  let audioPermissionRequested = false;

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
    
    // Handle audio permission request from background script
    if (request.action === 'requestAudioPermission') {
      console.log('🔔 Audio permission requested by extension');
      
      // Show a visual indicator to the user that audio permission is needed
      showAudioPermissionIndicator();
      
      // Request tab audio capture
      requestTabAudioCapture();
      
      sendResponse({ success: true });
    }
    
    // Handle system audio chunk from background script
    if (request.action === 'systemAudioChunk') {
      console.log('📡 Received system audio chunk from background');
      // Forward to AI helper overlay if it exists
      if (window.buzzerOverlayInstance) {
        // This would be where you'd send the audio to a speech recognition service
        console.log('🔊 System audio chunk forwarded to AI helper');
      }
    }
    
    return true; // Will respond asynchronously
  });

  // Show visual indicator for audio permission request
  function showAudioPermissionIndicator() {
    // Create a notification element
    const notification = document.createElement('div');
    notification.id = 'buzzer-audio-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">🎤</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Audio Permission Needed</div>
          <div>Please allow tab audio access for transcription</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  // Request tab audio capture
  function requestTabAudioCapture() {
    if (audioPermissionRequested) {
      console.log('Audio permission already requested');
      return;
    }
    
    audioPermissionRequested = true;
    
    // Send message to background script to initiate audio capture
    chrome.runtime.sendMessage({
      action: 'captureSystemAudio'
    }).then(response => {
      if (response && response.success) {
        console.log('✅ Audio capture started successfully');
        // Show success indicator
        showAudioSuccessIndicator();
      } else {
        console.error('❌ Failed to start audio capture:', response?.error);
        showAudioErrorIndicator(response?.error || 'Failed to start audio capture');
      }
    }).catch(error => {
      console.error('❌ Error requesting audio capture:', error);
      showAudioErrorIndicator('Error requesting audio permission');
    });
  }

  // Show success indicator
  function showAudioSuccessIndicator() {
    const notification = document.createElement('div');
    notification.id = 'buzzer-audio-success';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">✅</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Audio Access Granted</div>
          <div>System audio will be transcribed</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Show error indicator
  function showAudioErrorIndicator(error) {
    const notification = document.createElement('div');
    notification.id = 'buzzer-audio-error';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">❌</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Audio Access Denied</div>
          <div style="font-size: 12px;">${error}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

})();