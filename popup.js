document.addEventListener('DOMContentLoaded', function() {
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const increaseBtn = document.getElementById('increaseSpeed');
    const decreaseBtn = document.getElementById('decreaseSpeed');
    const rememberSpeedToggle = document.getElementById('rememberSpeed');
    const autoApplyToggle = document.getElementById('autoApply');
    const timeSavedElement = document.getElementById('timeSaved');
    const videoCountElement = document.getElementById('videoCount');
  
    // Load saved preferences
    chrome.storage.local.get(['speed', 'rememberSpeed', 'autoApply', 'timeSaved', 'videoCount'], function(data) {
      if (data.rememberSpeed && data.speed) {
        updateSpeed(data.speed);
      }
      rememberSpeedToggle.checked = data.rememberSpeed || false;
      autoApplyToggle.checked = data.autoApply || false;
      timeSavedElement.textContent = `${Math.round(data.timeSaved || 0)} minutes`;
      videoCountElement.textContent = data.videoCount || 0;
    });
  
    function updateSpeed(speed) {
      speed = Math.min(Math.max(0.25, speed), 4.0);
      speedSlider.value = speed;
      speedValue.textContent = speed.toFixed(2);
      
      if (rememberSpeedToggle.checked) {
        chrome.storage.local.set({ speed: speed });
      }
  
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSpeed",
          speed: speed,
          autoApply: autoApplyToggle.checked
        });
      });
    }
  
    // Event listeners
    speedSlider.addEventListener('input', function() {
      updateSpeed(parseFloat(this.value));
    });
  
    increaseBtn.addEventListener('click', function() {
      updateSpeed(parseFloat(speedSlider.value) + 0.25);
    });
  
    decreaseBtn.addEventListener('click', function() {
      updateSpeed(parseFloat(speedSlider.value) - 0.25);
    });
  
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(button => {
      button.addEventListener('click', function() {
        updateSpeed(parseFloat(this.dataset.speed));
      });
    });
  
    // Toggle listeners
    rememberSpeedToggle.addEventListener('change', function() {
      chrome.storage.local.set({ rememberSpeed: this.checked });
    });
  
    autoApplyToggle.addEventListener('change', function() {
      chrome.storage.local.set({ autoApply: this.checked });
    });
  });