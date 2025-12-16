let youtubeTabId = null;
let pausedByExtension = false;
let audioTimeout = null;
const AUDIO_DELAY = 2000; // 2 segundos

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com")) {
    youtubeTabId = tabId;
  }

  if (changeInfo.audible !== undefined) {
    handleAudioChange();
  }
});

chrome.tabs.onRemoved.addListener(() => {
  handleAudioChange();
});

function handleAudioChange() {
  chrome.tabs.query({}, (tabs) => {
    const externalAudioTabs = tabs.filter(tab =>
      tab.audible &&
      tab.url &&
      !tab.url.includes("youtube.com")
    );

    if (externalAudioTabs.length > 0) {
      // Audio externo detectado → aplicar delay
      if (!audioTimeout) {
        audioTimeout = setTimeout(() => {
          pauseYouTube();
        }, AUDIO_DELAY);
      }
    } else {
      // No hay audio externo
      clearTimeout(audioTimeout);
      audioTimeout = null;
      resumeYouTube();
    }
  });
}

function pauseYouTube() {
  if (!youtubeTabId) return;

  chrome.scripting.executeScript({
    target: { tabId: youtubeTabId },
    func: () => {
      const video = document.querySelector("video");
      if (video && !video.paused) {
        video.pause();
        window.__pausedByExtension = true;
      }
    }
  });

  pausedByExtension = true;
}

function resumeYouTube() {
  if (!youtubeTabId || !pausedByExtension) return;

  chrome.scripting.executeScript({
    target: { tabId: youtubeTabId },
    func: () => {
      const video = document.querySelector("video");
      if (video && video.paused && window.__pausedByExtension) {
        video.play();
        window.__pausedByExtension = false;
      }
    }
  });

  pausedByExtension = false;
}
