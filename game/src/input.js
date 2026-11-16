export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export function createInput(canvas){
  const keys = new Set();
  const state = { up:false, down:false, left:false, right:false };
  const pressed = new Set();
  function sync(){
    state.up = pressed.has('KeyW')||pressed.has('ArrowUp');
    state.down = pressed.has('KeyS')||pressed.has('ArrowDown');
    state.left = pressed.has('KeyA')||pressed.has('ArrowLeft');
    state.right = pressed.has('KeyD')||pressed.has('ArrowRight');
  }
  window.addEventListener('keydown', (e)=>{
    pressed.add(e.code);
    keys.add(e.code);
    if(e.code==='Space'||e.code==='Enter') state.confirm = true; else state.confirm=false;
    if(e.code==='KeyP'||e.code==='Escape') state.pause = true; else state.pause=false;
    sync();
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup',(e)=>{ pressed.delete(e.code); keys.delete(e.code); sync(); });
  // mouse steer: move player toward pointer
  let pointer={x:null,y:null,active:false};
  canvas.addEventListener('pointermove',(e)=>{
    const r=canvas.getBoundingClientRect();
    pointer.x=(e.clientX-r.left)*(960/r.width);
    pointer.y=(e.clientY-r.top)*(540/r.height);
    pointer.active=true;
  });
  canvas.addEventListener('pointerdown',(e)=>{ state.confirm=true; });
  canvas.addEventListener('pointerup',()=>{ state.confirm=false; });
  return {
    get state(){ sync(); return state; },
    get pointer(){ return pointer; },
    pollConfirm(){ const v=state.confirm; state.confirm=false; return v; },
    pollPause(){ const v=state.pause; state.pause=false; return v; }
  };
}
export function inputFromPointer(state, pointer, player){
  if(!pointer.active) return state;
  const dx=pointer.x-player.x, dy=pointer.y-player.y;
  const s = { up: dy < -6, down: dy > 6, left: dx < -6, right: dx > 6 };
  return s;
}
