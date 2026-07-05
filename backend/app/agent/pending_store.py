"""
In-memory pending action store.
Keyed by user_id. Holds the state of a confirmed-but-not-yet-executed action.

Example pending booking entry:
{
    "type": "booking",
    "doctor_id": 3,
    "availability_id": 7,
    "doctor_name": "Dr. Arun Kumar",
    "date": "2026-07-05",
    "start_time": "10:00:00",
    "end_time": "11:00:00"
}
"""
from typing import Optional, Dict, Any

# {user_id: action_dict}
_store: Dict[int, Dict[str, Any]] = {}


def set_pending(user_id: int, action: Dict[str, Any]) -> None:
    _store[user_id] = action


def get_pending(user_id: int) -> Optional[Dict[str, Any]]:
    return _store.get(user_id)


def clear_pending(user_id: int) -> None:
    _store.pop(user_id, None)


# Confirmation keywords — matched against the entire lowercased message
CONFIRMATION_WORDS = {
    "yes", "ok", "okay", "sure", "confirm", "confirmed", "book",
    "proceed", "go", "go ahead", "do it", "yep", "yeah", "please",
    "agreed", "correct", "right", "absolutely", "fine", "of course",
    "sounds good", "let's do it", "book it", "confirm it"
}


def is_confirmation(message: str) -> bool:
    """Returns True if the message is a simple booking confirmation."""
    lowered = message.lower().strip().rstrip("!.")
    # Check whole message match first
    if lowered in CONFIRMATION_WORDS:
        return True
    # Check if any single word in the message is a confirmation keyword
    words = set(lowered.split())
    return bool(words & CONFIRMATION_WORDS)
