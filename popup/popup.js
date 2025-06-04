document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["codingTime"], (result) => {
    const seconds = result.codingTime || 0;
    document.getElementById("timeSpent").textContent = formatTime(seconds);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.storage.local.set({ codingTime: 0 }, () => {
      document.getElementById("timeSpent").textContent = "0h 0m 0s";
    });
  });
});

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
