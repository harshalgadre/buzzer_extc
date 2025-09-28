# Buzzer Chrome Extension - Floating AI Helper Overlay

## 🚀 Overview

This Chrome extension provides a floating AI helper overlay that appears during video meetings to assist with interview preparation and real-time guidance.

## ✨ Features

- **Floating Overlay**: Semi-transparent overlay that appears over meeting pages
- **Auto-Detection**: Automatically detects when you join Google Meet, Zoom, or Microsoft Teams
- **Manual Trigger**: Can be manually triggered from the extension popup or test page
- **Professional UI**: Pixel-accurate design matching modern interview assistance tools
- **Interactive Elements**: 
  - Real-time transcription display
  - Topic suggestions
  - AI-powered help responses
  - Screenshot and control features

## 🛠️ Installation & Testing

### 1. Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" 
4. Select the `buzzer_extc` folder
5. The extension should now appear in your extensions list

### 2. Test the Floating Overlay

#### Option A: Using Test Page
1. Open `test-page.html` in Chrome
2. Click the "🤖 Test AI Helper Overlay" button
3. The floating overlay should appear over the page

#### Option B: Using Real Meeting Platform
1. Go to Google Meet, Zoom, or Microsoft Teams
2. Join or start a meeting
3. The overlay should automatically appear
4. Or click the extension icon and select "Open AI Helper"

#### Option C: Manual Trigger
1. On any webpage, click the extension icon
2. Click "Open AI Helper" in the popup
3. The overlay will appear on the current tab

### 3. Test Overlay Features

- **Close**: Click outside the overlay or use the X button in the top control pill
- **Navigation**: Switch between "Topics" and "Transcription" tabs
- **Input**: Type in the bottom input field and press Enter or Space
- **Help Button**: Click "Help Me" to trigger AI responses
- **Callout**: Close the brown notification callout using the X button

## 📁 File Structure

```
buzzer_extc/
├── manifest.json                    # Extension manifest with permissions
├── background.js                    # Service worker for window management
├── content-script.js               # Meeting detection and message handling
├── popup.html                      # Extension popup interface
├── popup.js                        # Popup functionality
├── test-page.html                  # Test page for overlay functionality
├── ai-helper-window/
│   ├── index.html                  # Main overlay structure (standalone)
│   ├── styles.css                  # Complete CSS with overlay styles
│   ├── inject-overlay.js           # Overlay injection and functionality
│   └── ExtensionWindow.js          # React component (standalone)
└── images/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🎨 Design Specifications

- **Window Size**: 1365×488px (responsive)
- **Left Sidebar**: 92px width with navigation controls
- **Main Canvas**: Central area with illustration
- **Right Panel**: 320px width with tabs and content
- **Colors**: Dark theme with orange accents (#FF6A2B)
- **Fonts**: Inter font family
- **Border Radius**: 28px for main container
- **Backdrop**: Semi-transparent with 4px blur

## 🔧 Technical Details

### Overlay Implementation
- Uses Chrome's `scripting` API to inject content into active tabs
- CSS injection for styling with `!important` overrides
- JavaScript injection for functionality and event handling
- Content script communication between page and extension

### Meeting Detection
- Auto-detects Google Meet, Zoom, and Microsoft Teams
- Uses MutationObserver for dynamic content detection
- Supports Single Page Application (SPA) navigation changes

### Message Flow
1. Content script detects meeting → Background script
2. Background script injects overlay into active tab
3. Overlay provides interactive AI assistance interface

## 🐛 Troubleshooting

### Overlay Not Appearing
- Check if extension is properly loaded in `chrome://extensions/`
- Verify the tab has proper permissions (not chrome:// pages)
- Check browser console for error messages
- Try refreshing the page and triggering again

### Styling Issues  
- Ensure `styles.css` is properly loaded
- Check for CSS conflicts with page styles
- Verify `!important` declarations are working

### Meeting Detection Not Working
- Check if you're on a supported platform (Meet/Zoom/Teams)
- Wait a few seconds after joining the meeting
- Try manually triggering from the extension popup

## 📝 Recent Updates

- ✅ Converted from popup window to floating overlay
- ✅ Added semi-transparent backdrop with blur effect  
- ✅ Enhanced styling with overlay-specific CSS
- ✅ Implemented smooth slide-in/out animations
- ✅ Added manual trigger functionality
- ✅ Created comprehensive test page

---

**Made with ❤️ for better interview experiences**