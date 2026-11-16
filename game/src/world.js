import { LIVES, W, H } from './config.js';
export const EVENT_RING = 'ring';
export const EVENT_HIT = 'hit';
export const EVENT_OVER = 'over';
export const EVENT_WIN = 'win';

export function createWorld(rand){
  const state = {
    score: 0, lives: LIVES, level: 1, rings: 0, ringsNeeded: 5,
    player: { x: 120, y: H/2, vx: 0, vy: 0, r: 16 },
    obstacles: [], pickups: [], ringsList: [],
    time: 0, invuln: 0, wind: 0, over: false, won: false
  };
  function spawnRing(){
    const y = 60 + rand() * (H-120);
    state.ringsList.push({ x: W+40, y, r: 42, passed:false });
  }
  function spawnObstacle(){
    const y = rand() * H;
    const w = 60 + rand()*40;
    const h = 28 + rand()*28;
    state.obstacles.push({ x: W+60, y, w, h, speed: 120 + rand()*60 + state.level*8 });
  }
  function spawnPickup(){
    const y = 40 + rand()*(H-80);
    state.pickups.push({ x: W+40, y, r: 10, kind:'fuel' });
  }
  function reset(){
    state.score=0; state.lives=LIVES; state.level=1; state.rings=0;
    state.player.x=120; state.player.y=H/2; state.player.vx=0; state.player.vy=0;
    state.obstacles.length=0; state.pickups.length=0; state.ringsList.length=0;
    state.time=0; state.invuln=0; state.over=false; state.won=false;
    for(let i=0;i<3;i++) spawnRing();
    for(let i=0;i<3;i++) spawnObstacle();
    spawnPickup();
  }
  function step(dt, input){
    if(state.over || state.won) return [];
    const events=[];
    state.time+=dt;
    if(state.invuln>0) state.invuln-=dt;
    const p=state.player;
    const accel=900;
    if(input.up) p.vy -= accel*dt;
    if(input.down) p.vy += accel*dt;
    if(input.left) p.vx -= accel*dt;
    if(input.right) p.vx += accel*dt;
    // lagos wind gust
    state.wind = Math.sin(state.time*1.7)*60;
    p.vy += state.wind*dt;
    p.vx *= 0.96; p.vy *= 0.96;
    p.vx = Math.max(-260, Math.min(260, p.vx));
    p.vy = Math.max(-260, Math.min(260, p.vy));
    p.x += p.vx*dt; p.y += p.vy*dt;
    p.x = Math.max(p.r, Math.min(W-p.r, p.x));
    p.y = Math.max(p.r, Math.min(H-p.r, p.y));
    // move world
    const scroll = 140 + state.level*10;
    for(const o of state.obstacles){ o.x -= (scroll+o.speed)*dt; }
    for(const pk of state.pickups){ pk.x -= scroll*dt; }
    for(const r of state.ringsList){ r.x -= scroll*dt; }
    // spawn
    if(Math.random() < dt*0.6) spawnObstacle();
    if(Math.random() < dt*0.25) spawnRing();
    if(Math.random() < dt*0.15) spawnPickup();
    // rings pass
    for(const r of state.ringsList){
      if(r.passed) continue;
      if(p.x > r.x + r.r){
        const dy = Math.abs(p.y - r.y);
        if(dy < r.r){
          r.passed=true; state.rings++; state.score+=100; events.push({type:EVENT_RING});
          if(state.rings >= state.ringsNeeded){
            if(state.level>=3){ state.won=true; state.score+=500; events.push({type:EVENT_WIN}); }
            else { state.level++; state.rings=0; state.ringsNeeded=5+state.level*2; }
          }
        }
      }
    }
    // pickups
    for(let i=state.pickups.length-1;i>=0;i--){
      const pk=state.pickups[i];
      const dx=p.x-pk.x, dy=p.y-pk.y;
      if(dx*dx+dy*dy < (p.r+pk.r)*(p.r+pk.r)){
        state.score+=25; state.pickups.splice(i,1); events.push({type:'fuel'});
      }
    }
    // obstacles hit
    if(state.invuln<=0){
      for(const o of state.obstacles){
        if(p.x+ p.r > o.x && p.x - p.r < o.x+o.w && p.y+ p.r > o.y && p.y - p.r < o.y+o.h){
          state.lives--; state.invuln=1.2; state.score=Math.max(0,state.score-50);
          events.push({type:EVENT_HIT});
          if(state.lives<=0){ state.over=true; events.push({type:EVENT_OVER}); }
          break;
        }
      }
    }
    // cleanup
    state.obstacles = state.obstacles.filter(o=>o.x+o.w>-80);
    state.pickups = state.pickups.filter(pk=>pk.x>-40);
    state.ringsList = state.ringsList.filter(r=>r.x>-60);
    return events;
  }
  return { state, reset, step };
}
