// Test Bridge - Simple test to verify bridge functionality
console.log('🧪 Test Bridge Loading...');

// Test the bridge functionality
function testBridge() {
  console.log('🧪 Testing bridge functionality...');
  
  // Test 1: Check if bridge exists
  if (window.buzzerOverlayBridge) {
    console.log('✅ Bridge exists');
  } else {
    console.log('❌ Bridge not found');
    return;
  }
  
  // Test 2: Check if React callbacks can be registered
  if (typeof window.buzzerOverlayBridge.registerReactCallbacks === 'function') {
    console.log('✅ Bridge registerReactCallbacks function exists');
    
    // Register test callbacks
    window.buzzerOverlayBridge.registerReactCallbacks({
      addTranscriptionItem: (speaker, text, type) => {
        console.log('🧪 Bridge callback: addTranscriptionItem called', { speaker, text, type });
      },
      processLiveCaption: (text) => {
        console.log('🧪 Bridge callback: processLiveCaption called', text);
      },
      checkForLiveCaptions: () => {
        console.log('🧪 Bridge callback: checkForLiveCaptions called');
      }
    });
    console.log('✅ Test callbacks registered');
  } else {
    console.log('❌ Bridge registerReactCallbacks function not found');
  }
  
  // Test 3: Try to call bridge functions
  if (typeof window.addTranscriptionItem === 'function') {
    console.log('✅ Global addTranscriptionItem function exists');
    // Test call
    window.addTranscriptionItem('Test', 'Bridge test message', 'interviewer');
  } else {
    console.log('❌ Global addTranscriptionItem function not found');
  }
  
  if (typeof window.processLiveCaption === 'function') {
    console.log('✅ Global processLiveCaption function exists');
    // Test call
    window.processLiveCaption('Bridge test caption');
  } else {
    console.log('❌ Global processLiveCaption function not found');
  }
  
  if (typeof window.checkForLiveCaptions === 'function') {
    console.log('✅ Global checkForLiveCaptions function exists');
    // Test call
    window.checkForLiveCaptions();
  } else {
    console.log('❌ Global checkForLiveCaptions function not found');
  }
}

// Run test after a short delay to ensure everything is loaded
setTimeout(testBridge, 1000);

console.log('✅ Test Bridge Ready');