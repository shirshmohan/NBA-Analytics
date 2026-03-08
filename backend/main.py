from fastapi import FastAPI
from routes.game_search import router as search_router
from routes.game_stats import router as game_details_router
from routes.player_dashboard import router as player_router
from routes.pbp_team import router as team_router
from routes.pbp_player import router as player_pbp_router
from routes.agent import router as agent_router

from fastapi.middleware.cors import CORSMiddleware




app = FastAPI(title="NBA Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
@app.get("/")
async def root():
    return {"message": "NBA API is running with DuckDB and Parquet"}


app.include_router(search_router)
app.include_router(game_details_router)
app.include_router(player_router)
app.include_router(team_router)    
app.include_router(player_pbp_router)
app.include_router(agent_router)

