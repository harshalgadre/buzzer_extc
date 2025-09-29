// overlay-bridge.js - Bridge between popup.js and ExtensionWindow.jsx
// This file handles the screen sharing initiation and passes data to the React component

(function() {
  // Prevent multiple injections
  if (window.BuzzerAIHelper) {
    return;
  }

  class BuzzerAIHelper {
    constructor() {
      this.isScreenSharing = false;
      this.isUserMicOn = false;
      this.screenStream = null;
      this.userMicStream = null;
      this.systemRecognition = null;
      this.userRecognition = null;
      this.transcriptionItems = [];
      this.callbacks = [];
      
      this.init();
    }

    init() {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.setupSpeechRecognition();
      }

      // Listen for messages from extension
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'startScreenSharing') {
          this.startScreenSharing().then(sendResponse);
          return true;
        }
        if (message.action === 'toggleUserMic') {
          this.toggleUserMic().then(sendResponse);
          return true;
        }
      });
    }

    setupSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // System audio recognition (for interviewer)
      this.systemRecognition = new SpeechRecognition();
      this.systemRecognition.continuous = true;
      this.systemRecognition.interimResults = false;
      this.systemRecognition.lang = 'en-US';
      
      this.systemRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript) {
            this.addTranscriptionItem('Interviewer', transcript, 'interviewer');
          }
        }
      };
      
      this.systemRecognition.onerror = (event) => {
        console.error('System STT error:', event.error);
      };

      // User microphone recognition
      this.userRecognition = new SpeechRecognition();
      this.userRecognition.continuous = true;
      this.userRecognition.interimResults = false;
      this.userRecognition.lang = 'en-US';
      
      this.userRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript) {
            this.addTranscriptionItem('User', transcript, 'user');
          }
        }
      };
      
      this.userRecognition.onerror = (event) => {
        console.error('User STT error:', event.error);
      };
    }

    async startScreenSharing() {
      try {
        // Request screen sharing with audio
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        this.screenStream = stream;
        this.isScreenSharing = true;
        
        // Start system audio STT
        if (stream.getAudioTracks().length > 0 && this.systemRecognition) {
          this.systemRecognition.start();
          this.addTranscriptionItem('AI', 'Started capturing system audio and transcribing interviewer speech.', 'ai');
        }
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          this.stopScreenSharing();
        };
        
        this.notifyCallbacks('screenSharingStarted');
        return { success: true };
        
      } catch (error) {
        console.error('Screen sharing failed:', error);
        this.addTranscriptionItem('AI', 'Screen sharing failed. Please try again and allow permissions.', 'ai');
        return { success: false, error: error.message };
      }
    }

    stopScreenSharing() {
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      if (this.systemRecognition) {
        try {
          this.systemRecognition.stop();
        } catch (e) {
          console.log('System recognition already stopped');
        }
      }
      
      this.isScreenSharing = false;
      this.addTranscriptionItem('AI', 'Stopped screen sharing and system audio capture.', 'ai');
      this.notifyCallbacks('screenSharingStopped');
    }

    async toggleUserMic() {
      if (!this.isUserMicOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.userMicStream = stream;
          this.isUserMicOn = true;
          
          if (this.userRecognition) {
            this.userRecognition.start();
          }
          
          this.addTranscriptionItem('AI', 'Started capturing your microphone audio.', 'ai');
          this.notifyCallbacks('userMicStarted');
          return { success: true };
        } catch (error) {
          console.error('Microphone access failed:', error);
          this.addTranscriptionItem('AI', 'Microphone access failed. Please allow microphone permissions.', 'ai');
          return { success: false, error: error.message };
        }
      } else {
        if (this.userMicStream) {
          this.userMicStream.getTracks().forEach(track => track.stop());
          this.userMicStream = null;
        }
        
        if (this.userRecognition) {
          try {
            this.userRecognition.stop();
          } catch (e) {
            console.log('User recognition already stopped');
          }
        }
        
        this.isUserMicOn = false;
        this.addTranscriptionItem('AI', 'Stopped microphone capture.', 'ai');
        this.notifyCallbacks('userMicStopped');
        return { success: true };
      }
    }

    addTranscriptionItem(speaker, text, type) {
      const item = {
        id: Date.now() + Math.random(),
        speaker,
        text,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      this.transcriptionItems.push(item);
      this.notifyCallbacks('transcriptionAdded', item);
    }

    onCallback(callback) {
      this.callbacks.push(callback);
    }

    notifyCallbacks(event, data) {
      this.callbacks.forEach(callback => {
        try {
          callback(event, data);
        } catch (error) {
          console.error('Callback error:', error);
        }
      });
    }

    getState() {
      return {
        isScreenSharing: this.isScreenSharing,
        isUserMicOn: this.isUserMicOn,
        transcriptionItems: this.transcriptionItems
      };
    }
  }

  // Initialize the helper
  window.BuzzerAIHelper = new BuzzerAIHelper();
  
  // Notify that the helper is ready
  console.log('Buzzer AI Helper initialized');
})();