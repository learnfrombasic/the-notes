import os
from huggingface_hub import login
from dotenv import load_dotenv
from utils.logging_config import setup_logger

load_dotenv()
logger = setup_logger(name="[TheNotes]")


def hf_login(token: str = None):
    """Logs in to Hugging Face Hub using a token."""
    token = token or os.getenv("HF_TOKEN")

    if not token:
        logger.error("Hugging Face token is missing. Please set HF_TOKEN.")
        raise ValueError("HF_TOKEN is required for authentication.")

    try:
        login(token=token, add_to_git_credential=True)
        logger.info("Login to Hugging Face Hub successful 🎉")
        return True
    except Exception as e:
        logger.exception("Failed to login to Hugging Face Hub")
        raise e
