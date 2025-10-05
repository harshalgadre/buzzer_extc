# Buzzer Transcription Troubleshooting Guide

This guide helps diagnose and fix issues with live caption transcription not appearing in the transcription tab.

## Common Issues and Solutions

### 1. Captions Detected But Not Appearing in Transcription Tab

**Symptoms:**
- Console shows "📺 Live caption detected" messages
- Transcription tab remains empty
- No errors in console

**Debugging Steps:**

1. **Check Overlay Instance Initialization:**
   ```javascript
   // In browser console
   window.buzzerOverlayInstance  // Should not be undefined
   ```

2. **Verify Transcription List Element:**
   ```javascript
   // Check if the transcription list element exists
   document.querySelector('.transcription-list')  // Should return an element
   ```

3. **Test Direct Transcription Addition:**
   ```javascript
   // Try adding a transcription item directly
   window.buzzerOverlayInstance.addTranscriptionItem('Test', 'Direct test message', 'interviewer')
   ```

4. **Check Tab Status:**
   ```javascript
   // Verify which tab is active
   window.buzzerOverlayInstance.activeTab  // Should be 'transcription'
   ```

### 2. Live Caption Detection Not Working

**Symptoms:**
- No "📺 Live caption detected" messages in console
- Caption elements exist on page but aren't detected

**Debugging Steps:**

1. **Run Manual Caption Detection:**
   ```javascript
   // Force a caption detection check
   window.buzzerOverlayInstance.checkForLiveCaptions()
   ```

2. **Check for Caption Elements:**
   ```javascript
   // Test common selectors manually
   document.querySelectorAll('.iOzk7')
   document.querySelectorAll('[data-placeholder="Transcript"]')
   document.querySelectorAll('.caption-text')
   ```

3. **Verify Content Script Injection:**
   ```javascript
   // Check if content script functions exist
   typeof aggressiveCaptionDetection !== 'undefined'
   ```

### 3. Transcription Items Not Persisting

**Symptoms:**
- Items appear briefly then disappear
- Items added but not stored in array
- UI updates but data is lost

**Debugging Steps:**

1. **Check Transcription Items Array:**
   ```javascript
   // Verify items are stored
   window.buzzerOverlayInstance.transcriptionItems
   ```

2. **Test Tab Switching:**
   ```javascript
   // Switch to topics and back to transcription
   window.buzzerOverlayInstance.setActiveTab('topics')
   window.buzzerOverlayInstance.setActiveTab('transcription')
   ```

## Advanced Debugging

### Using the Enhanced Test Page

1. Open `enhanced-test.html` in your browser
2. Ensure the Buzzer AI Helper overlay is active
3. Use the various test buttons to isolate the issue:
   - "Update Caption" - Simulates live captions
   - "Test Direct Transcription" - Bypasses detection
   - "Test Live Caption Processing" - Tests the full pipeline
   - "Run Comprehensive Debug" - Runs detailed diagnostics

### Console Debugging Commands

```javascript
// Check all components
console.log('Overlay:', window.buzzerOverlayInstance);
console.log('Active Tab:', window.buzzerOverlayInstance?.activeTab);
console.log('Transcription Items:', window.buzzerOverlayInstance?.transcriptionItems?.length);
console.log('Transcription List Element:', document.querySelector('.transcription-list'));

// Force a complete diagnostic
if (window.buzzerOverlayInstance) {
  // Check methods
  console.log('Methods available:', {
    addTranscriptionItem: typeof window.buzzerOverlayInstance.addTranscriptionItem,
    processLiveCaption: typeof window.buzzerOverlayInstance.processLiveCaption,
    checkForLiveCaptions: typeof window.buzzerOverlayInstance.checkForLiveCaptions
  });
  
  // Test adding an item
  window.buzzerOverlayInstance.addTranscriptionItem('Debug', 'Test message', 'interviewer');
  
  // Check if it was added to DOM
  setTimeout(() => {
    const list = document.querySelector('.transcription-list');
    console.log('List children count:', list?.children?.length);
  }, 100);
}
```

## Code Verification Checklist

### inject-overlay.js
- [ ] [addTranscriptionItem](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L234-L267) method properly accesses `.transcription-list`
- [ ] [processLiveCaption](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L1568-L1591) correctly calls [addTranscriptionItem](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L234-L267)
- [ ] [checkForLiveCaptions](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L1526-L1566) uses correct selectors
- [ ] [updateContent](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L486-L531) properly initializes transcription list
- [ ] [setActiveTab](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L462-L484) correctly switches to transcription tab

### content-script.js
- [ ] `aggressiveCaptionDetection` properly calls overlay methods
- [ ] Interval correctly triggers when in meeting
- [ ] Meeting detection works for your platform

### background.js
- [ ] Tab capture properly initializes
- [ ] Messages are correctly passed between components

## Known Issues and Workarounds

### Issue: Transcription List Element Not Found
**Cause:** Race condition where [addTranscriptionItem](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L234-L267) is called before DOM is fully initialized
**Solution:** Add defensive checks and retry logic

### Issue: Captions Processed But Not Displayed
**Cause:** Transcription tab not active when items are added
**Solution:** Ensure [setActiveTab](file:///g:/buzzer_extc/ai-helper-window/inject-overlay.js#L462-L484)('transcription') is called during initialization

### Issue: Duplicate Captions
**Cause:** Overly aggressive caption detection
**Solution:** Implement smarter deduplication with content and timing checks

## Testing Procedure

1. **Load the extension** and join a meeting
2. **Open browser console** and verify overlay initialization
3. **Check for caption detection** messages
4. **Verify transcription list** element exists
5. **Test direct transcription** addition
6. **Monitor for errors** in console
7. **Switch tabs** and verify persistence

## Contact Support

If issues persist after following this guide:
1. Capture console logs during reproduction
2. Note the meeting platform being used
3. Include extension version information
4. Provide steps to reproduce the issue