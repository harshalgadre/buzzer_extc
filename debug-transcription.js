// Debug script to test transcription functionality
console.log('=== Buzzer Transcription Debug Script ===');

// Test if the overlay instance exists
if (window.buzzerOverlayInstance) {
  console.log('✅ buzzerOverlayInstance found');
  
  // Test adding a transcription item directly
  console.log('Testing direct transcription item addition...');
  try {
    window.buzzerOverlayInstance.addTranscriptionItem('Debug', 'This is a test transcription item', 'interviewer');
    console.log('✅ Direct transcription item added successfully');
  } catch (error) {
    console.error('❌ Failed to add direct transcription item:', error);
  }
  
  // Test the live caption processing
  console.log('Testing live caption processing...');
  try {
    window.buzzerOverlayInstance.processLiveCaption('This is a test live caption');
    console.log('✅ Live caption processed successfully');
  } catch (error) {
    console.error('❌ Failed to process live caption:', error);
  }
  
  // Check if the transcription list element exists
  const transcriptionList = document.querySelector('.transcription-list');
  if (transcriptionList) {
    console.log('✅ Transcription list element found');
    console.log('📝 Current transcription items:', transcriptionList.children.length);
  } else {
    console.error('❌ Transcription list element not found');
  }
  
  // Check the transcription items array
  if (window.buzzerOverlayInstance.transcriptionItems) {
    console.log('✅ Transcription items array found');
    console.log('📝 Transcription items count:', window.buzzerOverlayInstance.transcriptionItems.length);
  } else {
    console.error('❌ Transcription items array not found');
  }
  
} else {
  console.error('❌ buzzerOverlayInstance not found');
}

// Test the checkForLiveCaptions method
if (window.buzzerOverlayInstance && typeof window.buzzerOverlayInstance.checkForLiveCaptions === 'function') {
  console.log('Testing caption detection...');
  window.buzzerOverlayInstance.checkForLiveCaptions();
} else {
  console.error('❌ checkForLiveCaptions method not available');
}

console.log('=== Debug script completed ===');