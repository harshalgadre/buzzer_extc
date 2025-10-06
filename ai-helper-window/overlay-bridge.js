// Overlay Bridge - Connects content script with React component
// This script provides a bridge between the content script and the React component

console.log('🌉 Overlay Bridge Loading...');

// Create a bridge object
window.buzzerOverlayBridge = {
  // Store callbacks
  callbacks: {},
  
  // Add transcription item
  addTranscriptionItem: function(speaker, text, type) {
    console.log('🌉 Bridge: addTranscriptionItem called', { speaker, text, type });
    
    // If we're in the React version, try to call its method
    if (window.addTranscriptionItemToReact) {
      window.addTranscriptionItemToReact(speaker, text, type);
    } 
    // If we're in the original version, call the overlay instance method
    else if (window.buzzerOverlayInstance && typeof window.buzzerOverlayInstance.addTranscriptionItem === 'function') {
      window.buzzerOverlayInstance.addTranscriptionItem(speaker, text, type);
    }
    // If neither is available, store it for later
    else {
      console.log('🌉 Bridge: No target found, storing for later');
      if (!this.callbacks.pendingItems) {
        this.callbacks.pendingItems = [];
      }
      this.callbacks.pendingItems.push({ speaker, text, type });
    }
  },
  
  // Process live caption
  processLiveCaption: function(text) {
    console.log('🌉 Bridge: processLiveCaption called', text);
    
    // If we're in the React version, try to call its method
    if (window.processLiveCaptionInReact) {
      window.processLiveCaptionInReact(text);
    } 
    // If we're in the original version, call the overlay instance method
    else if (window.buzzerOverlayInstance && typeof window.buzzerOverlayInstance.processLiveCaption === 'function') {
      window.buzzerOverlayInstance.processLiveCaption(text);
    }
  },
  
  // Check for live captions
  checkForLiveCaptions: function() {
    console.log('🌉 Bridge: checkForLiveCaptions called');
    
    // If we're in the React version, try to call its method
    if (window.checkForLiveCaptionsInReact) {
      window.checkForLiveCaptionsInReact();
    } 
    // If we're in the original version, call the overlay instance method
    else if (window.buzzerOverlayInstance && typeof window.buzzerOverlayInstance.checkForLiveCaptions === 'function') {
      window.buzzerOverlayInstance.checkForLiveCaptions();
    }
  },
  
  // Register React callbacks
  registerReactCallbacks: function(callbacks) {
    console.log('🌉 Bridge: Registering React callbacks');
    this.callbacks = { ...this.callbacks, ...callbacks };
    
    // If there are pending items, process them
    if (this.callbacks.pendingItems && this.callbacks.pendingItems.length > 0) {
      console.log('🌉 Bridge: Processing pending items');
      this.callbacks.pendingItems.forEach(item => {
        if (this.callbacks.addTranscriptionItem) {
          this.callbacks.addTranscriptionItem(item.speaker, item.text, item.type);
        }
      });
      this.callbacks.pendingItems = [];
    }
  }
};

// Make bridge functions globally accessible
window.addTranscriptionItem = function(speaker, text, type) {
  window.buzzerOverlayBridge.addTranscriptionItem(speaker, text, type);
};

window.processLiveCaption = function(text) {
  window.buzzerOverlayBridge.processLiveCaption(text);
};

window.checkForLiveCaptions = function() {
  window.buzzerOverlayBridge.checkForLiveCaptions();
};

console.log('✅ Overlay Bridge Ready');