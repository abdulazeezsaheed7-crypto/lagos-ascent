import { W, H } from './config.js';
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export function createRenderer(canvas){
  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = W; canvas.height = H;
  }
  resize();
  function drawBackground(t){
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0b1530'); g.addColorStop(0.6,'#1b2a5a'); g.addColorStop(1,'#3a2a6b');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // lagoon water at bottom
    ctx.fillStyle='#0f3a5a'; ctx.fillRect(0,H-48,W,48);
    ctx.fillStyle='rgba(120,200,255,0.18)';
    for(let x=0;x<W;x+=48){ const y=H-32+Math.sin(t*2+x*0.05)*4; ctx.fillRect(x,y,24,2); }
    // city skyline
    ctx.fillStyle='#0a0f24';
    const sky=[80,120,70,140,90,110,60,130,85,95,120,70];
    for(let i=0;i<sky.length;i++){
      const h=sky[i]; ctx.fillRect(i*85, H-48-h, 70, h);
      ctx.fillStyle='rgba(255,214,100,0.85)';
      for(let wy=0; wy<4; wy++) for(let wx=0; wx<3; wx++){ if((i+wy+wx)%3!==0) ctx.fillRect(i*85+10+wx*18, H-48-h+12+wy*22, 8, 10); }
      ctx.fillStyle='#0a0f24';
    }
  }
  function drawKite(p,t,invuln){
    if(invuln>0 && Math.floor(t*10)%2===0) return;
    ctx.save(); ctx.translate(p.x,p.y);
    const wag=Math.sin(t*6)*4;
    ctx.fillStyle='#ffcc33';
    ctx.beginPath(); ctx.moveTo(0,-18+wag); ctx.lineTo(16,0); ctx.lineTo(0,18-wag); ctx.lineTo(-16,0); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ff5533'; ctx.fillRect(-14,-2,28,4);
    ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(0,18); ctx.lineTo(0,18+22); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,26+Math.sin(t*8)*2,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawRing(r){
    ctx.strokeStyle = r.passed ? '#2ecc71' : '#f1c40f';
    ctx.lineWidth=5; ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(241,196,15,0.12)'; ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.fill();
  }
  function drawObstacles(list){
    for(const o of list){
      ctx.fillStyle='#e67e22'; ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle='#7e5109'; ctx.fillRect(o.x+6,o.y+6,o.w-12,10);
      ctx.fillStyle='#fff'; ctx.fillRect(o.x+8,o.y+8,8,6); ctx.fillRect(o.x+o.w-16,o.y+8,8,6);
    }
  }
  function drawPickups(list,t){
    for(const pk of list){
      ctx.fillStyle='#9b59b6'; ctx.beginPath(); ctx.arc(pk.x,pk.y+Math.sin(t*3+pk.x)*3,pk.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText('F',pk.x,pk.y+3+Math.sin(t*3+pk.x)*3);
    }
  }
  function drawHud(state){
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,36);
    ctx.fillStyle='#fff'; ctx.font='16px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`Score ${state.score}  Level ${state.level}  Rings ${state.rings}/${state.ringsNeeded}  Lives ${'♥'.repeat(state.lives)}`,12,24);
    ctx.textAlign='right'; ctx.fillText(`Wind ${state.wind>0?'→':'←'} ${Math.abs(Math.round(state.wind))}`,W-12,24);
  }
  function drawTitle(state){
    drawBackground(0);
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ffcc33'; ctx.font='bold 56px sans-serif'; ctx.textAlign='center';
    ctx.fillText('LAGOS ASCENT',W/2,180);
    ctx.fillStyle='#fff'; ctx.font='20px sans-serif';
    ctx.fillText('Steer the kite through golden rings over Lagos lagoon.',W/2,230);
    ctx.fillText('Dodge yellow danfo buses. Grab purple fuel. WASD / arrows / mouse.',W/2,260);
    ctx.fillText('Clear 3 levels to win. Press SPACE or tap to start.',W/2,320);
    ctx.fillText(`Best: ${state.best||0}`,W/2,380);
  }
  function drawOver(state, won){
    ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = won ? '#2ecc71' : '#e74c3c'; ctx.font='bold 52px sans-serif'; ctx.textAlign='center';
    ctx.fillText(won ? 'YOU ASCENDED!' : 'KITE DOWN', W/2, 200);
    ctx.fillStyle='#fff'; ctx.font='24px sans-serif';
    ctx.fillText(`Score ${state.score}`,W/2,260);
    ctx.fillText(`Press SPACE to restart`,W/2,320);
  }
  function draw(worldState, screen, best){
    worldState.best = best;
    if(screen===SCREEN_TITLE){ drawTitle(worldState); return; }
    drawBackground(worldState.time);
    for(const r of worldState.ringsList) drawRing(r);
    drawObstacles(worldState.obstacles);
    drawPickups(worldState.pickups, worldState.time);
    drawKite(worldState.player, worldState.time, worldState.invuln);
    drawHud(worldState);
    if(screen===SCREEN_PAUSED){
      ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff'; ctx.font='bold 36px sans-serif'; ctx.textAlign='center'; ctx.fillText('PAUSED — P to resume',W/2,H/2);
    }
    if(screen===SCREEN_OVER){ drawOver(worldState, worldState.won); }
  }
  return { draw, resize };
}
