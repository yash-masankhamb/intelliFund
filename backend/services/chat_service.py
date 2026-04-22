import os
import json
import logging
from typing import Any, List, Dict, Optional
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

from backend.services.recommendation_engine import recommend_funds
from backend.services.market_service import get_market_insights
from backend.services.csv_reader import read_valid_funds

# Load backend environment variables
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"  # Updated to supported Llama 3.1 model
        self.history: Dict[str, List[Dict[str, str]]] = {}
        self.max_history = 10
        logger.info(f"ChatService initialized with model: {self.model}")
        
        self.csv_path = Path(__file__).resolve().parents[2] / "backendPipeline" / "data" / "valid_funds.csv"

    def _get_funds(self):
        try:
            return read_valid_funds(self.csv_path)
        except Exception as e:
            logger.error(f"Error reading funds CSV: {e}")
            return []

    def _get_history(self, user_id: str) -> List[Dict[str, str]]:
        if user_id not in self.history:
            self.history[user_id] = [
                {"role": "system", "content": "You are a professional financial assistant for IntelliFund. You have access to tools for fund recommendations and market insights. Use these tools whenever appropriate to provide accurate data.\n\nCRITICAL: Do NOT output function calls or tool requests as text (e.g., avoid <function=...>). Use the built-in tool-calling feature instead.\n\nResponse Formatting:\n- Use **Markdown** for all text responses.\n- Use **bolding** for key terms and fund names.\n- Use **bullet points** or **numbered lists** to break down information.\n- Avoid dense paragraphs; keep summaries concise and actionable.\n- Use ### headings to separate distinct sections of your advice."}
            ]
        return self.history[user_id]

    def _add_to_history(self, user_id: str, role: str, content: str):
        history = self._get_history(user_id)
        history.append({"role": role, "content": content})
        if len(history) > self.max_history + 1:  # +1 for system prompt
            self.history[user_id] = [history[0]] + history[-(self.max_history):]

    def get_response(self, message: str, user_id: str = "default") -> Dict[str, Any]:
        try:
            self._add_to_history(user_id, "user", message)
            
            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "get_recommendations",
                        "description": "Get mutual fund recommendations based on user's risk profile and goals.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "risk_level": {"type": "string", "enum": ["low", "medium", "high"], "description": "The user's risk tolerance."},
                                "investment_goal": {"type": "string", "description": "What the user wants to achieve (e.g., retirement, wealth creation)."},
                                "time_horizon": {"type": "integer", "description": "Investment duration in years."},
                                "monthly_investment": {"type": "number", "description": "Amount to invest monthly in INR."}
                            },
                            "required": ["risk_level", "investment_goal", "time_horizon", "monthly_investment"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "get_market_insights",
                        "description": "Get current market sentiment and insights for a given index.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "symbol": {"type": "string", "description": "Market index symbol, e.g., ^NSEI for Nifty 50."}
                            },
                            "required": ["symbol"]
                        }
                    }
                }
            ]

            # Initial LLM Call
            response = self.client.chat.completions.create(
                model=self.model,
                messages=self._get_history(user_id),
                tools=tools,
                tool_choice="auto"
            )

            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls
            
            final_data = None
            response_type = "text"

            if tool_calls:
                # Add assistant message with tool calls to history
                self._get_history(user_id).append(response_message)
                
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    logger.info(f"Tool Triggered: {function_name} with args: {function_args}")
                    
                    tool_result = None
                    if function_name == "get_recommendations":
                        funds = self._get_funds()
                        recs, reasoning = recommend_funds(
                            funds=funds,
                            risk_level=function_args.get("risk_level"),
                            investment_goal=function_args.get("investment_goal"),
                            time_horizon=function_args.get("time_horizon"),
                            monthly_investment=function_args.get("monthly_investment")
                        )
                        tool_result = {"recommended_funds": recs, "reasoning": reasoning}
                        final_data = tool_result
                        response_type = "recommendation"
                    
                    elif function_name == "get_market_insights":
                        funds = self._get_funds()
                        tool_result = get_market_insights(funds=funds, symbol=function_args.get("symbol", "^NSEI"))
                        final_data = tool_result
                        response_type = "market"
                    
                    if tool_result:
                        # Append tool result to history
                        self._get_history(user_id).append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(tool_result),
                        })

                # Second LLM Call to get natural language response after tool execution
                second_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=self._get_history(user_id)
                )
                final_reply = second_response.choices[0].message.content
                self._add_to_history(user_id, "assistant", final_reply)
                
                return {
                    "reply": final_reply,
                    "response": final_reply,
                    "data": final_data,
                    "type": response_type
                }

            # If no tool was called
            reply = response_message.content
            self._add_to_history(user_id, "assistant", reply)
            return {
                "reply": reply,
                "response": reply,
                "data": None,
                "type": "text"
            }

        except Exception as e:
            logger.error(f"Error in ChatService ({self.model}): {e}")
            # Fallback mechanism: Return a basic text response instead of crashing
            fallback_msg = "I'm currently experiencing some technical difficulties, but I can still help you with general investment inquiries. Please try again or ask a simpler question."
            return {
                "reply": fallback_msg,
                "response": fallback_msg,
                "data": None,
                "type": "text"
            }

chat_service = ChatService()
