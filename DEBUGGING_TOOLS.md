# Debugging Tools

This directory contains several debugging tools to help troubleshoot live caption detection issues.

## Tools Available

### 1. Live Caption Detector (`ai-helper-window/live-caption-detector.js`)
The main unified live caption detection module that works for both React and non-React components.

### 2. Debug Captions (`debug-captions.js`)
Tool to debug live caption detection by checking for elements and testing bridge functions.

### 3. Verify Bridge (`verify-bridge.js`)
Comprehensive tool to verify that the bridge between content script and overlay is working correctly.

### 4. Bridge Test (`ai-helper-window/bridge-test.js`)
Simple test to verify bridge functionality.

### 5. Test Live Captions (`test-live-captions.html`)
HTML page that simulates live captions for testing purposes.

## How to Use Debugging Tools

### Method 1: Console Testing
1. Open a meeting platform (Google Meet, Zoom, or Teams)
2. Join a meeting with live captions enabled
3. Open Chrome Developer Tools (F12)
4. Go to the Console tab
5. Run one of the debugging functions:

```javascript
// Test live caption detection
debugLiveCaptions();

// Verify bridge functionality
verifyBridge();

// Test bridge directly
testTranscription();
testLiveCaption();
```

### Method 2: Test Page
1. Open `test-live-captions.html` in your browser
2. Use the buttons to add simulated captions
3. Check if they appear in the transcription tab

### Method 3: Manual Element Checking
1. Open Chrome Developer Tools (F12)
2. Go to the Console tab
3. Run this code to check for caption elements:

```javascript
// Check for common caption selectors
const selectors = [
  '[data-placeholder="Transcript"]',
  '[aria-label="Live captions"]', 
  '.iOzk7',
  '.VfPpkd-YVzG2b',
  '.captions-timestamp',
  '.speaker-label',
  '.subtitles',
  '[data-testid="caption-text"]',
  '.live-transcript-content'
];

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    console.log(`Found ${elements.length} elements with selector: ${selector}`);
    elements.forEach((el, i) => {
      console.log(`  ${i+1}:`, el.textContent);
    });
  }
});
```

## Common Debugging Scenarios

### Scenario 1: Captions Detected in Console but Not in Transcription Tab
1. Check that the AI Helper overlay is open
2. Verify the Transcription tab is selected
3. Run `verifyBridge()` to check bridge functionality
4. Check for JavaScript errors in the console

### Scenario 2: No Captions Detected at All
1. Verify live captions are enabled in the meeting
2. Check that you're on a supported platform
3. Run `debugLiveCaptions()` to check element detection
4. Look for error messages in the console

### Scenario 3: Duplicate or Spam Captions
1. Check the debounce timing in `live-caption-detector.js`
2. Verify duplicate detection logic
3. Adjust caption checking interval if needed

## Console Log Monitoring

Look for these key log messages:

```
📺 Live caption detected: [caption text]
📝 Adding caption to transcription via bridge...
✅ Live caption added to transcription successfully
✅ Live Caption Detector initialized
🌉 Bridge: addTranscriptionItem called
```

## Performance Monitoring

The system should:
- Check for captions every 500ms
- Debounce caption processing by 100ms
- Not cause performance issues or memory leaks
- Clean up properly when the overlay is closed

## Troubleshooting Tips

1. **Refresh the page** if tools aren't loading
2. **Check extension permissions** in Chrome extensions page
3. **Clear browser cache** if changes aren't taking effect
4. **Reload the extension** after making code changes
5. **Check for JavaScript errors** in the console