import json
import os
from datetime import datetime
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from sentence_transformers import SentenceTransformer
from functools import lru_cache
import logging
from scripts.util import (
    save_json_data,
    load_json_data,
    get_absolute_path,
    setup_logging,
)

# Set up logging
# Construct the path to the logs directory
current_dir = os.path.dirname(os.path.abspath(__file__))
log_dir = os.path.join(current_dir, "..", "logs")
log_file = os.path.join(log_dir, "data_operations.log")

# Ensure the logs directory exists
os.makedirs(log_dir, exist_ok=True)

setup_logging(log_file)


def save_transcription_file(filename, transcription):
    try:
        if not os.path.exists("transcripts"):
            os.makedirs("transcripts")
        datestamp = datetime.now().strftime("%Y%m%d")
        file_path = os.path.join("transcripts", f"{datestamp}_{filename}.txt")
        with open(file_path, "a") as f:
            f.write(transcription + "\n")
    except Exception as e:
        logging.error(f"Error saving transcription file: {e}")


# VectorDB integration functions
def get_vector_db(db_name):
    if db_name is not None:
        return get_vector_db(db_name)
    else:
        return get_initial_vectorstore()


@lru_cache(maxsize=None)
def get_initial_vectorstore() -> FAISS:
    try:
        init_document = Document(page_content="Your name is ScribeBot Advisor and you give wonderful and practical advice.")
        init_document_set = [init_document]
        embeddings = SentenceTransformer("all-MiniLM-L6-v2")
        vectorstore = FAISS.from_documents(init_document_set, embeddings)
        return vectorstore
    except Exception as e:
        logging.error(f"Error loading initial vectorstore: {e}")
        return None


@lru_cache(maxsize=None)
def get_vector_db(db_name) -> FAISS:
    try:
        print(f"Loading {db_name} vectorstore")
        vectorstore = FAISS.load_local(f"datastore/{db_name}", OpenAIEmbeddings(), allow_dangerous_deserialization=True)
        return vectorstore
    except Exception as e:
        print(f"Error loading {db_name} vectorstore: {e}")
        return None

def query_vector_db(vectorstore, query, k=5):
    try:
        results = vectorstore.similarity_search(query)        
        if not results:
            print("No results found for the query. /n/n")
            return []
        result_texts = []
        # Extract the text content from the results
        for doc in results:
            result_texts.append(doc.page_content)
        return result_texts
    except Exception as e:
        print(f"Error querying vectorstore: {e}")
        return []
    
# def query_vector_db(vectorstore, query, k=5):
#     try:
#         model = SentenceTransformer("all-MiniLM-L6-v2")
#         query_embedding = model.encode(query)
#         results = vectorstore.similarity_search_with_score(query_embedding, k)
#         print(results)
#         result_texts = [result[0].page_content for result in results]
#         return result_texts
#     except Exception as e:
#         print(f"Error querying vectorstore: {e}")
#         return []


# User profile functions
def get_user_list():
    filepath = "data/profiles/user_profiles.json"
    user_profiles = load_json_data(filepath)
    return user_profiles

def get_user_profile(user_id):
    filepath = "data/profiles/user_profiles.json"
    user_profiles = load_json_data(filepath)
    return user_profiles.get(
        user_id,
        "Generic user profile: A sales representative at SkyGrid with knowledge of cloud hosting solutions.",
    )

def save_user_profile(user_id, profile_data):
    filepath = "data/profiles/user_profiles.json"
    user_profiles = load_json_data(filepath)
    user_profiles[user_id] = profile_data
    save_json_data(filepath, user_profiles)


# Customer profile functions
def get_customer_list():
    filepath = "data/profiles/customer_profiles.json"
    customer_profiles = load_json_data(filepath)
    return customer_profiles

def save_customer_profile(customer_id, profile_data):
    filepath = "data/profiles/customer_profiles.json"
    customer_profiles = load_json_data(filepath)
    customer_profiles[customer_id] = profile_data
    save_json_data(filepath, customer_profiles)

def get_customer_profile(customer_id):
    filepath = "data/profiles/customer_profiles.json"
    customer_profiles = load_json_data(filepath)
    return customer_profiles.get(
        customer_id,
        "Generic customer profile: Interested in scalable and secure cloud hosting solutions for various business needs.",
    )


# Advisor profile functions
def get_advisor_list():
    filepath = "data/profiles/advisor_profiles.json"
    advisor_profiles = load_json_data(filepath)
    return advisor_profiles

def get_advisor_profile(advisor_id):
    filepath = "data/profiles/advisor_profiles.json"
    advisor_profiles = load_json_data(filepath)
    return advisor_profiles.get(
        advisor_id,
        "Generic advisor profile: An experienced jack of all trades with expertise in anything and everything.",
    )


# Conversation history functions
def get_conversation_history(userId, callerId):
    filename = f"data/conversations/{userId}_{callerId}.json"
    print(f"Getting conversation history from {filename}")
    # Ensure the directory exists
    # os.makedirs(os.path.dirname(filename), exist_ok=True)
    conversation_history = load_json_data(filename)
    return conversation_history


def collect_fine_tuning_data(conversation_id, transcription, response, feedback):
    fine_tuning_data = {
        "conversation_id": conversation_id,
        "transcription": transcription,
        "response": response,
        "feedback": feedback,
        "timestamp": datetime.now().isoformat(),
    }
    filepath = "data/fine_tuning/fine_tuning_data.json"
    fine_tuning_collection = load_json_data(filepath)
    fine_tuning_collection.append(fine_tuning_data)
    save_json_data(filepath, fine_tuning_collection)
    
def search_profiles(name):
    customer_profiles = get_customer_list()
    user_profiles = get_user_list()
    
    # Search in customer profiles
    for customer_id, customer in customer_profiles.items():
        if customer["name"].lower() == name.lower():
            return {"id": customer_id, "type": "customer"}

    # Search in user (salesperson) profiles
    for user_id, user in user_profiles.items():
        if user["name"].lower() == name.lower():
            return {"id": user_id, "type": "user"}

    return None  # If no match is found