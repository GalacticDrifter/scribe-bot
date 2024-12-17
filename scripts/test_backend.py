import os
import requests

# Directory containing the synthetic audio files
audio_dir = 'data/audio_conversations'

# Backend URL
backend_url = 'http://localhost:5000/process_audio'

# Function to read audio file and send to backend
def send_audio_to_backend(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(backend_url, files=files)
        return response.json()

# Iterate through audio files and send to backend
for root, _, files in os.walk(audio_dir):
    for file in files:
        if file.endswith('.mp3'):
            file_path = os.path.join(root, file)
            print(f"Sending {file_path} to backend...")
            response = send_audio_to_backend(file_path)
            print(f"Response: {response}")

print("Finished sending all audio files to backend.")
