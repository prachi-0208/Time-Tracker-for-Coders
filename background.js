let startTime = null;
let timerInterval = null;

function isCodingSite(url) {
  return (
    url.includes("leetcode.com") ||
    url.includes("github.com") ||
    url.includes("codeforces.com") ||
    url.includes("hackerrank.com") ||
    url.includes("takeuforward.org/plus/dsa")
  );
}

function startTimer() {
  if (timerInterval) return;

  startTime = Date.now();
  timerInterval = setInterval(() => {
    chrome.storage.local.get(["codingTime"], (result) => {
      const prevTime = result.codingTime || 0;
      const newTime = prevTime + 1;
      chrome.storage.local.set({ codingTime: newTime });
    });
  }, 1000); // every second
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (isCodingSite(tab.url)) {
      startTimer();
    } else {
      stopTimer();
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    if (isCodingSite(tab.url)) {
      startTimer();
    } else {
      stopTimer();
    }
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTimer();
  } else {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      const activeTab = window.tabs.find((t) => t.active);
      if (activeTab && isCodingSite(activeTab.url)) {
        startTimer();
      } else {
        stopTimer();
      }
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  stopTimer();
});
