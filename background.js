let startTime = 0;
let totalCodingTime = 0;
let lastActiveSite = "";

// Listen for tab activation (when the user switches tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        let tab = await chrome.tabs.get(activeInfo.tabId);
        if (!tab || !tab.url) {
            console.warn("No URL found for activated tab.");
            return;
        }
        handleSiteChange(tab.url);
    } catch (error) {
        console.error("Error getting tab info:", error);
    }
});

// Listen for tab updates (when the URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        handleSiteChange(changeInfo.url);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStoredData") {
        chrome.storage.local.get(null, (data) => sendResponse(data));
        return true; // Required for async response
    }
});


// Function to check if a site is a coding platform
function isCodingSite(url) {
    return url && (url.includes("leetcode.com") || url.includes("codeforces.com") || url.includes("github.com"));
}

// Handle site changes
function handleSiteChange(url) {
    if (!url) {
        console.warn("handleSiteChange called with undefined URL"); // More detailed warning
        return;
    }

    console.log("Switching to site:", url);

    if (isCodingSite(url)) {
        if (lastActiveSite !== url) {
            saveTimeSpent();
            console.log("Tracking time for:", url);
            startTime = Date.now();
            lastActiveSite = url;
        }
    } else {
        saveTimeSpent();
        lastActiveSite = "";
    }
}

// Save the time spent coding
function saveTimeSpent() {
    if (startTime > 0) {
        let elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds

        chrome.storage.local.get(["totalTime"], (result) => {
            let newTotal = (result.totalTime || 0) + elapsedTime;
            chrome.storage.local.set({ "totalTime": newTotal }, () => {
                console.log("Total coding time updated:", newTotal);
            });
        });

        startTime = 0; // Reset start time
    }
}
