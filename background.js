let tabCaptureStream = null;
let mediaRecorder = null;
let audioChunks = [];
let aiHelperWindowId = null;

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
  if (message.action === 'captureSystemAudio') {
    // Use tabCapture API to capture system audio
    chrome.tabCapture.capture({ audio: true, video: false }, function(stream) {
      if (stream) {
        tabCaptureStream = stream;
        audioChunks = [];
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = function(event) {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = function() {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Convert blob to array buffer to send to popup
          const reader = new FileReader();
          reader.onload = function() {
            chrome.runtime.sendMessage({
              action: 'audioData',
              data: reader.result
            });
          };
          reader.readAsArrayBuffer(audioBlob);
          
          // Clean up
          if (tabCaptureStream) {
            tabCaptureStream.getTracks().forEach(track => track.stop());
            tabCaptureStream = null;
          }
        };
        
        mediaRecorder.start();
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