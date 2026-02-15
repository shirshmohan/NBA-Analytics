from sqlalchemy import text
from database import engine

nba_query = text("""
SELECT 
    p.first_name, 
    p.last_name,
    COUNT(pgs.game_id) as games_played,
    ROUND(AVG(pgs.points), 2) as ppg_average
FROM player_game_stats pgs
JOIN players p ON pgs.person_id = p.person_id
JOIN games g ON pgs.game_id = g.game_id
WHERE p.first_name = 'Stephen' 
  AND p.last_name = 'Curry'
  AND g.game_type = 'Regular Season'
  AND pgs.num_minutes > 0
  AND g.game_datetime >= '2022-10-18' 
  AND g.game_datetime <= '2023-04-10'
GROUP BY p.first_name, p.last_name;
""")

def run_test():
    try:
        # 1. Connect to the engine
        with engine.connect() as connection:
            print("--- Executing NBA Query ---")
            
            # 2. Execute the query
            result = connection.execute(nba_query)
            
            # 3. Fetch and print the results
            for row in result:
                print({row})
                print(f"Player: {row.first_name} {row.last_name}")
                print(f"Games Played: {row.games_played}")
                print(f"PPG Average: {row.ppg_average}")
                
    except Exception as e:
        print(f"Query failed: {e}")

if __name__ == "__main__":
    run_test()