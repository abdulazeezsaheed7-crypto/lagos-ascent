import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_HIT, EVENT_OVER, EVENT_WIN } from './world.js';
import { createInput, inputFromPointer } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random()*4294967296);
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest(){ try{ return Number.parseInt(window.localStorage.getItem(BEST_KEY)??'0',10)||0; }catch{ return 0; } }
function saveBest(v){ try{ window.localStorage.setItem(BEST_KEY,String(v)); }catch{} }

function runShot(name){
  const scene = stageShot(name, world);
  let painted=0;
  function paint(){
    renderer.draw(world.state, scene.screen, scene.best);
    painted++;
    if(painted<2) requestAnimationFrame(paint);
    else window.__shotReady=true;
  }
  requestAnimationFrame(paint);
}

function runGame(){
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let acc=0, last=performance.now();
  function announce(m){ status.textContent=m; }
  function startGame(){
    world.reset(); acc=0; screen=SCREEN_PLAY; announce(`Playing. ${world.state.lives} lives.`);
  }
  function endGame(won){
    screen=SCREEN_OVER;
    if(world.state.score>best){ best=world.state.score; saveBest(best); }
    announce(won?`You ascended! Score ${world.state.score}.`:`Game over. Score ${world.state.score}. Best ${best}.`);
  }
  function frame(now){
    const dt = Math.min(MAX_FRAME, (now-last)/1000); last=now;
    if(input.pollPause() && screen===SCREEN_PLAY){ screen=SCREEN_PAUSED; announce('Paused.'); }
    else if(input.pollPause() && screen===SCREEN_PAUSED){ screen=SCREEN_PLAY; announce('Resumed.'); }
    if(screen===SCREEN_TITLE && input.pollConfirm()) startGame();
    else if(screen===SCREEN_OVER && input.pollConfirm()) startGame();
    if(screen===SCREEN_PLAY){
      acc+=dt;
      let guard=0;
      while(acc>=STEP && guard<10){
        const inp = input.state;
        const merged = inputFromPointer(inp, input.pointer, world.state.player);
        const events = world.step(STEP, merged);
        for(const e of events){
          if(e.type===EVENT_HIT) announce(`Hit! ${world.state.lives} lives left.`);
          if(e.type===EVENT_OVER) endGame(false);
          if(e.type===EVENT_WIN) endGame(true);
        }
        acc-=STEP; guard++;
      }
    }
    renderer.draw(world.state, screen, best);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if(shot) runShot(shot);
else runGame();
