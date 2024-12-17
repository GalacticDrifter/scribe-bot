import os
import json
import logging
from datetime import datetime
import threading
import time
from flask import Flask, jsonify, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv
import openai
import requests
from scripts.capture import (
    handle_advisor_query_google_meet,
    transcribe_audio,
    process_with_ai,
    handle_advisor_query,
    initialize_conversation,
    update_advisor_conversation,
    update_conversation,
)
from scripts.chat import (
    generate_corrected_transcript,
    get_advisor_response,
    get_general_response,
)
from scripts.data import (
    get_customer_list,
    get_user_list,
    get_user_profile,
    get_advisor_list,
    save_transcription_file,
    get_conversation_history,
    search_profiles,
)
from scripts.util import setup_logging
import tempfile

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))

# Set up logging
setup_logging("./logs/app_operations.log")
# logging.basicConfig(filename='logs/transcription.log', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Set the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Set up Flask app and SocketIO
app = Flask(__name__, static_folder='app/build', static_url_path='/')
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
CORS(app, resources={r"/*": {"origins": "*"}})


@app.after_request
def set_cross_origin_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response


socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    ping_timeout=60,  # Increased to ensure connection stability
    ping_interval=30,  # Increased to match the timeout
    max_http_buffer_size=10000000,  # Ensure this is sufficiently high to handle your data
    async_handlers=True,
    logger=False,  # Enable SocketIO logging
    engineio_logger=False,  # Enable EngineIO logging
)

# Set up OAuth
oauth = OAuth(app)

with open(os.getenv("GOOGLE_CLIENT_SECRET_PATH")) as f:
    credentials = json.load(f)


