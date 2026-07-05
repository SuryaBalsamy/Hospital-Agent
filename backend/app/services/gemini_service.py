import google.generativeai as genai
from app.config import GEMINI_API_KEY
from app.agent.tools import GEMINI_TOOLS
from app.agent.executor import ToolExecutor
from app.models.models import ChatHistory
import logging
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

def get_system_instruction() -> str:
    from datetime import date
    today_str = date.today().strftime("%Y-%m-%d")
    return f"""
You are Antigravity Hospital's AI Assistant. You are a polite, professional, and intelligent hospital orchestrator.
Your goal is to help patients using ONLY the tools provided to you.
The current date is {today_str}.

STRICT RULES:
1. NEVER invent or guess hospital information (doctors, departments, locations, slots). Always use the provided tools.
2. For symptom-related questions, ALWAYS call find_department_by_symptoms first, then find_doctors_by_department.
3. BOOKING WORKFLOW (follow this exactly):
   a. Call check_doctor_availability to get valid slots.
   b. Present the available slots to the user clearly.
   c. Once the user selects a slot, call prepare_booking(doctor_id, availability_id).
   d. prepare_booking will return confirmation details. Relay these to the user and ask:
      "Would you like me to confirm this appointment? Just reply Yes to confirm."
   e. DO NOT call any booking function again. The backend will handle the actual booking on confirmation.
4. When a tool returns an error, explain it naturally and suggest alternatives.
5. Be concise, warm, and professional.
6. Never mention tool names or function calls to the user.
"""


def _get_function_calls(response):
    """Extract all function_call parts from a response. Returns list of Parts with function_call."""
    calls = []
    if not response.candidates:
        return calls
    for part in response.candidates[0].content.parts:
        if part.function_call and part.function_call.name:
            calls.append(part)
    return calls


def _get_text(response):
    """Safely extract text from a response that may contain function calls."""
    if not response.candidates:
        return ""
    text_parts = []
    for part in response.candidates[0].content.parts:
        if part.text:
            text_parts.append(part.text)
    return "".join(text_parts)


class GeminiService:
    def __init__(self):
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. AI features will fail.")
            self.model = None
        else:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(
                model_name="gemini-flash-latest",
                tools=GEMINI_TOOLS,
                system_instruction=get_system_instruction()
            )

    def generate_chat_response(self, message: str, user_id: int, db: Session) -> str:
        try:
            if not self.model:
                return "Error: GEMINI_API_KEY is not configured on the server."

            # Fetch last 10 turns of history from DB for context
            history_records = (
                db.query(ChatHistory)
                .filter(ChatHistory.user_id == user_id)
                .order_by(ChatHistory.created_at)
                .all()
            )
            history = []
            for record in history_records[-10:]:
                history.append({"role": "user", "parts": [record.user_message]})
                history.append({"role": "model", "parts": [record.ai_response]})

            chat = self.model.start_chat(history=history)
            executor = ToolExecutor(db, user_id)

            # --- Turn 1: send user message ---
            response = chat.send_message(message)

            # --- Tool Execution Loop ---
            max_iterations = 6
            iteration = 0

            while True:
                function_calls = _get_function_calls(response)

                if not function_calls:
                    # No tool calls — this is the final text response
                    break

                if iteration >= max_iterations:
                    logger.warning("Max tool iterations reached.")
                    break

                iteration += 1

                # Build function response parts for ALL calls in this turn
                function_response_parts = []
                for part in function_calls:
                    fc = part.function_call
                    tool_name = fc.name
                    args = dict(fc.args)
                    logger.info(f"[AI Tool] Calling: {tool_name}({args})")

                    tool_result = executor.execute_tool(tool_name, args)
                    print(f"DEBUG_TOOL_CALL: {tool_name}({args}) -> {tool_result}")
                    logger.info(f"[AI Tool] Result: {tool_result[:200]}")

                    function_response_parts.append(
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=tool_name,
                                response={"result": tool_result}
                            )
                        )
                    )

                # Send all function responses back together
                response = chat.send_message(function_response_parts)

            # Extract the final text safely
            print(f"DEBUG_RESPONSE_CANDIDATES: {response.candidates}")
            final_response = _get_text(response)
            if not final_response:
                final_response = "I processed your request, but couldn't generate a text response. Please try again."

            # Persist to chat_history
            new_history = ChatHistory(
                user_id=user_id,
                user_message=message,
                ai_response=final_response
            )
            db.add(new_history)
            db.commit()

            return final_response

        except Exception as e:
            import traceback
            err_str = str(e)
            tb_str = traceback.format_exc()
            logger.error(f"Gemini Service Error: {err_str}\nTraceback:\n{tb_str}")
            # Temporarily return the real error message for debugging
            return f"DEBUG_ERROR: {err_str}"


# Singleton instance
gemini_service = GeminiService()
