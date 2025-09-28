# Buzzer AI Helper Window - Production Assets

## Overview
Pixel-accurate Chrome extension AI helper window matching the provided screenshot. Dimensions: 1365×488px with responsive versions at 1024×420px and 800×360px.

## Design Specifications

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallback Stack**: "Inter", "Roboto", system-ui, -apple-system, "Segoe UI", sans-serif
- **Google Fonts Import**: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap`

#### Font Sizes:
- Tabs/Headings: 16-18px semibold
- Body/Labels: 12-14px regular  
- Input Placeholder: 14px
- Navigation Labels: 11px medium
- Help Button: 14px primary, 11px hint

### Color Palette (CSS Variables)

```css
:root {
  --bg-black: #060606;           /* Window background */
  --sidebar-dark: #2e2b2b;       /* Left sidebar */
  --main-gray: #4a4a4a;          /* Main canvas */
  --panel-black: #0b0b0b;        /* Right panel */
  --accent-orange: #FF6A2B;      /* Primary action color */
  --callout-brown: #5A2E17;      /* Brown notification */
  --input-pale: #E7E7E7;         /* Input background */
  --text-white: #ffffff;         /* Primary text */
  --text-muted: #bdbdbd;         /* Secondary text */
  --crown-gold: #FFD700;         /* Premium badges */
}
```

### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 28px;    /* Main window corners */
```

## Layout Structure

### Main Window (1365×488px)
- **Outer Border**: 28px radius with 4px inner shadow border
- **Background**: #060606 with subtle box-shadow: `0 6px 24px rgba(0, 0, 0, 0.6)`

### Left Sidebar (92px width)
- **Background**: #2e2b2b
- **Border**: 2px inner bevel effect
- **Corner Radius**: 28px top-left and bottom-left only
- **Logo Badge**: 56px circle with orange "N"
- **Control Pill**: White rounded container with camera/close buttons

### Main Canvas (Flexible width)
- **Background**: #4a4a4a with gradient overlay
- **Border Radius**: 28px
- **Illustration**: Centered bottom, 26% opacity
- **Shadow**: Inset border for depth

### Right Panel (320px width)
- **Background**: #0b0b0b (pure black)
- **Tabs**: "Topics" (inactive) | "Transcription" (active, orange)
- **Brown Callout**: #5A2E17 background, white text, close button
- **Drag Handle**: 12px dotted vertical strip

### Bottom Bar (80px height)
- **Input Field**: #E7E7E7 background, 56px height, inset shadow
- **Help Button**: #FF6A2B, rounded, with shadow
- **Camera Icon**: Left of input, 40px square
- **Checkbox**: "Hide my conversation" right side

## File Structure

```
ai-helper-window/
├── index.html              # Main HTML structure
├── styles.css              # Production CSS with variables
├── ExtensionWindow.js      # Vanilla JS implementation
├── ExtensionWindow.jsx     # React component
├── tailwind.config.js      # Tailwind configuration
├── README.md              # This file
└── assets/
    ├── icons/             # Optimized SVG icons (<2KB each)
    │   ├── theme.svg
    │   ├── font.svg
    │   ├── bullet.svg
    │   ├── detail.svg
    │   ├── translate.svg
    │   ├── auto.svg
    │   ├── crown.svg
    │   ├── camera.svg
    │   └── close.svg
    └── illustration.svg    # Main character illustration
```

## Integration Instructions

### Chrome Extension Setup
1. Add to `manifest.json`:
```json
{
  "content_scripts": [{
    "matches": ["https://meet.google.com/*", "https://zoom.us/*", "https://teams.microsoft.com/*"],
    "js": ["content-script.js"],
    "run_at": "document_end"
  }],
  "permissions": ["scripting"]
}
```

2. Update `background.js` to handle:
   - `meetingJoined` message from content script
   - `openAIHelper` message from popup
   - Window creation with exact dimensions

### Auto-Launch Behavior
- **Meeting Detection**: Content script monitors DOM for meeting indicators
- **Auto-Open**: Triggers 2 seconds after meeting join detected
- **Manual Open**: Via extension popup "Start AI Helper" button
- **Window Management**: Prevents duplicates, focuses existing window

### Popup Integration
Replace the `startAIHelper()` function to send message to background script instead of direct window creation.

## Accessibility Features
- **ARIA Labels**: All interactive elements have proper labels
- **Focus States**: 2px orange outline on focus-visible
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **Screen Reader**: Semantic HTML with roles and states
- **Contrast Ratios**: All text meets WCAG 4.5:1 minimum

## Technical Implementation

### CSS Features Used
- CSS Grid & Flexbox for layout
- CSS Variables for theming
- Custom scrollbars with webkit-scrollbar
- Backdrop blur effects
- Inset shadows and subtle borders
- Smooth transitions (0.2s duration)

### JavaScript Features
- Event delegation for dynamic content
- Chrome extension messaging API
- Storage API for session persistence
- Window management for popups
- DOM mutation observers for meeting detection

### React Component Props
```jsx
interface ExtensionWindowProps {
  activeTab?: 'topics' | 'transcription';
  helpCount?: number;
  calloutVisible?: boolean;
  onTabChange?: (tab: string) => void;
  onHelpTrigger?: (query: string) => void;
  onCalloutClose?: () => void;
}
```

## Export Sizes
- **Main**: 1365×488px (production)
- **Medium**: 1024×420px (laptop compatibility)
- **Small**: 800×360px (compact mode)
- **Icons**: 16×16, 18×18, 24×24px variants
- **Illustration**: 400×300px SVG + PNG exports

## Performance Notes
- **SVG Icons**: Optimized with SVGO, under 2KB each
- **CSS**: Minimal reflows, hardware-accelerated transforms
- **JS**: Event delegation, debounced resize handlers
- **Fonts**: Preloaded via link preconnect
- **Images**: Vector-first approach, PNG fallbacks

## Browser Compatibility
- **Chrome**: 88+ (Manifest V3 support)
- **Edge**: 88+ (Chromium-based)
- **Firefox**: Manifest V2 version available separately
- **Safari**: WebKit compatibility with minor adjustments

---

**Status**: ✅ Production Ready  
**Last Updated**: September 28, 2025  
**Version**: 1.0.0
