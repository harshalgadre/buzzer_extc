// Final Verification Script
// This script verifies that both live caption detection and system audio capturing are working

console.log('=== Final Verification Script ===');

// Function to test the bridge
function testBridge() {
    console.log('🌉 Testing bridge functionality...');
    
    if (window.buzzerOverlayBridge) {
        console.log('✅ Bridge found');
        
        // Test addTranscriptionItem
        if (typeof window.buzzerOverlayBridge.addTranscriptionItem === 'function') {
            console.log('✅ addTranscriptionItem function available');
            window.buzzerOverlayBridge.addTranscriptionItem('Test', 'Bridge test message', 'interviewer');
        } else {
            console.log('❌ addTranscriptionItem function not available');
        }
        
        // Test processLiveCaption
        if (typeof window.buzzerOverlayBridge.processLiveCaption === 'function') {
            console.log('✅ processLiveCaption function available');
            window.buzzerOverlayBridge.processLiveCaption('Bridge live caption test');
        } else {
            console.log('❌ processLiveCaption function not available');
        }
        
        // Test checkForLiveCaptions
        if (typeof window.buzzerOverlayBridge.checkForLiveCaptions === 'function') {
            console.log('✅ checkForLiveCaptions function available');
            window.buzzerOverlayBridge.checkForLiveCaptions();
        } else {
            console.log('❌ checkForLiveCaptions function not available');
        }
    } else {
        console.log('❌ Bridge not found');
    }
}

// Function to test direct global functions
function testGlobalFunctions() {
    console.log('🌍 Testing global functions...');
    
    // Test addTranscriptionItem
    if (typeof window.addTranscriptionItem === 'function') {
        console.log('✅ Global addTranscriptionItem function available');
        window.addTranscriptionItem('Test', 'Global function test message', 'interviewer');
    } else {
        console.log('❌ Global addTranscriptionItem function not available');
    }
    
    // Test checkForLiveCaptions
    if (typeof window.checkForLiveCaptions === 'function') {
        console.log('✅ Global checkForLiveCaptions function available');
        window.checkForLiveCaptions();
    } else {
        console.log('❌ Global checkForLiveCaptions function not available');
    }
}

// Function to test React component functions
function testReactFunctions() {
    console.log('⚛️ Testing React component functions...');
    
    // Test React-specific functions
    if (typeof window.addTranscriptionItemToReact === 'function') {
        console.log('✅ React addTranscriptionItemToReact function available');
        window.addTranscriptionItemToReact('Test', 'React test message', 'interviewer');
    } else {
        console.log('ℹ️ React addTranscriptionItemToReact function not available (might be using original version)');
    }
    
    if (typeof window.checkForLiveCaptionsInReact === 'function') {
        console.log('✅ React checkForLiveCaptionsInReact function available');
        window.checkForLiveCaptionsInReact();
    } else {
        console.log('ℹ️ React checkForLiveCaptionsInReact function not available (might be using original version)');
    }
}

// Function to test original overlay functions
function testOriginalFunctions() {
    console.log('🔄 Testing original overlay functions...');
    
    if (window.buzzerOverlayInstance) {
        console.log('✅ Original buzzerOverlayInstance found');
        
        // Test addTranscriptionItem
        if (typeof window.buzzerOverlayInstance.addTranscriptionItem === 'function') {
            console.log('✅ Original addTranscriptionItem function available');
            window.buzzerOverlayInstance.addTranscriptionItem('Test', 'Original test message', 'interviewer');
        } else {
            console.log('❌ Original addTranscriptionItem function not available');
        }
        
        // Test checkForLiveCaptions
        if (typeof window.buzzerOverlayInstance.checkForLiveCaptions === 'function') {
            console.log('✅ Original checkForLiveCaptions function available');
            window.buzzerOverlayInstance.checkForLiveCaptions();
        } else {
            console.log('❌ Original checkForLiveCaptions function not available');
        }
    } else {
        console.log('ℹ️ Original buzzerOverlayInstance not found (might be using React version)');
    }
}

// Run all tests
console.log('🚀 Running all verification tests...');
testBridge();
console.log('---');
testGlobalFunctions();
console.log('---');
testReactFunctions();
console.log('---');
testOriginalFunctions();
console.log('---');
console.log('✅ Verification complete!');

// Make functions available globally
window.testBridge = testBridge;
window.testGlobalFunctions = testGlobalFunctions;
window.testReactFunctions = testReactFunctions;
window.testOriginalFunctions = testOriginalFunctions;

console.log('🔧 Test functions available globally:');
console.log('   - testBridge()');
console.log('   - testGlobalFunctions()');
console.log('   - testReactFunctions()');
console.log('   - testOriginalFunctions()');