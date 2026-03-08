import type {
  PlayerSearchResult,
  PlayerDashboard,
  PlayerAccolades,
  SeasonPercentiles,
  SeasonRanks,
} from '@/types'

export const mockPlayerSearch: PlayerSearchResult[] = [
  { player: 'LeBron James' },
  { player: 'Stephen Curry' },
  { player: 'Joel Embiid' },
  { player: 'Luka Doncic' },
  { player: 'Giannis Antetokounmpo' },
  { player: 'Kevin Durant' },
  { player: 'Jayson Tatum' },
  { player: 'Ja Morant' },
  { player: 'Anthony Davis' },
  { player: 'Nikola Jokic' },
]

export const mockPlayerDashboard: PlayerDashboard = {
  player: 'LeBron James',
  career: {
    player: 'LeBron James',
    person_id: 2544,
    career_g: 1487,
    avg_mp_per_season: 2850,
    mpg: 38.1,
    career_pts: 40278, career_ast: 11010, career_trb: 11147,
    career_stl: 2383, career_blk: 1190, career_tov: 5219, career_pf: 2710,
    ppg: 27.1, apg: 7.4, rpg: 7.5, spg: 1.6, bpg: 0.8,
    fg_pct: 0.504, x3p_pct: 0.345, ft_pct: 0.734, efg_pct: 0.549,
  },
  seasons: [
    { season: '2003-04', team: 'CLE', pos: 'SF', g: 79, mp: 3122, fg: 622, fga: 1492, fg_percent: 0.417, x3p: 63, x3pa: 217, x3p_percent: 0.290, x2p: 559, x2pa: 1275, x2p_percent: 0.438, e_fg_percent: 0.438, ft: 347, fta: 460, ft_percent: 0.754, orb: 99, drb: 333, trb: 432, ast: 465, stl: 130, blk: 58, tov: 273, pf: 149, pts: 1654, trp_dbl: 5, person_id: 2544 },
    { season: '2004-05', team: 'CLE', pos: 'SF', g: 80, mp: 3388, fg: 795, fga: 1657, fg_percent: 0.480, x3p: 108, x3pa: 308, x3p_percent: 0.351, x2p: 687, x2pa: 1349, x2p_percent: 0.509, e_fg_percent: 0.513, ft: 477, fta: 636, ft_percent: 0.750, orb: 111, drb: 477, trb: 588, ast: 577, stl: 177, blk: 66, tov: 262, pf: 163, pts: 2175, trp_dbl: 13, person_id: 2544 },
    { season: '2022-23', team: 'LAL', pos: 'SF', g: 55, mp: 1941, fg: 556, fga: 1030, fg_percent: 0.540, x3p: 100, x3pa: 244, x3p_percent: 0.410, x2p: 456, x2pa: 786, x2p_percent: 0.580, e_fg_percent: 0.588, ft: 284, fta: 375, ft_percent: 0.757, orb: 78, drb: 324, trb: 402, ast: 456, stl: 72, blk: 26, tov: 192, pf: 74, pts: 1496, trp_dbl: 21, person_id: 2544 },
    { season: '2023-24', team: 'LAL', pos: 'SF', g: 71, mp: 2509, fg: 672, fga: 1333, fg_percent: 0.504, x3p: 131, x3pa: 348, x3p_percent: 0.376, x2p: 541, x2pa: 985, x2p_percent: 0.549, e_fg_percent: 0.553, ft: 339, fta: 441, ft_percent: 0.769, orb: 77, drb: 445, trb: 522, ast: 587, stl: 93, blk: 39, tov: 249, pf: 104, pts: 1814, trp_dbl: 25, person_id: 2544 },
  ],
}

export const mockPlayerAccolades: PlayerAccolades = {
  player: 'LeBron James',
  person_id: 2544,
  mvp: [
    { season_start: 2009, team: 'CLE', ppg: 29.7, apg: 8.6, trb: 7.3, ts_pct: 0.591, per: 31.7, ws: 20.3, vorp: 9.9 },
    { season_start: 2010, team: 'MIA', ppg: 26.7, apg: 7.0, trb: 7.5, ts_pct: 0.605, per: 29.3, ws: 16.2, vorp: 8.6 },
    { season_start: 2012, team: 'MIA', ppg: 26.8, apg: 7.3, trb: 8.0, ts_pct: 0.655, per: 31.0, ws: 19.3, vorp: 10.1 },
    { season_start: 2013, team: 'MIA', ppg: 27.1, apg: 6.3, trb: 6.9, ts_pct: 0.649, per: 30.3, ws: 18.7, vorp: 9.3 },
  ],
  all_nba: [
    { season_start: 2005, all_team: 'All-NBA Second Team', team: 'CLE' },
    { season_start: 2006, all_team: 'All-NBA First Team', team: 'CLE' },
    { season_start: 2023, all_team: 'All-NBA First Team', team: 'LAL' },
  ],
  all_star: [
    { season_start: 2005 }, { season_start: 2006 }, { season_start: 2007 },
    { season_start: 2008 }, { season_start: 2009 }, { season_start: 2010 },
    { season_start: 2011 }, { season_start: 2012 }, { season_start: 2013 },
    { season_start: 2014 }, { season_start: 2015 }, { season_start: 2016 },
    { season_start: 2017 }, { season_start: 2018 }, { season_start: 2019 },
    { season_start: 2020 }, { season_start: 2021 }, { season_start: 2022 },
    { season_start: 2023 },
  ],
  awards: [
    { season: '2003-04', award: 'Rookie of the Year' },
    { season: '2012-13', award: 'Finals MVP' },
    { season: '2015-16', award: 'Finals MVP' },
  ],
}

export const mockSeasonPercentiles: SeasonPercentiles = {
  player: 'LeBron James',
  person_id: 2544,
  season: '2023-24',
  g: 71,
  pool_size: 320,
  ppg: 25.7, apg: 8.3, rpg: 7.3, spg: 1.3, bpg: 0.5, mpg: 35.3,
  fta: 441, trp_dbl: 25, tov_pg: 3.5,
  fg_pct: 0.504, x3p_pct: 0.376, ft_pct: 0.769, efg_pct: 0.553,
  ppg_percentile: 97.2, apg_percentile: 95.8, rpg_percentile: 89.4,
  spg_percentile: 82.1, bpg_percentile: 61.3, mpg_percentile: 91.7,
  fg_percentile: 78.4, x3p_percentile: 72.1, ft_percentile: 68.9, efg_percentile: 81.2,
  fta_percentile: 94.3, trp_dbl_percentile: 98.1, tov_percentile_better: 31.2,
}

export const mockSeasonRanks: SeasonRanks = {
  player: 'LeBron James',
  person_id: 2544,
  season: '2023-24',
  g: 71,
  pool_size: 320,
  ppg: 25.7, apg: 8.3, spg: 1.3, mpg: 35.3,
  ppg_rank: 9, apg_rank: 4, spg_rank: 28, mpg_rank: 12,
  avg_ppg_pool: 14.2, avg_apg_pool: 3.1, avg_spg_pool: 0.9, avg_mpg_pool: 28.4,
}
