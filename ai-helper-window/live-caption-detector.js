// Live Caption Detector - Unified module for live caption detection
console.log('📺 Live Caption Detector Loading...');

// Create a global live caption detector
window.liveCaptionDetector = {
  lastCaptionText: '',
  captionCheckInterval: null,
  debounceTimer: null,
  
  // Initialize the detector
  init: function() {
    console.log('📺 Initializing Live Caption Detector...');
    
    // Set up live caption observer with regular checking
    this.captionCheckInterval = setInterval(() => {
      this.checkForLiveCaptions();
    }, 500); // Check every 500ms for better responsiveness
    
    console.log('✅ Live Caption Detector initialized');
  },
  
  // Check for live captions on the page
  checkForLiveCaptions: function() {
    // console.log('🔍 Checking for live captions...');
    
    // Common selectors for live captions in meeting platforms
    const captionSelectors = [
      '[data-placeholder="Transcript"]', // Google Meet
      '[aria-label="Live captions"]', // Zoom
      '.iOzk7', // Google Meet captions class
      '.VfPpkd-YVzG2b', // Google Meet container
      '[data-self-name]', // Google Meet participant
      '.google-meet-participant', // Google Meet participant
      '.captions-timestamp', // Zoom captions
      '.speaker-label', // Speaker labels
      '.subtitles:not(#buzzer-ai-overlay .subtitles)', // Teams subtitles but exclude our own
      '[data-testid="caption-text"]', // Test ID for captions
      '.live-transcript-content', // More specific live transcript
      '.caption-text-content', // More specific caption text
      '.transcript-text-content' // More specific transcript text
    ];
    
    let captionsFound = false;
    
    for (const selector of captionSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          // Skip our own overlay elements
          if (element.closest('#buzzer-ai-overlay') || element.closest('.extension-window')) {
            // console.log(`⏭️ Skipping our own element with selector: ${selector}`);
            return;
          }
          
          // Skip elements that are part of our own components
          if (element.id === 'buzzer-live-caption' || 
              element.classList.contains('transcription-list') ||
              element.closest('.transcription-list')) {
            // console.log(`⏭️ Skipping our own component element with selector: ${selector}`);
            return;
          }
          
          if (element.textContent && element.textContent.trim() !== '') {
            const captionText = element.innerText || element.textContent;
            // console.log(`📝 Caption found with selector "${selector}":`, captionText);
            
            // Skip our own messages and empty messages
            if (captionText.includes('Transcription list initialized') || 
                captionText.includes('System audio transcription initialized') ||
                captionText.includes('Click an interviewer') ||
                captionText.includes('Help Me') ||
                captionText.includes('🎙️') ||
                captionText.includes('✅') ||
                captionText.includes('❌') ||
                captionText.includes('Failed to start system audio capture') ||
                captionText.includes('Please ensure tab audio permissions') ||
                captionText.trim().length < 3) { // Skip very short messages
              // console.log('⏭️ Skipping self-generated or empty message');
              return;
            }
            
            captionsFound = true;
            this.processLiveCaptionWithDebounce(captionText);
          }
        });
      } catch (e) {
        // Silently ignore errors to prevent spam
        // console.log(`⚠️ Error querying selector ${selector}:`, e.message);
      }
    }
    
    if (captionsFound) {
      // console.log('🔍 Caption check completed - captions found');
    }
  },
  
  // Process live caption text with debouncing to prevent spam
  processLiveCaptionWithDebounce: function(text) {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.processLiveCaption(text);
    }, 100); // Reduced to 100ms for better responsiveness
  },
  
  // Process live caption text and add to transcription
  processLiveCaption: function(text) {
    // console.log('📺 Processing live caption:', text);
    
    // Validate input
    if (!text || text.trim() === '') {
      // console.log('❌ Empty caption, skipping...');
      return;
    }
    
    const trimmedText = text.trim();
    
    // Skip our own test messages and UI text to prevent infinite loop
    if (trimmedText.includes('Transcription list initialized') || 
        trimmedText.includes('System audio transcription initialized') ||
        trimmedText.includes('Click an interviewer') ||
        trimmedText.includes('Help Me') ||
        trimmedText.includes('🎙️') ||
        trimmedText.includes('✅') ||
        trimmedText.includes('❌') ||
        trimmedText.includes('Failed to start system audio capture') ||
        trimmedText.includes('Please ensure tab audio permissions') ||
        trimmedText.length < 3) { // Skip very short messages
      // console.log('⏭️ Skipping self-generated or UI message to prevent loop');
      return;
    }
    
    // Skip if this is the same as the last caption (avoid duplicates)
    if (trimmedText === this.lastCaptionText) {
      // console.log('⏭️ Skipping duplicate caption');
      return;
    }
    
    // Always update the last caption text
    this.lastCaptionText = trimmedText;
    console.log('📺 Live caption detected:', trimmedText);
    
    // Use the bridge to add to transcription
    if (typeof window.addTranscriptionItem === 'function') {
      console.log('📝 Adding caption to transcription via bridge...');
      try {
        window.addTranscriptionItem('Interviewer', trimmedText, 'interviewer');
        console.log('✅ Live caption added to transcription successfully');
      } catch (error) {
        console.error('❌ Error adding live caption to transcription:', error);
      }
    } else {
      console.log('❌ addTranscriptionItem function not available');
    }
  },
  
  // Cleanup function
  cleanup: function() {
    console.log('🧹 Cleaning up Live Caption Detector...');
    
    // Clear any intervals to prevent memory leaks
    if (this.captionCheckInterval) {
      clearInterval(this.captionCheckInterval);
      this.captionCheckInterval = null;
    }
    
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    console.log('✅ Live Caption Detector cleaned up');
  }
};

// Initialize the detector
window.liveCaptionDetector.init();

// Add to global window object for easy access
window.checkForLiveCaptions = function() {
  if (window.liveCaptionDetector) {
    window.liveCaptionDetector.checkForLiveCaptions();
  }
};

window.processLiveCaption = function(text) {
  if (window.liveCaptionDetector) {
    window.liveCaptionDetector.processLiveCaption(text);
  }
};

console.log('✅ Live Caption Detector Ready');