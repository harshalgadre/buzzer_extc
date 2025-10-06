// Verify Bridge - Tool to verify bridge functionality
console.log('🌉 Verify Bridge Tool Loading...');

// Function to verify bridge functionality
function verifyBridge() {
  console.log('🌉 Verifying bridge functionality...');
  
  // Test 1: Check if bridge exists
  console.log('=== Bridge Existence Test ===');
  if (window.buzzerOverlayBridge) {
    console.log('✅ Bridge exists');
  } else {
    console.log('❌ Bridge not found');
    return;
  }
  
  // Test 2: Check bridge functions
  console.log('=== Bridge Functions Test ===');
  const bridgeFunctions = [
    'addTranscriptionItem',
    'processLiveCaption', 
    'checkForLiveCaptions',
    'registerReactCallbacks'
  ];
  
  bridgeFunctions.forEach(funcName => {
    if (typeof window.buzzerOverlayBridge[funcName] === 'function') {
      console.log(`✅ Bridge function ${funcName} exists`);
    } else {
      console.log(`❌ Bridge function ${funcName} not found`);
    }
  });
  
  // Test 3: Check global functions
  console.log('=== Global Functions Test ===');
  const globalFunctions = [
    'addTranscriptionItem',
    'processLiveCaption',
    'checkForLiveCaptions'
  ];
  
  globalFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ Global function ${funcName} exists`);
    } else {
      console.log(`❌ Global function ${funcName} not found`);
    }
  });
  
  // Test 4: Check React integration
  console.log('=== React Integration Test ===');
  if (window.addTranscriptionItemToReact) {
    console.log('✅ React addTranscriptionItem function exists');
  } else {
    console.log('⚠️ React addTranscriptionItem function not found (may be normal if not React version)');
  }
  
  if (window.processLiveCaptionInReact) {
    console.log('✅ React processLiveCaption function exists');
  } else {
    console.log('⚠️ React processLiveCaption function not found (may be normal if not React version)');
  }
  
  if (window.checkForLiveCaptionsInReact) {
    console.log('✅ React checkForLiveCaptions function exists');
  } else {
    console.log('⚠️ React checkForLiveCaptions function not found (may be normal if not React version)');
  }
  
  // Test 5: Check non-React integration
  console.log('=== Non-React Integration Test ===');
  if (window.buzzerOverlayInstance) {
    console.log('✅ Non-React overlay instance exists');
    if (typeof window.buzzerOverlayInstance.addTranscriptionItem === 'function') {
      console.log('✅ Non-React addTranscriptionItem function exists');
    } else {
      console.log('❌ Non-React addTranscriptionItem function not found');
    }
  } else {
    console.log('⚠️ Non-React overlay instance not found (may be normal if React version)');
  }
  
  // Test 6: Check live caption detector
  console.log('=== Live Caption Detector Test ===');
  if (window.liveCaptionDetector) {
    console.log('✅ Live caption detector exists');
    const detectorFunctions = [
      'init',
      'checkForLiveCaptions',
      'processLiveCaptionWithDebounce',
      'processLiveCaption',
      'cleanup'
    ];
    
    detectorFunctions.forEach(funcName => {
      if (typeof window.liveCaptionDetector[funcName] === 'function') {
        console.log(`✅ Detector function ${funcName} exists`);
      } else {
        console.log(`❌ Detector function ${funcName} not found`);
      }
    });
  } else {
    console.log('❌ Live caption detector not found');
  }
  
  // Test 7: Try to call functions
  console.log('=== Function Call Test ===');
  try {
    if (typeof window.addTranscriptionItem === 'function') {
      console.log('📝 Calling addTranscriptionItem...');
      window.addTranscriptionItem('Verify', 'Bridge verification test message', 'interviewer');
      console.log('✅ addTranscriptionItem call successful');
    }
  } catch (error) {
    console.log('❌ addTranscriptionItem call failed:', error.message);
  }
  
  try {
    if (typeof window.processLiveCaption === 'function') {
      console.log('📝 Calling processLiveCaption...');
      window.processLiveCaption('Bridge verification test caption');
      console.log('✅ processLiveCaption call successful');
    }
  } catch (error) {
    console.log('❌ processLiveCaption call failed:', error.message);
  }
  
  try {
    if (typeof window.checkForLiveCaptions === 'function') {
      console.log('📝 Calling checkForLiveCaptions...');
      window.checkForLiveCaptions();
      console.log('✅ checkForLiveCaptions call successful');
    }
  } catch (error) {
    console.log('❌ checkForLiveCaptions call failed:', error.message);
  }
  
  console.log('=== Bridge Verification Complete ===');
}

// Run verification after a short delay to ensure everything is loaded
setTimeout(verifyBridge, 2000);

console.log('✅ Verify Bridge Tool Ready');