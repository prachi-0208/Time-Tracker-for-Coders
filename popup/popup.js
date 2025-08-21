document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["codingTime", "dailyCodingTimes", "streakCount"], (result) => {
    const seconds = result.codingTime || 0;
    const dailyTimes = result.dailyCodingTimes || [];
    const streak = result.streakCount || 0;

    document.getElementById("timeSpent").textContent = formatTime(seconds);
    document.getElementById("streakCount").textContent = `${streak} day(s)`;

    // Create the daily coding time bar chart
    const dailyLabels = dailyTimes.map((_, index) => `Day ${index + 1}`);
    const dailyData = dailyTimes.map(timeInSeconds => (timeInSeconds / 3600).toFixed(2)); // Convert to hours
    new Chart(document.getElementById('dailyChart'), {
      type: 'bar',
      data: {
        labels: dailyLabels,
        datasets: [{
          label: 'Coding Time (hours)',
          data: dailyData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Calculate weekly average
    const totalWeeklySeconds = dailyTimes.reduce((acc, curr) => acc + curr, 0);
    const weeklyAverageSeconds = dailyTimes.length > 0 ? totalWeeklySeconds / dailyTimes.length : 0;
    const totalSecondsInDay = 24 * 3600;

    // Create the weekly average pie chart
    const pieData = [weeklyAverageSeconds, totalSecondsInDay - weeklyAverageSeconds];
    new Chart(document.getElementById('weeklyAverageChart'), {
      type: 'pie',
      data: {
        labels: ['Average Coding Time', 'Other Time'],
        datasets: [{
          label: 'Weekly Average',
          data: pieData,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(201, 203, 207, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label;
                const value = context.parsed;
                return `${label}: ${formatTime(value)}`;
              }
            }
          }
        }
      }
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.storage.local.set({ codingTime: 0, dailyCodingTimes: [], streakCount: 0 }, () => {
      document.getElementById("timeSpent").textContent = "0h 0m 0s";
      document.getElementById("streakCount").textContent = "0 day(s)";
      location.reload(); // Reload the popup to update the charts
    });
  });
});

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}