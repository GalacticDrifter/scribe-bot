document.getElementById('startCapture').addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'startCapture' });
});
