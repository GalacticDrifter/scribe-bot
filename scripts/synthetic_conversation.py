import os
import json
import logging
import pyttsx3

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize TTS engine
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)  # Set speaking rate
tts_engine.setProperty('volume', 1)  # Set volume level

# Read conversation history
try:
    with open('data/conversations/conversation_history.json', 'r') as f:
        conversations = json.load(f)
    logging.info("Successfully read conversation history from JSON file.")
except Exception as e:
    logging.error(f"Failed to read conversation history: {e}")
    exit(1)

# Create output directory if it doesn't exist
output_dir = 'data/audio_conversations'
os.makedirs(output_dir, exist_ok=True)

# Function to synthesize speech
def synthesize_speech(text, output_file):
    try:
        tts_engine.save_to_file(text, output_file)
        tts_engine.runAndWait()
        logging.info(f'Audio content written to file "{output_file}"')
    except Exception as e:
        logging.error(f"Failed to synthesize speech for text '{text}': {e}")

# Iterate through conversations and synthesize speech
for conv_id, messages in conversations.items():
    for i, message in enumerate(messages):
        role = message['role']
        content = message['content']
        output_file = os.path.join(output_dir, f'{conv_id}_{i+1}_{role}.mp3')
        logging.info(f"Synthesizing speech for conversation ID {conv_id}, message {i+1}, role {role}.")
        synthesize_speech(content, output_file)

logging.info("Synthetic conversation audio generation complete.")
