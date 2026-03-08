# NBA Analytics Platform

A full-stack basketball analytics dashboard that lets you explore NBA player stats, game breakdowns, play-by-play data, and now talk to an AI agent about all of it. Built because spreadsheets are boring and basketball is not.

---

## What this actually is

You know how ESPN shows you a player's PPG and calls it analysis? This is not that.

This project pulls real NBA data through a FastAPI backend, visualizes it with interactive charts, renders a 3D basketball arena on the homepage for absolutely no practical reason, and has an AI agent you can ask questions like "how does Nikola Jokic perform in the fourth quarter compared to his overall stats" and it will go figure it out instead of making something up.

---

## The stack, explained honestly

**Frontend**
React 18 with TypeScript, because if you're going to spend three days debugging something it should at least tell you which line is wrong. Vite for builds because waiting is a crime. TailwindCSS for styling because writing CSS by hand in 2024 is a lifestyle choice. Recharts for data visualization. Three.js for the 3D arena that everyone will spend thirty seconds staring at and then never think about again.

**Backend**
FastAPI because it's fast and the automatic docs page at /docs has saved this project multiple times. SQLAlchemy for the main game and player tables. DuckDB for play-by-play parquet files because querying 500,000 rows of play-by-play data with Pandas was a humbling experience. PostgreSQL for the actual data.

**The AI agent**
GPT-4o mini with function calling. It has access to every single API endpoint as a tool. You ask it a question, it decides which endpoints to call, calls them against your live database, gets the real numbers, and gives you an actual answer. It shows you which tools it's running in real time so you can watch it work. Streaming SSE so the response feels alive instead of appearing all at once after a ten second pause.

---

## Pages

**Home** — The 3D arena. There's a bouncing ball. There are floating orbs. It serves no analytical purpose and it stays.

**Players** — Search any NBA player. Get their full career breakdown across five tabs: career overview with accolades, season-by-season stats table, progression charts, percentile rankings against their peers, and league-wide stat ranks. The percentile tab will tell you things like "Stephen Curry was in the 99th percentile for 3P% in 2015-16" which is technically information you already knew but feels more real when there's a chart.

**Games** — Search games by team matchup, season, and game type. Click any game and get a full breakdown: team box scores, individual player stats, score timeline showing every lead change, shooting efficiency by zone, key defensive events, and scoring runs. The shot zone chart will show you which areas a team lives and dies by.

**Compare** — Two players side by side. Career stats, season progressions, percentile radar charts. Useful for settling arguments.

**Agent** — Chat interface connected to GPT-4o mini. Ask it anything about players or games and it fetches real data to answer. You can watch it call tools live. It generates inline charts when the answer is better shown visually than described.

---

## Setup

You will need Python 3.10+, Node 18+, PostgreSQL, and an OpenAI API key. The parquet play-by-play files need to live somewhere your backend can reach them — update the path in the DuckDB routes if yours are somewhere different.

**Backend**

```
cd backend
pip install -r requirements.txt
```

Create a .env file:

```
DATABASE_URL=postgresql://user:password@localhost/nba
OPENAI_API_KEY=sk-your-key-here
```

Start it:

```
uvicorn main:app --reload
```

Your API is now at localhost:8000. Go to localhost:8000/docs and you'll see every single endpoint documented automatically. This page is your friend.

**Frontend**

```
cd frontend
npm install
```

Create a .env file:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

Start it:

```
npm run dev
```

Your app is now at localhost:5173.

---

## The file structure, for people who like to know where things live

```
frontend/src/
    pages/          one file per page, each one is a full route
    components/     reusable UI pieces
        players/    player dashboard view and its sub-components
        games/      game detail view and its sub-components
        charts/     pure visualization components, they only draw things
        ui/         generic building blocks, tabs, tables, dropdowns
        layout/     navbar, search overlay, settings drawer
    api/
        client.ts       the base fetch wrapper
        endpoints/      raw async functions that call specific URLs
        hooks/          react query wrappers that components actually use
    types/          typescript definitions for every API response shape
    utils/          formatting helpers and data adapters
    three/          the entire 3D arena, self-contained

backend/
    main.py         app setup and router registration
    routes/
        game_search.py      /games/search and filters
        game_stats.py       /games/{id}/team-stats and player-stats
        player_dashboard.py /players/{name}/dashboard and accolades
        pbp_team.py         /game/{id}/pbp-sequence, shot-distribution, etc
        pbp_player.py       /player/{id}/... player-level parquet queries
        agent.py            /agent/chat — the OpenAI agentic loop
```

