chrome.runtime.onInstalled.addListener(() => {
    console.log("ScribeBot installed.");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabCapture.capture({ audio: true, video: false }, function (stream) {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", function (event) {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", function () {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioBlob.arrayBuffer().then(buffer => {
                fetch('http://localhost:5000/transcribe_stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    },
                    body: buffer
                });
            });
        });

        mediaRecorder.start();

        setTimeout(() => {
            mediaRecorder.stop();
        }, 300000); // Capture for 5 minutes
    });
});
