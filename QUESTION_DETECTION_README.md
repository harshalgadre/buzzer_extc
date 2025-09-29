# 🤖 Buzzer AI Assistant - Question Detection & Auto-Response

## New Features Added

### 🧠 Intelligent Question Detection
- **Regex-based pattern matching** to automatically detect questions from speech-to-text
- **Multi-pattern support** for various question formats:
  - Direct questions with question words (what, how, why, etc.)
  - Command-style questions (explain, describe, tell me)
  - Technology-specific queries (JavaScript, HTML, Node.js, etc.)
  - Questions with or without question marks

### 🚀 Gemini 2.0 Flash Integration
- **Automatic AI responses** when questions are detected
- **Context-aware answers** focused on technical topics
- **Fallback system** with pre-defined answers when API fails
- **Concise responses** limited to 200 words for better readability

### 🎨 Visual Q&A Display
- **Gray box display** in the main canvas area showing:
  - The detected question
  - AI-generated response
  - Close button to dismiss
- **Seamless integration** with existing UI
- **Auto-switching** between illustration and Q&A content

## How It Works

### 1. Question Detection Patterns
```javascript
// Matches questions starting with question words
/\b(?:what|how|why|when|where|who|which|can you|could you|would you|do you|did you|will you|is|are|am)\b.*\?/i

// Matches command-style requests
/\b(?:explain|describe|tell me|show me|help me|teach me)\b.*/i

// Matches technology-specific queries
/\b(?:javascript|html|css|nodejs|node\.?js|react|angular|vue|python|java|c\+\+|programming|coding|development)\b.*[\?]*$/i
```

### 2. Automatic Processing Flow
1. **Speech-to-Text** input is captured
2. **Regex patterns** check if text contains a question
3. **Gemini API** processes the question if detected
4. **Response displays** in the main gray canvas area
5. **User can dismiss** the Q&A to return to normal view

### 3. Supported Question Types
- ✅ "What is JavaScript?"
- ✅ "How does HTML work?"
- ✅ "Can you explain Node.js?"
- ✅ "Tell me about React"
- ✅ "Describe async programming"
- ✅ "Show me CSS flexbox"
- ✅ "Help me understand APIs"

## Files Modified

### Core Files
- `ExtensionWindow.js` - Main vanilla JS implementation
- `ExtensionWindow.jsx` - React component version  
- `inject-overlay.js` - Overlay injection script
- `styles.css` - Q&A display styling

### Configuration
- **Gemini API Key**: `AIzaSyALmZY3vJq-4PFIUaHl4ZZsYGXdMkI7fCM`
- **Model**: `gemini-2.0-flash-exp`
- **Response Limit**: 200 words

### Test File
- `test-question-detection.html` - Standalone test page for validation

## Usage

### Manual Testing
1. Open `test-question-detection.html` in a browser
2. Click sample questions or type your own
3. Test both detection and AI processing

### In Extension
1. Start speech-to-text (microphone or system audio)
2. Ask a question naturally
3. Watch for automatic AI response in the gray canvas area
4. Click the X button to dismiss the Q&A

## API Integration

The system uses Google's Gemini 2.0 Flash model for generating responses:

```javascript
const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: `You are an AI assistant helping with technical questions. Please provide a clear, concise answer to this question: "${question}". Keep the response under 200 words and focus on practical, actionable information.`
      }]
    }]
  })
});
```

## Fallback Responses

When the API fails, the system provides predefined answers for common topics:
- JavaScript basics
- HTML fundamentals  
- Node.js overview
- CSS styling
- Generic helpful response for other topics

## Future Enhancements

- 🔄 Add more question patterns
- 🌐 Multi-language support
- 📊 Usage analytics
- 🎯 Context-aware responses based on conversation history
- 🔧 User-customizable response templates