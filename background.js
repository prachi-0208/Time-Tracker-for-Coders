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

function checkAndResetDaily() {
  const today = new Date().toLocaleDateString();
  chrome.storage.local.get(["lastResetDate", "dailyCodingTimes", "codingTime", "streakCount"], (result) => {
    const lastResetDate = result.lastResetDate;
    let dailyTimes = result.dailyCodingTimes || [];
    let currentTime = result.codingTime || 0;
    let streakCount = result.streakCount || 0;

    if (lastResetDate !== today) {
      // It's a new day, so store the previous day's time and reset
      dailyTimes.push(currentTime);
      if (dailyTimes.length > 7) {
        dailyTimes.shift(); // Keep only the last 7 days
      }

      // Check and update streak
      if (currentTime > 0) {
        streakCount += 1;
      } else {
        streakCount = 0; // Reset streak if no coding time was logged
      }

      chrome.storage.local.set({
        codingTime: 0,
        lastResetDate: today,
        dailyCodingTimes: dailyTimes,
        streakCount: streakCount,
      });
    }
  });
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
  checkAndResetDaily();
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
    checkAndResetDaily();
    if (isCodingSite(tab.url)) {
      startTimer();
    } else {
      stopTimer();
    }
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  checkAndResetDaily();
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