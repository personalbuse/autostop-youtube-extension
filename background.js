let youtubeTabId = null;
let pausedByExtension = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    youtubeTabId = tabId;
  }

  if (changeInfo.audible !== undefined) {
    evaluateAudioState();
  }
});

chrome.tabs.onRemoved.addListener(() => {
  evaluateAudioState();
});

function evaluateAudioState() {
  chrome.tabs.query({}, (tabs) => {
    let externalAudioPlaying = false;

    for (const tab of tabs) {
      if (
        tab.audible &&
        tab.url &&
        !tab.url.includes("youtube.com")
      ) {
        externalAudioPlaying = true;
        break;
      }
    }

    if (externalAudioPlaying) {
      pauseYouTube();
    } else {
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
