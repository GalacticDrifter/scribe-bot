import os
import json
import openai
import logging
from datetime import datetime
from google.cloud import speech
from google.oauth2 import service_account
from flask_socketio import emit
import io
from scripts.chat import get_advisor_response, dynamic_prepare_context
from scripts.data import (
    get_customer_profile,
    get_user_profile,
    get_advisor_profile,
    get_vector_db,
    query_vector_db,
)
from scripts.util import setup_logging
from pydub import AudioSegment

# Set up logging
setup_logging("logs/capture_operations.log")

# Google Cloud Speech-to-Text client
# Use os.path.join for constructing file paths
config_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "config", "google_app_credentials.json"
)

# Use raw string for Windows paths
credentials = service_account.Credentials.from_service_account_file(
    r"{}".format(config_path)
)
client = speech.SpeechClient(credentials=credentials)

def convert_audio_to_linear16(audio_data):
    # Load audio data from bytes (assuming it's in wav format)
    audio = AudioSegment.from_wav(io.BytesIO(audio_data))
    # Set frame rate, channels, and sample width
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    return audio.raw_data

def transcribe_audio(audio_file_path):
    print("Transcribing audio file")
    try:
        audio_file= open(audio_file_path, "rb")
        transcription = openai.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file
        )
        print(transcription.text)
        return transcription.text
    except Exception as e:
        logging.error(f"Error transcribing audio: {e}")
        return None

def transcribe_audio_google(audio_data):
    try:
        print("Transcribing audio data")
        converted_audio_data = convert_audio_to_linear16(audio_data)
        
        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(content=converted_audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,  # Default encoding
            sample_rate_hertz=16000,  # Default sample rate
            language_code="en-US"
        )

        response = client.recognize(config=config, audio=audio)
        transcription = "".join(result.alternatives[0].transcript + "\n" for result in response.results)
        print(f"Transcription received: {transcription}")
        return transcription

    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        return None


# Function to handle middle-man AI
def process_with_ai(transcription):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f"Process this transcription: {transcription}",
        max_tokens=150,
    )
    return response.choices[0].text.strip()


# Initialize conversation context
conversation_context = []


def initialize_conversation():
    global conversation_context
    conversation_context = []


def update_conversation(user_message, caller_message):
    global conversation_context
    conversation_context.append({"role": "user", "content": user_message})
    conversation_context.append({"role": "assistant", "content": caller_message})

def update_advisor_conversation(role_transcript, user_message, caller_message):
    global conversation_context

    if role_transcript == 'user':
        conversation_context.append({"role": "user", "content": f"Salesperson: {user_message}"})
    else:
        conversation_context.append({"role": "user", "content": f"Customer: {user_message}"})

    conversation_context.append({"role": "assistant", "content": caller_message})


# Function to handle advisor query
def handle_advisor_query(audio, role_transcript, advisorId=None, customerId=None, userId="U000"):
    print("Handling advisor query")
    transcription = transcribe_audio(audio)
    advisor_profile = get_advisor_profile(advisorId)
    vectorstore = get_vector_db("skygrid_vectordb")
    relevant_info = query_vector_db(vectorstore, transcription)
    customer_profile = json.dumps(get_customer_profile(customerId))
    user_profile = json.dumps(get_user_profile(userId))
    enriched_context = dynamic_prepare_context(
        conversation_context,
        transcription,
        role_transcript,
        relevant_info,
        customer_profile,
        user_profile,
    )
    return transcription, enriched_context

# Function to handle advisor query
def handle_advisor_query_google_meet(transcription, role_transcript, advisorId=None, customerId=None, userId=None):
    print("Handling advisor query")
    advisor_profile = get_advisor_profile(advisorId)
    vectorstore = get_vector_db("skygrid_vectordb")
    relevant_info = query_vector_db(vectorstore, transcription)
    customer_profile = json.dumps(get_customer_profile(customerId))
    user_profile = json.dumps(get_user_profile(userId))
    enriched_context = dynamic_prepare_context(
        conversation_context,
        transcription,
        role_transcript,
        relevant_info,
        customer_profile,
        user_profile,
    )
    print("Enriched context: ", enriched_context)
    return transcription, enriched_context