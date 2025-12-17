let youtubeTabId = null;
let pausedByExtension = false;
let audioTimer = null;
const AUDIO_DELAY = 1500; // más corto y reactivo

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com")) {
    youtubeTabId = tabId;
  }

  if (changeInfo.audible !== undefined) {
    onAudioStateChange();
  }
});

chrome.tabs.onRemoved.addListener(onAudioStateChange);

function onAudioStateChange() {
  chrome.tabs.query({}, (tabs) => {
    const hasExternalAudio = tabs.some(tab =>
      tab.audible &&
      tab.url &&
      !tab.url.includes("youtube.com")
    );

    if (hasExternalAudio) {
      if (!audioTimer) {
        audioTimer = setTimeout(() => {
          confirmAndPause();
        }, AUDIO_DELAY);
      }
    } else {
      clearTimeout(audioTimer);
      audioTimer = null;
      resumeYouTube();
    }
  });
}

function confirmAndPause() {
  chrome.tabs.query({}, (tabs) => {
    const stillExternalAudio = tabs.some(tab =>
      tab.audible &&
      tab.url &&
      !tab.url.includes("youtube.com")
    );

    if (stillExternalAudio) {
      pauseYouTube();
    }

    audioTimer = null;
  });
}

function pauseYouTube() {
  if (!youtubeTabId) return;

  chrome.scripting.executeScript({
    target: { tabId: youtubeTabId },
    func: () => {
      const video = document.querySelector("video");
      if (video && !video.paused && !video.ended) {
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
