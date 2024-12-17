import logging
import os
import openai
from scripts.util import prompts, setup_logging

correct_transcript_system_prompt = prompts.get("correct_transcript_system_prompt")
gpt_sales_system_prompt = prompts.get("gpt_sales_system_prompt")
gpt_sales_system_prompt_2 = prompts.get("gpt_sales_system_prompt_2")
general_system_prompt = prompts.get("general_system_prompt")
default_customer_profile = prompts.get("default_customer_profile")
default_user_profile = prompts.get("default_user_profile")
sentiment_analysis_system_prompt = prompts.get("sentiment_analysis_system_prompt")


# Set up logging
setup_logging("logs/capture_operations.log")


# Functions to interact with OpenAI API
def generate_corrected_transcript(prompt, gptVersion="gpt-3.5-turbo"):
    try:
        response = openai.chat.completions.create(
            model=gptVersion,
            temperature=0.0,
            messages=[
                {"role": "system", "content": correct_transcript_system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error getting response from ChatGPT: {e}")
        return None


def get_general_response(prompt, gptVersion="gpt-3.5-turbo"):
    try:
        response = openai.chat.completions.create(
            model=gptVersion,
            messages=[
                {"role": "system", "content": general_system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error getting response from ChatGPT: {e}")
        return None


def get_advisor_response(context, gptVersion="gpt-3.5-turbo"):
    try:
        response = openai.chat.completions.create(
            model=gptVersion,
            messages=context,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting response from ChatGPT: {e}")
        return None


def analyze_sentiment(transcription, gptVersion="gpt-3.5-turbo"):
    try:
        response = openai.chat.completions.create(
            model=gptVersion,
            messages=[
                {
                    "role": "system",
                    "content": sentiment_analysis_system_prompt,
                },
                {"role": "user", "content": transcription},
            ],
        )
        return float(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Error analyzing sentiment: {e}")
        return 0  # Neutral sentiment as fallback
    


def dynamic_prepare_context(
    conversation_history, transcription, role_transcript, relevant_info, customer_profile, user_profile
):
    context = [
        {
            "role": "system",
            "content": gpt_sales_system_prompt,
        },
        {
            "role": "system",
            "content": gpt_sales_system_prompt_2,
        },
        {"role": "system", "content": " ".join(relevant_info) if relevant_info else ""},
    ]

    if customer_profile:
        context.append({"role": "system", "content": customer_profile})
    else:
        context.append({"role": "system", "content": default_customer_profile})

    if user_profile:
        context.append({"role": "system", "content": user_profile})
    else:
        context.append({"role": "system", "content": default_user_profile})

    context.extend(conversation_history if conversation_history else [])

    if role_transcript == 'user':
        context.append({"role": "user", "content": f"Salesperson: {transcription if transcription else ''}"})
    else:
        context.append({"role": "user", "content": f"Customer: {transcription if transcription else ''}"})

    return context
