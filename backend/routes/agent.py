

import os, json, httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/agent", tags=["Agent"])

OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
BASE = "http://localhost:8000"   # self-calls to your own FastAPI

# ── Tool definitions ────────────────────────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_players",
            "description": "Search for NBA players by name. Returns a list of matching player names.",
            "parameters": {
                "type": "object",
                "properties": {
                    "q": {"type": "string", "description": "Partial or full player name to search"},
                    "limit": {"type": "integer", "description": "Max results (default 10)", "default": 10}
                },
                "required": ["q"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_player_dashboard",
            "description": "Get a player's full career stats and season-by-season breakdown. Returns career averages (PPG, APG, RPG, FG% etc) and every season row with raw totals.",
            "parameters": {
                "type": "object",
                "properties": {
                    "player_name": {"type": "string", "description": "Full player name e.g. 'Stephen Curry'"}
                },
                "required": ["player_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_player_accolades",
            "description": "Get a player's awards and honors: MVP wins, All-NBA selections, All-Star appearances, and other awards.",
            "parameters": {
                "type": "object",
                "properties": {
                    "player_name": {"type": "string", "description": "Full player name"}
                },
                "required": ["player_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_season_percentiles",
            "description": "Get how a player ranked percentile-wise among all qualified players in a given season. Returns PPG percentile, APG percentile, FG% percentile etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "player_name": {"type": "string"},
                    "season": {"type": "integer", "description": "4-digit start year e.g. 2023 for 2023-24 season"},
                    "min_games": {"type": "integer", "default": 30}
                },
                "required": ["player_name", "season"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_season_ranks",
            "description": "Get a player's exact statistical rankings (e.g. #3 in PPG) among qualified players in a given season.",
            "parameters": {
                "type": "object",
                "properties": {
                    "player_name": {"type": "string"},
                    "season": {"type": "integer", "description": "4-digit start year e.g. 2023"},
                    "min_games": {"type": "integer", "default": 30}
                },
                "required": ["player_name", "season"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_games",
            "description": "Search for games involving a team. Returns game summaries with scores, dates, and game type.",
            "parameters": {
                "type": "object",
                "properties": {
                    "team1": {"type": "string", "description": "Team name or abbreviation (required)"},
                    "team2": {"type": "string", "description": "Opponent team name (optional)"},
                    "season": {"type": "string", "description": "Season string e.g. '2023-24'"},
                    "game_type": {"type": "string", "description": "e.g. 'Playoffs', 'Regular Season'"},
                    "limit": {"type": "integer", "default": 10}
                },
                "required": ["team1"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_game_team_stats",
            "description": "Get team-level box score for a specific game: points, rebounds, assists, shooting percentages per team.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer", "description": "Numeric game ID from search_games results"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_game_player_stats",
            "description": "Get individual player box scores for a specific game.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pbp_sequence",
            "description": "Get play-by-play score progression for a game. Useful for analyzing momentum shifts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_shot_distribution",
            "description": "Get shot distribution by court area for each team in a game.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_team_efficiency",
            "description": "Get shooting efficiency breakdown (2PT, 3PT, FT) for each team in a game.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_key_events",
            "description": "Get key defensive/offensive events (blocks, steals, assists, rebounds, turnovers) with timestamps for a game.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_scoring_runs",
            "description": "Get significant scoring runs (8+ point runs) in a game with timestamps.",
            "parameters": {
                "type": "object",
                "properties": {
                    "game_id": {"type": "integer"}
                },
                "required": ["game_id"]
            }
        }
    },
]

# ── Tool executor ────────────────────────────────────────────────────────────

async def execute_tool(name: str, args: dict) -> Any:
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            if name == "search_players":
                r = await client.get(f"{BASE}/players/search", params=args)
                return r.json()

            elif name == "get_player_dashboard":
                pn = args["player_name"]
                r = await client.get(f"{BASE}/players/{pn}/dashboard")
                data = r.json()
                # Slim down seasons to save tokens — keep last 8 seasons
                if "seasons" in data and len(data["seasons"]) > 8:
                    data["seasons"] = data["seasons"][-8:]
                return data

            elif name == "get_player_accolades":
                pn = args["player_name"]
                r = await client.get(f"{BASE}/players/{pn}/accolades")
                return r.json()

            elif name == "get_season_percentiles":
                pn = args["player_name"]
                params = {"season": args["season"], "min_games": args.get("min_games", 30)}
                r = await client.get(f"{BASE}/players/{pn}/season-percentiles", params=params)
                return r.json()

            elif name == "get_season_ranks":
                pn = args["player_name"]
                params = {"season": args["season"], "min_games": args.get("min_games", 30)}
                r = await client.get(f"{BASE}/players/{pn}/season-ranks", params=params)
                return r.json()

            elif name == "search_games":
                r = await client.get(f"{BASE}/games/search", params=args)
                data = r.json()
                # Return items array, capped at limit
                items = data.get("items", data) if isinstance(data, dict) else data
                return items[:args.get("limit", 10)]

            elif name == "get_game_team_stats":
                r = await client.get(f"{BASE}/games/{args['game_id']}/team-stats")
                return r.json()

            elif name == "get_game_player_stats":
                r = await client.get(f"{BASE}/games/{args['game_id']}/player-stats")
                data = r.json()
                # Slim to top 6 players per team by points
                for side in ["home_players", "away_players"]:
                    if side in data:
                        data[side] = sorted(data[side], key=lambda p: p.get("points", 0), reverse=True)[:6]
                return data

            elif name == "get_pbp_sequence":
                r = await client.get(f"{BASE}/game/{args['game_id']}/pbp-sequence")
                data = r.json()
                # Sample every 10th event to save tokens
                return data[::10] if isinstance(data, list) else data

            elif name == "get_shot_distribution":
                r = await client.get(f"{BASE}/game/{args['game_id']}/shot-distribution")
                return r.json()

            elif name == "get_team_efficiency":
                r = await client.get(f"{BASE}/game/{args['game_id']}/team-efficiency")
                return r.json()

            elif name == "get_key_events":
                r = await client.get(f"{BASE}/game/{args['game_id']}/key-events")
                return r.json()

            elif name == "get_scoring_runs":
                r = await client.get(f"{BASE}/game/{args['game_id']}/scoring-runs")
                return r.json()

            else:
                return {"error": f"Unknown tool: {name}"}

        except Exception as e:
            return {"error": str(e)}

# ── Request/Response models ──────────────────────────────────────────────────

class Message(BaseModel):
    role: str          # "user" | "assistant"
    content: str

class AgentRequest(BaseModel):
    messages: list[Message]

# ── Agent endpoint (streaming SSE) ──────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert NBA analyst assistant with access to a comprehensive basketball database.

You can answer questions about:
- Player career stats, season progressions, accolades, percentile rankings
- Game results, box scores, play-by-play analysis
- Team performance, shooting efficiency, scoring runs
- Comparisons between players or teams

When answering:
- Always fetch real data using your tools — never guess stats
- For comparisons, fetch both players' dashboards
- When you have numerical data worth visualizing, include a JSON chart spec at the END of your response in this exact format:
  <chart>{"type":"bar"|"line"|"radar", "title":"...", "data":[...], "keys":["key1","key2"], "xKey":"name"}</chart>
- Be concise but insightful — lead with the most interesting finding
- Format numbers cleanly: PPG not points_per_game, use decimals for averages
- When a player or game isn't found, say so clearly and suggest alternatives

For chart data format:
- bar/line: data=[{name:"label", team1: value, team2: value}], keys=["team1","team2"]  
- For single player over seasons: data=[{name:"2021", value:24.3}], keys=["value"]
"""

async def run_agent_stream(messages: list[dict]):
    """Agentic loop — streams SSE events to the client."""
    import json

    if not OPENAI_KEY:
        yield f"data: {json.dumps({'type': 'error', 'content': 'OPENAI_API_KEY not set in backend .env'})}\n\n"
        return

    conversation = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    max_iterations = 8

    async with httpx.AsyncClient(timeout=60) as client:
        for iteration in range(max_iterations):
            # Call OpenAI
            payload = {
                "model": "gpt-4o-mini",
                "messages": conversation,
                "tools": TOOLS,
                "tool_choice": "auto",
                "temperature": 0.3,
                "max_tokens": 1500,
            }

            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"},
                json=payload
            )

            if resp.status_code != 200:
                err = resp.text
                yield f"data: {json.dumps({'type': 'error', 'content': f'OpenAI error: {err}'})}\n\n"
                return

            result = resp.json()
            choice = result["choices"][0]
            msg = choice["message"]
            finish = choice["finish_reason"]

            # Add assistant message to conversation
            conversation.append(msg)

            # ── Final answer ──
            if finish == "stop" or not msg.get("tool_calls"):
                content = msg.get("content", "")
                yield f"data: {json.dumps({'type': 'answer', 'content': content})}\n\n"
                return

            # ── Tool calls ──
            if msg.get("tool_calls"):
                tool_results = []
                for tc in msg["tool_calls"]:
                    fn_name = tc["function"]["name"]
                    fn_args = json.loads(tc["function"]["arguments"])

                    # Notify frontend which tool is being called
                    yield f"data: {json.dumps({'type': 'tool_call', 'tool': fn_name, 'args': fn_args})}\n\n"

                    # Execute tool
                    result_data = await execute_tool(fn_name, fn_args)

                    # Notify frontend of result
                    yield f"data: {json.dumps({'type': 'tool_result', 'tool': fn_name, 'success': 'error' not in str(result_data)[:50]})}\n\n"

                    tool_results.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(result_data)
                    })

                conversation.extend(tool_results)

        yield f"data: {json.dumps({'type': 'error', 'content': 'Max iterations reached'})}\n\n"


@router.post("/chat")
async def agent_chat(req: AgentRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    return StreamingResponse(
        run_agent_stream(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
