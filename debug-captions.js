// Debug Captions - Tool to debug live caption detection
console.log('🔍 Debug Captions Tool Loading...');

// Function to test live caption detection
function debugLiveCaptions() {
  console.log('🔍 Debugging live captions...');
  
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
    '.subtitles', // Teams subtitles
    '[data-testid="caption-text"]', // Test ID for captions
    '.live-transcript-content', // More specific live transcript
    '.caption-text-content', // More specific caption text
    '.transcript-text-content' // More specific transcript text
  ];
  
  console.log('🔍 Testing caption selectors...');
  
  let foundElements = 0;
  let foundCaptions = 0;
  
  for (const selector of captionSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        foundElements += elements.length;
        
        elements.forEach((element, index) => {
          // Skip our own overlay elements
          if (element.closest('#buzzer-ai-overlay') || element.closest('.extension-window')) {
            console.log(`⏭️ Skipping our own element ${index + 1} with selector: ${selector}`);
            return;
          }
          
          const text = element.textContent || element.innerText;
          if (text && text.trim() !== '') {
            console.log(`📝 Caption ${index + 1} with selector "${selector}":`, text);
            foundCaptions++;
          } else {
            console.log(`EmptyEntries ${index + 1} with selector "${selector}"`);
          }
        });
      }
    } catch (e) {
      console.log(`⚠️ Error querying selector ${selector}:`, e.message);
    }
  }
  
  console.log(`🔍 Debug completed. Found ${foundElements} elements and ${foundCaptions} captions.`);
  
  // Test bridge functions
  console.log('🔍 Testing bridge functions...');
  
  if (typeof window.addTranscriptionItem === 'function') {
    console.log('✅ addTranscriptionItem function exists');
    // Test call
    window.addTranscriptionItem('Debug', 'Debug test message', 'interviewer');
  } else {
    console.log('❌ addTranscriptionItem function not found');
  }
  
  if (typeof window.processLiveCaption === 'function') {
    console.log('✅ processLiveCaption function exists');
    // Test call
    window.processLiveCaption('Debug test caption');
  } else {
    console.log('❌ processLiveCaption function not found');
  }
  
  if (typeof window.checkForLiveCaptions === 'function') {
    console.log('✅ checkForLiveCaptions function exists');
    // Test call
    window.checkForLiveCaptions();
  } else {
    console.log('❌ checkForLiveCaptions function not found');
  }
}

// Run debug after a short delay
setTimeout(debugLiveCaptions, 3000);

console.log('✅ Debug Captions Tool Ready');