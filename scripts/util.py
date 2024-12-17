import os
import json
import logging


def save_json_data(filepath, data):
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logging.error(f"Error saving JSON data: {e}")


def load_json_data(filepath):
    try:
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                return json.load(f)
        else:
            return {}
    except Exception as e:
        logging.error(f"Error loading JSON data: {e}")
        return {}


def get_absolute_path(relative_path):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, relative_path)


def setup_logging(logfile):
    logging.basicConfig(filename=logfile, level=logging.INFO)


def load_prompts(file_name="prompts.json"):
    try:
        # Construct the path to the prompts file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "..", "config", file_name)

        # Open and load the JSON file
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading prompts: {e}")
        return {}


# Load prompts when the module is imported
prompts = load_prompts()
