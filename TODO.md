# AI Helper Feature Implementation

## Overview
Implement "Start AI Helper" button in session cards, full-screen transparent overlay for real-time interview assistance with audio capture (tab/system as interviewer, mic as user), STT for questions/responses, Gemini 1.5 Flash for AI answers, and backend storage.

## Steps

1. **Update manifest.json**
   - Add permissions: "activeTab", "tabCapture", "microphone", "storage".
   - Ensure "windows" API access if needed.
   - [x] Complete

2. **Update popup.js**
   - In displaySessions(), add "Start AI Helper" button next to "Open Meeting".
   - On click, store sessionId in chrome.storage, create full-screen window with ai-helper.html.
   - [x] Complete

3. **Create ai-helper.html**
   - Full-screen transparent overlay UI based on provided design: Header (Ntro logo), video placeholder, sidebar (Topics, Transcription), main (prompt input, Help Me/End buttons), mic toggle.
   - [x] Complete

4. **Create ai-helper.js**
   - Load sessionId, request audio permissions.
   - Capture tab audio (chrome.tabCapture) and mic (getUserMedia).
   - Implement STT with SpeechRecognition for both streams.
   - Detect questions from interviewer STT, send to backend for Gemini response.
   - Display transcription/AI help in UI.
   - On interactions, POST to backend to store {interviewerText, aiResponse, userText}.
   - Handle "Help Me" custom prompt, close on "End".
   - [x] Complete

5. **Update backend/models/InterviewSession.js**
   - Add aiInteractions: [{ interviewerText: String, aiResponse: String, userText: String, timestamp: Date }] to schema.
   - [x] Complete

6. **Update backend/routes/sessions.js**
   - Add POST /api/sessions/:sessionId/ai-interaction: Auth, find session, push to aiInteractions, save.
   - Add POST /api/sessions/:sessionId/generate-ai-response: Auth, fetch session, use Gemini.generateContent with prompt (question + context), return response.
   - Import { GoogleGenerativeAI } from '@google/generativeai'.
   - [x] Complete

7. **Update backend/package.json and install dependencies**
   - Add "@google/generativeai": "^0.2.0" and "multer": "^1.4.5-lts.1" to dependencies.
   - Run: cd backend && npm install
   - [x] Complete (run npm install in backend directory)

8. **Backend Configuration**
   - Add GEMINI_API_KEY to backend .env (user to provide/set).
   - In server.js or sessions.js, initialize genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).
   - Restart backend server.
   - [ ] Complete

9. **Testing**
   - Login, create session with meeting URL.
   - Click "Start AI Helper" – verify overlay opens, permissions requested.
   - Simulate audio: Test STT, AI response generation, storage in DB.
   - Verify transparent overlay allows seeing meeting behind.
   - [ ] Complete

## Notes
- STT uses browser SpeechRecognition API (English default).
- Gemini prompt: "As an interview coach for {position} at {company}, answer this question: {question}. Keep it concise and helpful."
- Handle errors: No API key, audio denial, etc.
- User provides GEMINI_API_KEY after step 7.