---

## The agent in more detail

When you send a message to the agent, here is what actually happens:

1. Your message goes to POST /agent/chat on the FastAPI backend
2. The backend sends it to GPT-4o mini along with definitions of all 13 API tools
3. GPT decides which tools to call and with what arguments
4. The backend executes those calls against your actual database
5. The results go back to GPT
6. GPT decides if it needs more data or if it has enough to answer
7. Steps 3-6 repeat up to 8 times
8. The final answer streams back to your browser via Server-Sent Events
9. If the data is visual, the agent includes a chart spec that the frontend renders inline

The frontend shows you each tool call as it happens. You can watch it think.

Tools available to the agent: search players, get player dashboard, get player accolades, get season percentiles, get season ranks, search games, get game team stats, get game player stats, get play-by-play sequence, get shot distribution, get team efficiency, get key events, get scoring runs.

---

## Things worth knowing

The season year format matters. The backend uses the start year of a season — so 2023-24 is season 2023, not 2024. The frontend handles this conversion but if you're hitting the API directly, keep it in mind.

The play-by-play features require parquet files. The game search and player stats work fine without them. If you click into a game and the PBP tabs show an error, that game's parquet file either doesn't exist or the path is wrong.

The mock data toggle exists in settings and in localStorage. If the app seems to be showing fake data, check that VITE_USE_MOCKS is false in your .env and that you haven't toggled it on in the settings drawer.

Two teams cannot both be orange. The team color system resolves colors by tricode, full name, partial name match, and then a hash-based fallback that guarantees any two unknown teams get visually distinct colors.

---

## The data behind all of this

Before any of the frontend existed, before the first API route was written, someone spent 2 to 3 weeks in a continuous grind building the entire database this project runs on.

That means sourcing raw NBA data, figuring out what shape it needed to be in, writing the preprocessing pipelines, and loading everything into PostgreSQL with the right schema so that queries across players, seasons, teams, and games would actually be fast. The player stats tables, the game records, the season aggregations, the accolade data — all of it designed and built by hand.

Then separately, the play-by-play data. Every significant game broken down event by event — every shot, every foul, every substitution — converted into parquet files and queryable through DuckDB. This is what powers the score timeline, the shot distribution charts, the key events tracker, and the scoring runs analysis. It is also what took the longest to get right. The queries against half a million rows of play-by-play data went through several iterations before they were fast enough to feel like a live app rather than a loading screen.

The entire dataset is published on Kaggle if you want to use it for your own projects.

---

## What's next

The similarity engine. The plan is to compute a feature vector for every player season using their stats and percentile rankings, then run cosine similarity or KNN across the whole database to find the closest matches. The end result is a page where you type in a player and a season and get back the most statistically similar players in NBA history with a visual breakdown of why. Once it's built it becomes another tool the agent can call, so you'll be able to ask "find me a player from the 90s who played like peak Luka" and get a real answer instead of a guess.

Draft analytics is another direction worth exploring. If the play-by-play data covers recent drafts there's an interesting story to tell about which players outperformed or underperformed their draft position in their first three seasons.

Advanced lineup analysis — which five-man units perform best together, net rating by lineup, how a team's efficiency changes when their best player sits. The data to do this already exists in the parquet files, it just hasn't been surfaced yet.

The agent could also get memory. Right now every conversation starts from scratch. A simple session context that carries forward what you've already looked at — "earlier you mentioned Curry's 2015-16 season, how does that compare to his 2018-19" — would make it feel significantly more like a real analyst and less like a very knowledgeable stranger you keep introducing yourself to.

The compare page needs the same percentile-gating fix that was applied to the player dashboard. It works for most players but breaks on retired players where certain season years don't have percentile data. Small fix, just hasn't happened yet.

---

## Credits

The database and all the preprocessing work behind it took 2 to 3 weeks of uninterrupted work to build correctly. That is the part nobody sees but the part everything else depends on.

The three.js arena took longer to light correctly than any other part of the frontend. The AI agent genuinely impresses people who don't know how it works and that is enough.
