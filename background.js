let tabCaptureStream = null;
let mediaRecorder = null;
let audioChunks = [];
let aiHelperWindowId = null;

// Utility function to get aspect ratio
function getAspectRatio(width, height) {
  return width / height;
}

// Enhanced tab capture function with configurable resolutions
function captureTabUsingTabCapture(resolutions = null, enableSpeakers = true) {
  // Default resolutions if not provided
  const defaultResolutions = {
    maxWidth: 1920,
    maxHeight: 1080,
    minWidth: 640,
    minHeight: 480
  };
  
  const finalResolutions = resolutions || defaultResolutions;

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(arrayOfTabs) {
    if (chrome.runtime.lastError) {
      console.error('Error querying tabs:', chrome.runtime.lastError);
      return;
    }

    const activeTab = arrayOfTabs[0];
    const activeTabId = activeTab.id;

    const constraints = {
      video: true,
      videoConstraints: {
        mandatory: {
          chromeMediaSource: 'tab',
          maxWidth: finalResolutions.maxWidth,
          maxHeight: finalResolutions.maxHeight,
          minWidth: finalResolutions.minWidth,
          minHeight: finalResolutions.minHeight,
          minAspectRatio: getAspectRatio(finalResolutions.maxWidth, finalResolutions.maxHeight),
          maxAspectRatio: getAspectRatio(finalResolutions.maxWidth, finalResolutions.maxHeight),
          minFrameRate: 64,
          maxFrameRate: 128
        }
      }
    };

    if (enableSpeakers) {
      constraints.audio = true;
      constraints.audioConstraints = {
        mandatory: {
          echoCancellation: true
        },
        optional: [{
          googDisableLocalEcho: false // https://www.chromestatus.com/feature/5056629556903936
        }]
      };
    }

    // chrome.tabCapture.onStatusChanged.addListener(function(event) { /* event.status */ });

    chrome.tabCapture.capture(constraints, function(stream) {
      if (chrome.runtime.lastError) {
        console.error('Tab capture error:', chrome.runtime.lastError);
        // Notify content script of error
        chrome.tabs.sendMessage(activeTabId, {
          action: 'tabCaptureError',
          error: chrome.runtime.lastError.message
        });
        return;
      }
      
      gotTabCaptureStream(stream, constraints, activeTabId);
    });
  });
}

