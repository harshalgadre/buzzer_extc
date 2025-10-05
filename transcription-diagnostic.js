// Transcription Diagnostic Tool
// This script can be injected into any page to diagnose transcription issues

(function() {
  console.log('=== Buzzer Transcription Diagnostic Tool ===');
  
  // Diagnostic functions
  const diagnostic = {
    // Check if overlay is properly initialized
    checkOverlayInitialization: function() {
      console.group('🔍 Overlay Initialization Check');
      
      if (!window.buzzerOverlayInstance) {
        console.error('❌ buzzerOverlayInstance not found');
        console.groupEnd();
        return false;
      }
      
      console.log('✅ buzzerOverlayInstance found');
      console.log('📦 Instance properties:', {
        activeTab: window.buzzerOverlayInstance.activeTab,
        transcriptionItems: window.buzzerOverlayInstance.transcriptionItems?.length || 0,
        isScreenSharing: window.buzzerOverlayInstance.isScreenSharing,
        isUserMicOn: window.buzzerOverlayInstance.isUserMicOn
      });
      
      // Check required methods
      const requiredMethods = [
        'addTranscriptionItem',
        'processLiveCaption',
        'checkForLiveCaptions',
        'setActiveTab',
        'updateContent'
      ];
      
      console.log('🔧 Required methods check:');
      let allMethodsFound = true;
      requiredMethods.forEach(method => {
        if (typeof window.buzzerOverlayInstance[method] === 'function') {
          console.log(`   ✅ ${method}`);
        } else {
          console.log(`   ❌ ${method} - MISSING`);
          allMethodsFound = false;
        }
      });
      
      console.groupEnd();
      return allMethodsFound;
    },
    
    // Check DOM elements
    checkDOMElements: function() {
      console.group('🔍 DOM Elements Check');
      
      const overlay = document.getElementById('buzzer-ai-overlay');
      if (!overlay) {
        console.error('❌ Overlay element not found');
        console.groupEnd();
        return false;
      }
      
      console.log('✅ Overlay element found');
      
      const transcriptionList = overlay.querySelector('.transcription-list');
      console.log('📝 Transcription list element:', transcriptionList ? 'FOUND' : 'NOT FOUND');
      
      const panelContent = overlay.querySelector('.panel-content');
      console.log('📦 Panel content element:', panelContent ? 'FOUND' : 'NOT FOUND');
      
      const tabButtons = overlay.querySelectorAll('.tab-btn');
      console.log('🔘 Tab buttons found:', tabButtons.length);
      
      tabButtons.forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.textContent.trim()} - ${btn.classList.contains('active') ? 'ACTIVE' : 'INACTIVE'}`);
      });
      
      console.groupEnd();
      return !!transcriptionList;
    },
    
    // Test transcription functionality
    testTranscription: function() {
      console.group('🔍 Transcription Functionality Test');
      
      if (!window.buzzerOverlayInstance) {
        console.error('❌ Cannot test - overlay instance not found');
        console.groupEnd();
        return false;
      }
      
      // Test adding transcription item
      console.log('📝 Testing direct transcription item addition...');
      try {
        const testText = `Diagnostic test at ${new Date().toLocaleTimeString()}`;
        window.buzzerOverlayInstance.addTranscriptionItem('Diagnostic', testText, 'interviewer');
        console.log('✅ Direct transcription item added successfully');
      } catch (error) {
        console.error('❌ Failed to add direct transcription item:', error);
        console.groupEnd();
        return false;
      }
      
      // Check if item was added to DOM
      setTimeout(() => {
        const list = document.querySelector('.transcription-list');
        if (list) {
          console.log('📊 Transcription list children count:', list.children.length);
        }
        
        // Check internal array
        console.log('💾 Internal transcription items count:', window.buzzerOverlayInstance.transcriptionItems?.length || 0);
        
        console.groupEnd();
      }, 100);
      
      return true;
    },
    
    // Test live caption processing
    testLiveCaption: function() {
      console.group('🔍 Live Caption Processing Test');
      
      if (!window.buzzerOverlayInstance) {
        console.error('❌ Cannot test - overlay instance not found');
        console.groupEnd();
        return false;
      }
      
      // Test processing live caption
      console.log('📺 Testing live caption processing...');
      try {
        const testCaption = `Live caption test at ${new Date().toLocaleTimeString()}`;
        window.buzzerOverlayInstance.processLiveCaption(testCaption);
        console.log('✅ Live caption processed successfully');
      } catch (error) {
        console.error('❌ Failed to process live caption:', error);
        console.groupEnd();
        return false;
      }
      
      console.groupEnd();
      return true;
    },
    
    // Test caption detection
    testCaptionDetection: function() {
      console.group('🔍 Caption Detection Test');
      
      if (!window.buzzerOverlayInstance) {
        console.error('❌ Cannot test - overlay instance not found');
        console.groupEnd();
        return false;
      }
      
      if (typeof window.buzzerOverlayInstance.checkForLiveCaptions !== 'function') {
        console.error('❌ checkForLiveCaptions method not available');
        console.groupEnd();
        return false;
      }
      
      console.log('🔍 Running caption detection...');
      try {
        window.buzzerOverlayInstance.checkForLiveCaptions();
        console.log('✅ Caption detection completed');
      } catch (error) {
        console.error('❌ Caption detection failed:', error);
        console.groupEnd();
        return false;
      }
      
      console.groupEnd();
      return true;
    },
    
    // Check tab status
    checkTabStatus: function() {
      console.group('🔍 Tab Status Check');
      
      if (!window.buzzerOverlayInstance) {
        console.error('❌ Cannot check - overlay instance not found');
        console.groupEnd();
        return false;
      }
      
      console.log('📋 Active tab:', window.buzzerOverlayInstance.activeTab);
      
      // Ensure transcription tab is active
      if (window.buzzerOverlayInstance.activeTab !== 'transcription') {
        console.log('🔄 Switching to transcription tab...');
        try {
          window.buzzerOverlayInstance.setActiveTab('transcription');
          console.log('✅ Switched to transcription tab');
        } catch (error) {
          console.error('❌ Failed to switch tab:', error);
        }
      } else {
        console.log('✅ Transcription tab is already active');
      }
      
      console.groupEnd();
      return true;
    },
    
    // Run comprehensive diagnosis
    runFullDiagnosis: function() {
      console.log('=== FULL TRANSCRIPTION DIAGNOSIS ===');
      
      const results = {
        overlay: this.checkOverlayInitialization(),
        dom: this.checkDOMElements(),
        tab: this.checkTabStatus(),
        transcription: this.testTranscription(),
        liveCaption: this.testLiveCaption(),
        detection: this.testCaptionDetection()
      };
      
      console.log('=== DIAGNOSIS SUMMARY ===');
      console.table(results);
      
      const passed = Object.values(results).filter(Boolean).length;
      const total = Object.keys(results).length;
      
      console.log(`📊 Results: ${passed}/${total} tests passed`);
      
      if (passed === total) {
        console.log('✅ All tests passed! Transcription should be working correctly.');
      } else {
        console.log('❌ Some tests failed. Check the detailed output above for issues.');
      }
      
      return results;
    }
  };
  
  // Make diagnostic tool globally available
  window.buzzerTranscriptionDiagnostic = diagnostic;
  
  // Run initial diagnosis
  console.log('🚀 Running initial diagnosis...');
  setTimeout(() => {
    diagnostic.runFullDiagnosis();
  }, 2000); // Wait a bit for everything to initialize
  
  console.log('🔧 Diagnostic tool ready. Use window.buzzerTranscriptionDiagnostic.runFullDiagnosis() to run tests anytime.');
  
  // Return the diagnostic object for immediate use
  return diagnostic;
})();