let videoObserver;
let startTimes = new Map();
let currentSpeed = 1.0;
let autoApplyEnabled = false;

function calculateTimeSaved(video) {
  if (!startTimes.has(video)) return 0;
  const startTime = startTimes.get(video);
  const actualDuration = (Date.now() - startTime) / 1000;
  const normalDuration = actualDuration * video.playbackRate;
  return (normalDuration - actualDuration) / 60; // Convert to minutes
}

function initializeVideo(video) {
  if (!startTimes.has(video)) {
    startTimes.set(video, Date.now());
    chrome.storage.local.get('videoCount', function(data) {
      const count = (data.videoCount || 0) + 1;
      chrome.storage.local.set({ videoCount: count });
    });
  }

  if (autoApplyEnabled) {
    video.playbackRate = currentSpeed;
  }

  video.addEventListener('ratechange', function() {
    const timeSaved = calculateTimeSaved(video);
    chrome.storage.local.get('timeSaved', function(data) {
      const totalTimeSaved = (data.timeSaved || 0) + timeSaved;
      chrome.storage.local.set({ timeSaved: totalTimeSaved });
    });
  });
}

function observeVideoElements() {
  videoObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'VIDEO') {
          initializeVideo(node);
        }
      });
    });
  });

  videoObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize existing videos
document.querySelectorAll('video').forEach(initializeVideo);
observeVideoElements();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateSpeed") {
    currentSpeed = request.speed;
    autoApplyEnabled = request.autoApply;
    
    const videos = document.getElementsByTagName('video');
    for (let video of videos) {
      video.playbackRate = request.speed;
    }
  }
});