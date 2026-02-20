# main.py
from fastapi import FastAPI
from routes.game_search import router as search_router
from routes.game_stats import router as game_details_router
from routes.player_dashboard import router as player_router


app = FastAPI(title="NBA Finder API")


app.include_router(search_router)
app.include_router(game_details_router)
app.include_router(player_router)
