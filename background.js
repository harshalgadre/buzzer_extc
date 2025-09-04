let tabCaptureStream = null;
let mediaRecorder = null;
let audioChunks = [];

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
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