# Fetch the OpenID configuration
def fetch_openid_configuration():
    try:
        response = requests.get(
            "https://accounts.google.com/.well-known/openid-configuration"
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error in fetch_openid_configuration: {e}")
        return {}


openid_config = fetch_openid_configuration()
if (openid_config):
    jwks_uri = openid_config["jwks_uri"]
else:
    openid_config["authorization_endpoint"] = ""
    openid_config["token_endpoint"] = ""
    jwks_uri = ""

oauth.register(
    name="google",
    client_id=credentials["web"]["client_id"],
    client_secret=credentials["web"]["client_secret"],
    authorize_url= openid_config["authorization_endpoint"],
    authorize_params=None,
    access_token_url=openid_config["token_endpoint"],
    access_token_params=None,
    refresh_token_url=None,
    redirect_uri=os.getenv("REDIRECT_URI", "http://localhost:5000/login/authorized"),
    client_kwargs={"scope": "openid email profile", "jwks_uri": jwks_uri},
)


@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return app.send_static_file(path)


@app.route("/login")
def login():
    redirect_uri = url_for("authorized", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@app.route("/logout")
def logout():
    session.pop("google_token")
    session.pop("conversation_history", None)
    return redirect(url_for("index"))


@app.route("/login/authorized")
def authorized():
    token = oauth.google.authorize_access_token()
    user_info = oauth.google.parse_id_token(token)
    session["google_token"] = token
    return redirect(url_for("index"))

@app.route("/users")
def get_users():
    try:
        logging.info(f"Get Users")
        users = get_user_list()
        # logging.info(f"Users: {users}")
    
        return jsonify({"users": users })
    except Exception as e:
        logging.error(f"Error getting users: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/user/:userId", methods=["GET"])
def get_user(userId):
    try:
        logging.info(f"Get User from UserId: {userId}")
        user = get_user_profile(userId)
        logging.info(f"User: {user}")
    
        return jsonify({"user": user})
    except Exception as e:
        logging.error(f"Error getting user: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/advisors")
def get_advisors():
    try:
        logging.info(f"Get Advisors")
        advisors = get_advisor_list()
        logging.info(f"Advisors: {advisors}")
    
        return jsonify({"advisors": advisors })
    except Exception as e:
        logging.error(f"Error getting advisors: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/customers")
def get_customers():
    try:
        logging.info(f"Get Customers")
        customers = get_customer_list()
        logging.info(f"Customers: {customers}")
    
        return jsonify({"customers": customers })
    except Exception as e:
        logging.error(f"Error getting customers: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/process_audio", methods=["POST"])
def process_audio():
    file = request.files["file"]
    file_path = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
    file.save(file_path)
    try:
        transcription = transcribe_audio(file_path)
        ai_response = process_with_ai(transcription)
        os.remove(file_path)
        return jsonify({"transcription": transcription, "ai_response": ai_response})
    except Exception as e:
        logging.error(f"Error processing audio: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/save_transcript", methods=["POST"])
def save_transcript():
    if request.content_type != "application/json":
        return (
            jsonify(
                {"status": "error", "message": "Content-Type must be application/json"}
            ),
            415,
        )

    data = request.json
    timestamp = datetime.now().strftime("%Y%m%d")
    filename = f"data/transcripts/transcript_{timestamp}.json"

    # Ensure the directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    # Read the existing data if the file exists
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    # Append the new data
    existing_data.append(data)

    # Write the updated data back to the file
    with open(filename, "w") as f:
        json.dump(existing_data, f, indent=4)

    return jsonify({"status": "success", "message": "Transcript saved successfully"})

@app.route("/get_conversation_history", methods=["POST"])
def get_advisor_conversation_history():
    print("Get Advisor Conversation")
    try:
        data = request.json
        userId = data.get("userId")
        callerId = data.get("callerId")
        conversation = get_conversation_history(userId, callerId)
        return jsonify({"conversation": conversation})
    except Exception as e:
        print(f"Error saving advisor transcript: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/save_advisor_transcript", methods=["POST"])
def save_advisor_transcript():
    print("Save Advisor Transcript")
    if request.content_type != "application/json":
        return (
            jsonify(
                {"status": "error", "message": "Content-Type must be application/json"}
            ),
            415,
        )

    try:
        data = request.json
        advisorId = data.get("advisorId")
        userId = data.get("userId")
        callerId = data.get("callerId")
        transcript = data.get("transcription")
        response = data.get("response")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        filename = f"data/conversations/{userId}_{callerId}.json"

        advisorConversation = {
            "timestamp": timestamp,
            "advisorId": advisorId,
            "userId": userId,
            "callerId": callerId,
            "callerTranscription": transcript,
            "advisorResponse": response
        }

        # Ensure the directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Read the existing data if the file exists
        if os.path.exists(filename):
            with open(filename, "r") as f:
                existing_data = json.load(f)
        else:
            existing_data = []

        # Append the new data
        existing_data.append(advisorConversation)

        # Write the updated data back to the file
        with open(filename, "w") as f:
            json.dump(existing_data, f, indent=4)

        return jsonify({"status": "success", "message": "Transcript saved successfully"})
    except Exception as e:
        print(f"Error saving advisor transcript: {e}")
        return jsonify({"error": str(e)}), 500


buffer_lock = threading.Lock()
audio_buffer = bytearray()
last_event_time = 0
EVENT_INTERVAL = 1  # Minimum interval between events in seconds


@socketio.on("transcribe_stream")
def handle_transcribe_stream(data):
    try:
        filename = 'temp.wav'  # Or generate a unique filename

        # Save the audio data to a temporary file
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(temp_path, 'wb') as f:
            f.write(data)

        transcription = transcribe_audio(temp_path)
        print(f"Transcription: {transcription}")

        if transcription is None:
            emit(
                "transcription",
                {"error": "Transcription failed"},
                broadcast=True,
            )
            logging.error("Transcription failed.")
            return

        corrected_transcript = generate_corrected_transcript(transcription)
        emit(
            "transcription",
            {"transcription": corrected_transcript + "\n"},
            broadcast=True,
        )
        print(f"Corrected Transcription result: {corrected_transcript}")

    except Exception as e:
        print(f"Error in handle_transcribe_stream: {e}")
        emit("transcription", {"error": str(e)}, broadcast=True)


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


# Socket.IO event handler for chat stream
@socketio.on("chat_stream")
def handle_chat_stream(data):
    print("Received audio stream data for chat")
    try:
        filename = 'temp.wav'  # Or generate a unique filename

        # Save the audio data to a temporary file
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(temp_path, 'wb') as f:
            f.write(data)

        transcription = transcribe_audio(temp_path)
        print("Transcription:", transcription)

        chat_response = get_general_response(transcription, "gpt-4o")
        print("ChatGPT response:", chat_response)

        emit(
            "transcription",
            {"transcription": transcription + "\n", "response": chat_response + "\n\n"},
            broadcast=True,
        )
    except Exception as e:
        print("Error in chat_stream:", str(e))
        emit("transcription", {"transcription": str(e)})


@socketio.on("advisor_stream")
def handle_advisor_stream(data):
    print("Received audio stream data for advisor")
    try:
        if 'audio' not in data:
            return {'error': 'No file part'}, 400

        audio_data = data['audio']
        filename = 'temp.wav'  # Or generate a unique filename

        # Save the audio data to a temporary file
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(temp_path, 'wb') as f:
            f.write(audio_data)

        transcription, enriched_context = handle_advisor_query(
            audio=temp_path, 
            role_transcript='customer',
            advisorId=data.get("advisorId"), 
            userId=data.get("userId"), 
            customerId=data.get("callerId")  # Note: changed from customerId to callerId
        )

        if transcription is None:
            raise ValueError("Transcription is None")
        if enriched_context is None:
            raise ValueError("Enriched context is None")

        # print("Transcription:", transcription)
        # print("Enriched Context:", enriched_context)

        chat_response = get_advisor_response(enriched_context, "gpt-4o")
        if chat_response is None:
            chat_response = "I'm sorry, I couldn't process your request at this moment."

        # print("Chat Response:", chat_response)

        update_conversation(transcription, chat_response)

        emit(
            "transcription",
            {"transcription": transcription + "\n", "response": chat_response + "\n\n"},
            broadcast=True,
        )
    except Exception as e:
        print("Error in advisor_stream:", str(e))
        emit("transcription", {"error": str(e)}, broadcast=True)


@socketio.on("advisor_transcription")
def handle_advisor_stream(data):
    print("Received audio stream data for advisor")
    try:
        print("transcription received:", data)

        # Assuming transcription has a property or key called 'personName'
        if data['personName'] == 'You':
            data['personName'] = 'Quinn Lawrence'
        result = search_profiles(data['personName'])

        user_id = result['id'] if result and result['type'] == 'user' else "U000"
        customer_id = result['id'] if result and result['type'] == 'customer' else None
        role_transcript = result['type'] if result and result['type'] in ['user', 'customer'] else 'customer'

        transcription, enriched_context = handle_advisor_query_google_meet(
            transcription=data['personTranscript'], 
            role_transcript=role_transcript,
            advisorId="A000", 
            userId=user_id, 
            customerId=customer_id  # Set customerId or callerId based on the result
        )

        if transcription is None:
            raise ValueError("Transcription is None")
        if enriched_context is None:
            raise ValueError("Enriched context is None")

        print("Transcription:", transcription)

        chat_response = get_advisor_response(enriched_context, "gpt-4o")
        if chat_response is None:
            chat_response = "I'm sorry, I couldn't process your request at this moment."

        print("Advisor Response:", chat_response)
        # You can emit the chat response back to the client here if needed

        # update_advisor_conversation(role_transcript, transcription, chat_response)

        emit(
            "transcription",
            {"transcription": transcription + "\n", "response": chat_response + "\n\n"},
            broadcast=True,
        )

    except Exception as e:
        print("Error in advisor_transcription:", str(e))
        socketio.emit("transcription", {"error": str(e)}, broadcast=True)


if __name__ == "__main__":
    initialize_conversation()
    socketio.run(app, debug=True, port=5000)
