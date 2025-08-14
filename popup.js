document.getElementById("convert24Btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { 
      // Clear all modes first
      window.timeConversionMode = null;
      window.measurementConversionMode = null;
      window.resetToOriginal = false;
      // Set the new mode
      window.timeConversionMode = '24hour';
    }
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

document.getElementById("convert12Btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { 
      // Clear all modes first
      window.timeConversionMode = null;
      window.measurementConversionMode = null;
      window.resetToOriginal = false;
      // Set the new mode
      window.timeConversionMode = '12hour';
    }
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

document.getElementById("convertMetricBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { 
      // Clear all modes first
      window.timeConversionMode = null;
      window.measurementConversionMode = null;
      window.resetToOriginal = false;
      // Set the new mode
      window.measurementConversionMode = 'metric';
    }
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

document.getElementById("convertImperialBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { 
      // Clear all modes first
      window.timeConversionMode = null;
      window.measurementConversionMode = null;
      window.resetToOriginal = false;
      // Set the new mode
      window.measurementConversionMode = 'imperial';
    }
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { 
      // Clear all modes first
      window.timeConversionMode = null;
      window.measurementConversionMode = null;
      // Set reset flag
      window.resetToOriginal = true;
    }
  });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

document.getElementById("emojiBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('create_icons.html') });
});

document.getElementById("aboutBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('about.html') });
});