# Live Caption Debugging Guide

## Issue Summary
The live captions are being detected and logged in the console but are not appearing in the transcription tab.

## Root Cause
The background.js file had the live caption capture code commented out, preventing the proper initialization of the caption capture system.

## Fix Applied

### 1. Un-commented the captureSystemAudio handler in background.js
```javascript
// Simplified system audio capture - focus on live captions instead of audio processing
if (message.action === 'captureSystemAudio') {
  console.log('🎤 System audio capture requested - focusing on live captions instead');
  
  // Instead of capturing audio, we'll just notify that we're ready for live captions
  sendResponse({ success: true, message: 'Ready for live captions' });
  return true;
}
```

### 2. Enhanced caption detection in inject-overlay.js
- Added more specific selectors for different meeting platforms
- Reduced debounce time to 300ms for better responsiveness
- Removed word count filter to capture all captions
- Improved error handling

### 3. Enhanced content script detection
- Added more aggressive caption detection with 500ms interval when in meeting
- Added MutationObserver for Google Meet captions
- Added specific selectors for all platforms

## Testing Steps

1. Load the extension in Chrome
2. Open a meeting platform (Google Meet, Zoom, or Teams)
3. Join a meeting with live captions enabled
4. Open the AI Helper overlay
5. Speak or enable live captions
6. Check the transcription tab for captured text

## Expected Behavior
- Live captions should appear in the transcription tab as "Interviewer" messages
- Live captions should also appear in the floating display at the bottom of the screen
- No spam or duplicate messages should appear

## Debugging Tips

### Check Console Logs
1. Open Chrome Developer Tools (F12)
2. Go to the Console tab
3. Look for logs starting with:
   - "📺 Live caption detected:"
   - "🔍 Setting up live caption observer"
   - "🎤 System audio capture requested"

### Verify Element Detection
1. Inspect the meeting page (right-click > Inspect)
2. Look for caption elements with classes like:
   - `.iOzk7` (Google Meet)
   - `.caption-container` (Zoom)
   - `.subtitles` (Teams)
   - `[data-placeholder="Transcript"]` (Generic)

### Test with Sample Page
Open `test-live-captions.html` to test caption detection in a controlled environment.

## Common Issues and Solutions

### Captions Not Detected
1. Check that the meeting platform is supported
2. Verify that live captions are enabled in the meeting
3. Check console for error messages
4. Try refreshing the page

### Captions in Console but Not in Transcription Tab
1. Verify that the AI Helper overlay is open
2. Check that the Transcription tab is selected
3. Look for JavaScript errors in the console
4. Ensure the extension has proper permissions

### Spam or Duplicate Captions
1. Check debounce timing in inject-overlay.js
2. Verify duplicate detection logic
3. Adjust caption checking interval if needed

## Performance Considerations
- Caption checking is throttled to prevent performance issues
- Debouncing prevents spam from rapid caption updates
- MutationObserver is used for efficient change detection
- Cleanup functions prevent memory leaks

## Next Steps
If issues persist:
1. Check browser console for specific error messages
2. Verify that all file changes have been saved
3. Reload the extension in Chrome extensions page
4. Test with the provided test page