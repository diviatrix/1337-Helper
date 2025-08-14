// Wrap in IIFE to avoid global scope pollution and re-declaration errors
(function() {
  // Save original DOM state on first run
  if (!window.originalBodyHTML) {
    window.originalBodyHTML = document.body.cloneNode(true);
  }
  
  // Handle reset command
  if (window.resetToOriginal === true) {
    if (window.originalBodyHTML) {
      document.body.parentNode.replaceChild(window.originalBodyHTML.cloneNode(true), document.body);
    }
    window.resetToOriginal = false;
    return;
  }
  function convertTo24Hour(timeStr) {
    // Support both "3:30 PM", "3:30PM" and "6AM" formats
    const match = timeStr.match(/^(\d{1,2})(:(\d{2}))?\s?(AM|PM)$/i);
    if (!match) return timeStr;

    let [_, hour, colon, minute, period] = match;
    hour = parseInt(hour, 10);
    minute = minute || '00'; // Default to :00 if no minutes specified

    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  function convertTo12Hour(timeStr) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeStr;

    let [_, hour, minute] = match;
    hour = parseInt(hour, 10);
    
    if (hour === 0) {
      return `12:${minute} AM`;
    } else if (hour < 12) {
      return `${hour}:${minute} AM`;
    } else if (hour === 12) {
      return `12:${minute} PM`;
    } else {
      return `${hour - 12}:${minute} PM`;
    }
  }

  function walkAndConvert(node, convertFunction, regex) {
    if (node.nodeType === Node.TEXT_NODE) {
      const originalText = node.textContent;
      const newText = originalText.replace(regex, match => convertFunction(match));
      if (originalText !== newText) {
        node.textContent = newText;
      }
    } else {
      node.childNodes.forEach(child => walkAndConvert(child, convertFunction, regex));
    }
  }

  function convertPageTo24Hour() {
    // Updated regex to match "6AM", "6:30AM", "6:30 AM" formats
    const regex = /\b(\d{1,2})(:(\d{2}))?\s?(AM|PM)\b/gi;
    walkAndConvert(document.body, convertTo24Hour, regex);
  }

  function convertPageTo12Hour() {
    // Only match valid 24-hour times, not already converted ones
    const regex = /\b([01]?\d|2[0-3]):([0-5]\d)\b(?!\s*(AM|PM))/gi;
    walkAndConvert(document.body, convertTo12Hour, regex);
  }

  function convertToMetric(measurementStr) {
    // Temperature - must be first to avoid matching plain numbers
    if (/°?F\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${((value - 32) * 5/9).toFixed(1)}°C`;
    }
    
    // Length - inches
    if (/(?:inches?|in\.?|")/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 2.54).toFixed(1)} cm`;
    }
    
    // Length - feet
    if (/(?:feet|foot|ft\.?|')/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 0.3048).toFixed(2)} m`;
    }
    
    // Distance - miles
    if (/(?:miles?|mi\.?)/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 1.60934).toFixed(2)} km`;
    }
    
    // Length - yards
    if (/(?:yards?|yd\.?)/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 0.9144).toFixed(2)} m`;
    }
    
    // Weight - pounds
    if (/(?:pounds?|lbs?\.?)/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 0.453592).toFixed(2)} kg`;
    }
    
    // Weight - ounces
    if (/(?:ounces?|oz\.?)/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 28.3495).toFixed(1)} g`;
    }
    
    return measurementStr;
  }

  function convertToImperial(measurementStr) {
    // Temperature - must be first
    if (/°?C\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value * 9/5 + 32).toFixed(1)}°F`;
    }
    
    // Length - cm
    if (/\bcm\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value / 2.54).toFixed(1)} in`;
    }
    
    // Length - meters (but not kilometers)
    if (/\bm\b(?!i)/i.test(measurementStr) && !/km\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      if (value >= 1) {
        return `${(value / 0.3048).toFixed(1)} ft`;
      } else {
        return `${(value / 0.0254).toFixed(1)} in`;
      }
    }
    
    // Distance - kilometers
    if (/\bkm\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value / 1.60934).toFixed(2)} mi`;
    }
    
    // Weight - kilograms
    if (/\bkg\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value / 0.453592).toFixed(2)} lbs`;
    }
    
    // Weight - grams (but not kilograms)
    if (/\bg\b/i.test(measurementStr) && !/kg\b/i.test(measurementStr)) {
      const value = parseFloat(measurementStr);
      return `${(value / 28.3495).toFixed(2)} oz`;
    }
    
    return measurementStr;
  }

  function convertPageToMetric() {
    // More precise regex patterns - avoid values already in parentheses
    const patterns = [
      /\b\d+(?:\.\d+)?\s*°?F\b(?![^(]*\))/gi,  // Temperature not in parentheses
      /\b\d+(?:\.\d+)?\s*(?:inches?|in\.?|")(?![^(]*\))/gi,  // Inches
      /\b\d+(?:\.\d+)?\s*(?:feet|foot|ft\.?|')(?![^(]*\))/gi,  // Feet
      /\b\d+(?:\.\d+)?\s*(?:miles?|mi\.?)\b(?![^(]*\))/gi,  // Miles
      /\b\d+(?:\.\d+)?\s*(?:yards?|yd\.?)\b(?![^(]*\))/gi,  // Yards
      /\b\d+(?:\.\d+)?\s*(?:pounds?|lbs?\.?)\b(?![^(]*\))/gi,  // Pounds
      /\b\d+(?:\.\d+)?\s*(?:ounces?|oz\.?)\b(?![^(]*\))/gi  // Ounces
    ];
    
    patterns.forEach(regex => {
      walkAndConvert(document.body, convertToMetric, regex);
    });
  }

  function convertPageToImperial() {
    // More precise regex patterns - avoid values already in parentheses
    const patterns = [
      /\b\d+(?:\.\d+)?\s*°?C\b(?![^(]*\))/gi,  // Temperature
      /\b\d+(?:\.\d+)?\s*cm\b(?![^(]*\))/gi,  // Centimeters
      /\b\d+(?:\.\d+)?\s*m\b(?!i)(?![^(]*\))/gi,  // Meters (not miles)
      /\b\d+(?:\.\d+)?\s*km\b(?![^(]*\))/gi,  // Kilometers
      /\b\d+(?:\.\d+)?\s*kg\b(?![^(]*\))/gi,  // Kilograms
      /\b\d+(?:\.\d+)?\s*g\b(?!a)(?![^(]*\))/gi  // Grams
    ];
    
    patterns.forEach(regex => {
      walkAndConvert(document.body, convertToImperial, regex);
    });
  }

  // Execute the appropriate conversion
  if (window.timeConversionMode === '24hour') {
    convertPageTo24Hour();
  } else if (window.timeConversionMode === '12hour') {
    convertPageTo12Hour();
  } else if (window.measurementConversionMode === 'metric') {
    convertPageToMetric();
  } else if (window.measurementConversionMode === 'imperial') {
    convertPageToImperial();
  }
})();