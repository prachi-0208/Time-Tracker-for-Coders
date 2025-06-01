document.addEventListener("DOMContentLoaded", () => {
    // Load total time from chrome.storage
    chrome.storage.local.get(["totalTime"], (result) => {
        let totalTime = result.totalTime || 0;
        document.getElementById("timeSpent").textContent = formatTime(totalTime);
    });

    // Optional: Handle reset if a button exists
    const resetBtn = document.getElementById("reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            chrome.storage.local.set({ totalTime: 0 }, () => {
                document.getElementById("timeSpent").textContent = "0h 0m 0s";
            });
        });
    }
});

// Utility function to format seconds into hh:mm:ss
function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}
