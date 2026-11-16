# Lagos Ascent strategy

Original side-scrolling kite game. One seeded RNG (mulberry-style) drives spawns
so runs are reproducible. Fixed 60Hz step, render on rAF. 3 lives, ring gates per
level (5/7/8), obstacles are danfo buses, pickups are fuel. Wind is sinusoidal
with time so it is deterministic by seed. All rendering is Canvas 2D, no build
step, no network calls in play.