// Handle the captured tab stream
function gotTabCaptureStream(stream, constraints, tabId) {
  if (!stream) {
    console.error('No stream received from tab capture');
    chrome.tabs.sendMessage(tabId, {
      action: 'tabCaptureError',
      error: 'No stream received'
    });
    return;
  }

  console.log('Tab capture stream received:', stream);
  tabCaptureStream = stream;

  // Get audio tracks for processing
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length > 0) {
    console.log('Audio tracks found:', audioTracks.length);
    
    // Initialize media recorder for audio processing
    try {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks = [];
      
      mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          
          // Send audio chunk to content script for processing
          chrome.tabs.sendMessage(tabId, {
            action: 'systemAudioChunk',
            data: event.data
          });
        }
      };
      
      mediaRecorder.onstop = function() {
        console.log('Media recorder stopped');
      };
      
      // Start recording with 1-second chunks for real-time processing
      mediaRecorder.start(1000);
      
      // Notify content script that capture started successfully
      chrome.tabs.sendMessage(tabId, {
        action: 'tabCaptureStarted',
        hasAudio: audioTracks.length > 0,
        hasVideo: stream.getVideoTracks().length > 0
      });
      
    } catch (error) {
      console.error('Failed to initialize MediaRecorder:', error);
      chrome.tabs.sendMessage(tabId, {
        action: 'tabCaptureError',
        error: 'Failed to initialize audio recording'
      });
    }
  } else {
    console.log('No audio tracks in stream');
    chrome.tabs.sendMessage(tabId, {
      action: 'tabCaptureError',
      error: 'No audio tracks found in tab'
    });
  }

  // Handle stream end
  stream.addEventListener('ended', () => {
    console.log('Tab capture stream ended');
    tabCaptureStream = null;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    chrome.tabs.sendMessage(tabId, {
      action: 'tabCaptureEnded'
    });
  });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  
  // Handle meeting joined notification from content script
  if (message.action === 'meetingJoined') {
    console.log('Meeting joined on:', message.platform, message.url);
    openAIHelperWindow();
    sendResponse({ success: true });
    return true;
  }

  // Handle AI helper window open request from popup
  if (message.action === 'openAIHelper') {
    openAIHelperWindow();
    sendResponse({ success: true });
    return true;
  }

  // Handle AI helper window open request with screen sharing already active
  if (message.action === 'openAIHelperWithScreenShare') {
    openAIHelperWindow(true);
    sendResponse({ success: true });
    return true;
  }

  // Handle manual AI helper trigger from content script
  if (message.action === 'showAIHelper') {
    console.log('Manual AI helper trigger received');
    openAIHelperWindow();
    sendResponse({ success: true });
    return true;
  }

  // Handle enhanced tab capture request
  if (message.action === 'startTabCapture') {
    console.log('Starting enhanced tab capture');
    const resolutions = message.resolutions || null;
    const enableSpeakers = message.enableSpeakers !== false; // default to true
    captureTabUsingTabCapture(resolutions, enableSpeakers);
    sendResponse({ success: true });
    return true;
  }

  // Handle stop tab capture request
  if (message.action === 'stopTabCapture') {
    console.log('Stopping tab capture');
    if (tabCaptureStream) {
      tabCaptureStream.getTracks().forEach(track => {
        track.stop();
      });
      tabCaptureStream = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    sendResponse({ success: true });
    return true;
  }
  if (message.action === 'captureSystemAudio') {
    // Use tabCapture API to capture system audio
    chrome.tabCapture.capture({ audio: true, video: false }, function(stream) {
      if (stream) {
        tabCaptureStream = stream;
        audioChunks = [];
        
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        // Process audio chunks every 3 seconds for continuous transcription
        mediaRecorder.ondataavailable = function(event) {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
            
            // Create blob from current chunk for processing
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            
            // Send audio chunk to content script for processing
            chrome.runtime.sendMessage({
              action: 'audioChunk',
              data: audioBlob
            });
          }
        };
        
        mediaRecorder.onstop = function() {
          // Final processing when recording stops
          if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            chrome.runtime.sendMessage({
              action: 'audioData',
              data: audioBlob,
              final: true
            });
          }
          
          // Clean up
          if (tabCaptureStream) {
            tabCaptureStream.getTracks().forEach(track => track.stop());
            tabCaptureStream = null;
          }
          audioChunks = [];
        };
        
        // Start recording with 3-second chunks for continuous processing
        mediaRecorder.start(3000); // 3-second timeslices
        console.log('✅ System audio capture started with continuous processing');
        
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to capture tab audio' });
      }
    });
    
    return true; // Keep the message channel open for the async response
  }
  
  if (message.action === 'stopCapture') {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (tabCaptureStream) {
      tabCaptureStream.getTracks().forEach(track => track.stop());
      tabCaptureStream = null;
    }
    
    sendResponse({ success: true });
    return true;
  }
});

// Function to open AI Helper window
async function openAIHelperWindow(hasScreenShare = false) {
  try {
    // Get the active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      console.error('No active tab found');
      return;
    }

    // Check if overlay already exists on this tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        return document.getElementById('buzzer-ai-overlay') !== null;
      }
    });

    if (results[0]?.result) {
      // Overlay already exists, just show it
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          const overlay = document.getElementById('buzzer-ai-overlay');
          if (overlay) {
            overlay.style.display = 'flex';
          }
        }
      });
      return;
    }

    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId: activeTab.id },
      files: ['ai-helper-window/styles.css']
    });

    // Then inject the HTML and JavaScript with screen sharing state
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (hasScreenShare) => {
        window.buzzerScreenShareActive = hasScreenShare;
      },
      args: [hasScreenShare]
    });
    
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['ai-helper-window/inject-overlay.js']
    });

    console.log('AI Helper overlay injected into tab:', activeTab.id);

  } catch (error) {
    console.error('Failed to open AI Helper overlay:', error);
  }
}