// Comprehensive debug script for Buzzer transcription functionality
console.log('=== Buzzer Comprehensive Debug Script ===');

// Check if overlay instance exists
console.log('1. Checking for buzzerOverlayInstance...');
if (!window.buzzerOverlayInstance) {
  console.error('❌ buzzerOverlayInstance not found!');
  console.log('Please ensure the AI Helper overlay is active.');
} else {
  console.log('✅ buzzerOverlayInstance found');
  
  // Check overlay properties
  console.log('2. Checking overlay properties...');
  console.log('   - Active tab:', window.buzzerOverlayInstance.activeTab);
  console.log('   - Transcription items count:', window.buzzerOverlayInstance.transcriptionItems?.length || 0);
  console.log('   - Is screen sharing:', window.buzzerOverlayInstance.isScreenSharing);
  console.log('   - Is user mic on:', window.buzzerOverlayInstance.isUserMicOn);
  
  // Check DOM elements
  console.log('3. Checking DOM elements...');
  const overlay = document.getElementById('buzzer-ai-overlay');
  if (overlay) {
    console.log('✅ Overlay element found');
    
    const transcriptionList = overlay.querySelector('.transcription-list');
    if (transcriptionList) {
      console.log('✅ Transcription list element found');
      console.log('   - Current children count:', transcriptionList.children.length);
    } else {
      console.error('❌ Transcription list element not found!');
    }
    
    const panelContent = overlay.querySelector('.panel-content');
    if (panelContent) {
      console.log('✅ Panel content element found');
    } else {
      console.error('❌ Panel content element not found!');
    }
  } else {
    console.error('❌ Overlay element not found!');
  }
  
  // Test adding a transcription item
  console.log('4. Testing transcription item addition...');
  try {
    const testSpeaker = 'Debug Test';
    const testText = 'This is a comprehensive debug test message at ' + new Date().toLocaleTimeString();
    const testType = 'interviewer';
    
    console.log('   Adding item:', { speaker: testSpeaker, text: testText, type: testType });
    window.buzzerOverlayInstance.addTranscriptionItem(testSpeaker, testText, testType);
    console.log('✅ Transcription item added successfully');
    
    // Check if it was added to DOM
    setTimeout(() => {
      const list = document.querySelector('.transcription-list');
      if (list) {
        console.log('   Transcription list now has', list.children.length, 'children');
      }
    }, 100);
  } catch (error) {
    console.error('❌ Failed to add transcription item:', error);
  }
  
  // Test live caption processing
  console.log('5. Testing live caption processing...');
  try {
    const testCaption = 'Debug live caption test at ' + new Date().toLocaleTimeString();
    console.log('   Processing caption:', testCaption);
    window.buzzerOverlayInstance.processLiveCaption(testCaption);
    console.log('✅ Live caption processed successfully');
  } catch (error) {
    console.error('❌ Failed to process live caption:', error);
  }
  
  // Test caption detection
  console.log('6. Testing caption detection...');
  try {
    if (typeof window.buzzerOverlayInstance.checkForLiveCaptions === 'function') {
      console.log('   Calling checkForLiveCaptions...');
      window.buzzerOverlayInstance.checkForLiveCaptions();
      console.log('✅ Caption detection completed');
    } else {
      console.error('❌ checkForLiveCaptions method not found');
    }
  } catch (error) {
    console.error('❌ Failed to run caption detection:', error);
  }
  
  // Check all methods exist
  console.log('7. Checking required methods...');
  const requiredMethods = [
    'addTranscriptionItem',
    'processLiveCaption',
    'checkForLiveCaptions',
    'processLiveCaptionWithDebounce'
  ];
  
  requiredMethods.forEach(method => {
    if (typeof window.buzzerOverlayInstance[method] === 'function') {
      console.log('✅ Method exists:', method);
    } else {
      console.error('❌ Method missing:', method);
    }
  });
}

console.log('=== Debug script completed ===');