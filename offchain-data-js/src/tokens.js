/**
 * Off-Chain Media — Design Tokens
 * Single source of truth for all visual constants.
 * Never hardcode colors or fonts elsewhere.
 */
export const T = {
  accent:  '#F7931A',               // Bitcoin orange — fixed, never substituted
  ink:     '#1a1a1a',               // near-black
  paper:   '#FAF7F1',               // warm paper background
  muted:   'rgba(128,128,128,0.5)', // secondary text
  grid:    'rgba(128,128,128,0.12)',// chart grid lines
  heading: "'Oswald', 'Arial Narrow', sans-serif",
  body:    "'Spectral', Georgia, serif",
};

// Period → number of data points to slice
export const PERIOD_N = {
  '1D':  24,
  '1W':  7,
  '1M':  30,
  '3M':  90,
  '1Y':  365,
  'ALL': 730,
};
