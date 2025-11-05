
console.log('🚀 Microsoft Forms Auto-fill extension đã được tải!');


let isAutoFilling = false;
let filledCount = 0;
let totalQuestions = 0;

window.addEventListener('load', function() {
  setTimeout(autoFillForm, 3000);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fillForm') {
    autoFillForm(sendResponse);
    return true;
  }
  if (request.action === 'getStatus') {
    sendResponse({ 
      filled: filledCount, 
      total: totalQuestions,
      isAutoFilling: isAutoFilling
    });
    return true;
  }
});

function autoFillForm(sendResponse) {
  if (isAutoFilling) {
    if (sendResponse) {
      sendResponse({ success: false, message: 'Auto-fill in progress...' });
    }
    return;
  }
  
  isAutoFilling = true;
  filledCount = 0;
  
  try {
    const questionElements = document.querySelectorAll('[data-automation-id="questionItem"]');
    totalQuestions = questionElements.length;
    
    if (questionElements.length === 0) {
      if (sendResponse) {
        sendResponse({ success: false, message: 'No questions found' });
      }
      isAutoFilling = false;
      return;
    }
    
    console.log(`Found ${questionElements.length} questions, ${ANSWERS_DATA.length} answers in database`);
    showNotification(`Filling ${questionElements.length} questions...`, 'info');
    
    questionElements.forEach((questionElement, index) => {
      try {
        const questionTextElement = questionElement.querySelector('[data-automation-id="questionTitle"]');
        if (!questionTextElement) return;
        
        const questionText = cleanText(questionTextElement.textContent);
        const matchedData = findBestMatch(questionText, ANSWERS_DATA, questionElement);
        
        if (matchedData) {
          if (fillAnswer(questionElement, matchedData.answer)) {
            filledCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing question ${index + 1}:`, err);
      }
    });
    
    const message = `Filled ${filledCount}/${questionElements.length} answers`;
    console.log(message);
    showNotification(message, 'success');
    
    if (sendResponse) {
      sendResponse({ success: true, message });
    }
    
  } catch (error) {
    console.error('Auto-fill error:', error);
    showNotification('Error: ' + error.message, 'error');
    if (sendResponse) {
      sendResponse({ success: false, message: 'Error: ' + error.message });
    }
  } finally {
    isAutoFilling = false;
  }
}

function cleanText(text) {
  return text
    .replace(/^\d+[.,)\]]\s*/, '')
    .replace(/\[cite[^\]]*\]/g, '')
    .replace(/\[cite_start\]/g, '')
    .replace(/["""'']/g, '')
    .replace(/single choice\.?$/i, '')
    .replace(/multiple choice\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findBestMatch(questionText, answersData, questionElement) {
  const cleanQuestion = cleanText(questionText);
  
  const exactMatches = [];
  for (let data of answersData) {
    const cleanDataQuestion = cleanText(data.question);
    if (cleanDataQuestion === cleanQuestion) {
      exactMatches.push(data);
    }
  }
  
  if (exactMatches.length === 1) {
    return exactMatches[0];
  }
  
  if (exactMatches.length > 1) {
    const choices = questionElement.querySelectorAll('[data-automation-id="choiceItem"]');
    if (choices.length > 0) {
      const choiceTexts = Array.from(choices).map(c => cleanText(c.textContent));
      
      for (let data of exactMatches) {
        const answers = data.answer.split(';').map(a => cleanText(a.trim()));
        
        for (let ans of answers) {
          for (let choiceText of choiceTexts) {
            if (choiceText === ans || choiceText.includes(ans)) {
              return data;
            }
          }
        }
      }
    }
    
    return exactMatches[0];
  }
  
  return null;
}

function fillAnswer(questionElement, answer) {
  try {
    const answers = answer.split(';').map(a => a.trim());
    
    const textInput = questionElement.querySelector('textarea, input[type="text"]');
    
    if (textInput) {
      const finalAnswer = answers.join('; ');
      textInput.value = finalAnswer;
      
      textInput.focus();
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
      textInput.dispatchEvent(new Event('change', { bubbles: true }));
      textInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      textInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      textInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      return true;
    }
    
    const choices = questionElement.querySelectorAll('[data-automation-id="choiceItem"]');
    
    if (choices.length > 0) {
      let filled = false;
      
      for (let ans of answers) {
        const cleanAns = cleanText(ans);
        
        for (let choice of choices) {
          const choiceText = cleanText(choice.textContent);
          
          if (choiceText === cleanAns) {
            clickChoice(choice);
            filled = true;
            break;
          }
          
          if (choiceText.includes(cleanAns)) {
            clickChoice(choice);
            filled = true;
            break;
          }
        }
      }
      
      return filled;
    }
    
    const otherInputs = questionElement.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="text"])');
    if (otherInputs.length > 0) {
      otherInputs[0].value = answers[0];
      otherInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      otherInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Fill error:', err);
    return false;
  }
}

function clickChoice(choice) {
  try {
    const input = choice.querySelector('input[type="radio"], input[type="checkbox"]');
    
    if (input && !input.checked) {
      const label = choice.querySelector('label');
      const clickTarget = label || choice;
      
      clickTarget.click();
      
      setTimeout(() => {
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('click', { bubbles: true }));
        }
      }, 50);
    }
  } catch (err) {
    console.error('Click error:', err);
  }
}

function showNotification(message, type = 'info') {
  const oldNotif = document.getElementById('autofill-notification');
  if (oldNotif) oldNotif.remove();
  
  const notification = document.createElement('div');
  notification.id = 'autofill-notification';
  notification.textContent = message;
  
  const colors = {
    'success': '#4caf50',
    'error': '#f44336',
    'info': '#2196f3'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

