function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

function updateExtensionStatus(text, color = '#28a745') {
  const statusSpan = document.getElementById('extensionStatus');
  statusSpan.textContent = text;
  statusSpan.style.color = color;
}

document.getElementById('fillForm').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    
    if (!currentTab.url.includes('forms.office.com')) {
      showStatus('⚠️ Please open Microsoft Forms first!', 'error');
      return;
    }
    
    updateExtensionStatus('Filling...', '#ff9800');
    showStatus('⏳ Filling form, please wait...', 'info');
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'fillForm' }, function(response) {
      if (chrome.runtime.lastError) {
        showStatus('❌ Error: ' + chrome.runtime.lastError.message, 'error');
        updateExtensionStatus('Error', '#dc3545');
      } else if (response && response.success) {
        showStatus('✅ ' + response.message, 'success');
        updateExtensionStatus('Completed!', '#28a745');
      } else {
        showStatus('⚠️ ' + (response ? response.message : 'Error occurred'), 'error');
        updateExtensionStatus('Failed', '#dc3545');
      }
    });
  });
});

document.getElementById('checkStatus').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    
    if (!currentTab.url.includes('forms.office.com')) {
      showStatus('⚠️ Please open Microsoft Forms!', 'error');
      return;
    }
    
    chrome.tabs.sendMessage(currentTab.id, { action: 'getStatus' }, function(response) {
      if (chrome.runtime.lastError) {
        showStatus('❌ Cannot check. Please reload the page!', 'error');
      } else if (response) {
        if (response.total === 0) {
          showStatus('ℹ️ No data yet', 'info');
        } else {
          showStatus(`📊 Filled ${response.filled}/${response.total} questions`, 'info');
          if (response.isAutoFilling) {
            showStatus('⏳ Auto-filling in progress...', 'info');
          }
        }
      }
    });
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  const currentTab = tabs[0];
  
  if (currentTab.url && currentTab.url.includes('forms.office.com')) {
    updateExtensionStatus('Ready to fill!', '#28a745');
  } else {
    updateExtensionStatus('Open Microsoft Forms', '#6c757d');
  }
});
