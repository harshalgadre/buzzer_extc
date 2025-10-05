// useLiveCaption.js - React hook for live caption detection
import { useEffect, useCallback } from 'react';

// Live caption detection hook for React components
export const useLiveCaption = (addTranscriptionItem) => {
  const processLiveCaption = useCallback((text) => {
    if (!text || text.trim().length < 3) return;
    
    console.log('📺 Live caption detected in React hook:', text);
    
    // Add to transcription as system audio (interviewer)
    if (addTranscriptionItem && typeof addTranscriptionItem === 'function') {
      addTranscriptionItem('Interviewer', text.trim(), 'interviewer');
    }
  }, [addTranscriptionItem]);

  const checkForLiveCaptions = useCallback(() => {
    // Common selectors for live captions in meeting platforms
    const captionSelectors = [
      '[data-placeholder="Transcript"]', // Google Meet
      '[aria-label="Live captions"]', // Zoom
      '.iOzk7', // Google Meet captions class
      '.VfPpkd-YVzG2b', // Google Meet container
      '[data-self-name]', // Google Meet participant
      '.google-meet-participant', // Google Meet participant
      '.captions-timestamp', // Zoom captions
      '.speaker-label', // Speaker labels
      '.subtitles', // Teams subtitles
      '[data-testid="caption-text"]', // Test ID for captions
      '.live-transcript-content', // More specific live transcript
      '.caption-text-content', // More specific caption text
      '.transcript-text-content' // More specific transcript text
    ];
    
    let foundCaptions = false;
    
    for (const selector of captionSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          // Skip our own overlay elements
          if (element.closest('.extension-window') || element.closest('#buzzer-ai-overlay')) {
            return;
          }
          
          if (element.textContent && element.textContent.trim() !== '') {
            const captionText = element.innerText || element.textContent;
            
            // Skip our own messages and empty messages
            if (captionText.includes('Transcription list initialized') || 
                captionText.includes('System audio transcription initialized') ||
                captionText.includes('Click an interviewer') ||
                captionText.includes('Help Me') ||
                captionText.includes('🎙️') ||
                captionText.includes('✅') ||
                captionText.includes('❌') ||
                captionText.includes('Failed to start system audio capture') ||
                captionText.includes('Please ensure tab audio permissions') ||
                captionText.trim().length < 3) { // Skip very short messages
              return;
            }
            
            foundCaptions = true;
            processLiveCaption(captionText);
          }
        });
      } catch (e) {
        // Silently ignore errors to prevent spam
      }
    }
    
    if (foundCaptions) {
      console.log('🔍 Caption check completed - captions found');
    }
  }, [processLiveCaption]);

  useEffect(() => {
    console.log('🎤 Live caption hook mounted, starting detection...');
    
    // Set up live caption observer
    const captionInterval = setInterval(() => {
      checkForLiveCaptions();
    }, 500); // Check every 500ms for better responsiveness
    
    // Register with bridge if available
    if (window.buzzerOverlayBridge && typeof window.buzzerOverlayBridge.registerReactCallbacks === 'function') {
      console.log('🔗 Registering React callbacks with bridge');
      window.buzzerOverlayBridge.registerReactCallbacks({
        addTranscriptionItem: (speaker, text, type) => {
          if (addTranscriptionItem && typeof addTranscriptionItem === 'function') {
            addTranscriptionItem(speaker, text, type);
          }
        },
        processLiveCaption: (text) => {
          processLiveCaption(text);
        },
        checkForLiveCaptions: () => {
          checkForLiveCaptions();
        }
      });
    }
    
    // Also make these functions globally accessible for direct access
    window.addTranscriptionItemToReact = (speaker, text, type) => {
      if (addTranscriptionItem && typeof addTranscriptionItem === 'function') {
        addTranscriptionItem(speaker, text, type);
      }
    };
    
    window.processLiveCaptionInReact = (text) => {
      processLiveCaption(text);
    };
    
    window.checkForLiveCaptionsInReact = () => {
      checkForLiveCaptions();
    };
    
    // Initial check
    setTimeout(() => {
      checkForLiveCaptions();
    }, 1000);
    
    // Cleanup function
    return () => {
      if (captionInterval) {
        clearInterval(captionInterval);
      }
      
      // Clean up global functions
      window.addTranscriptionItemToReact = null;
      window.processLiveCaptionInReact = null;
      window.checkForLiveCaptionsInReact = null;
    };
  }, [addTranscriptionItem, checkForLiveCaptions, processLiveCaption]);
  
  // Return functions that can be used by the component
  return {
    checkForLiveCaptions,
    processLiveCaption
  };
};

export default useLiveCaption;