import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';
export function stageShot(name, world){
  const s = world.state;
  if(name==='start'){
    world.reset(); s.score=0; s.level=1; s.rings=0; s.ringsNeeded=5; s.lives=3; s.time=0;
    return { screen: SCREEN_TITLE, best: 250 };
  }
  if(name==='play'){
    world.reset(); s.score=340; s.level=2; s.rings=3; s.ringsNeeded=7; s.lives=2; s.time=12; s.player.x=260; s.player.y=210;
    s.ringsList=[{x:540,y:190,r:42,passed:true},{x:700,y:250,r:42,passed:false},{x:860,y:150,r:42,passed:false}];
    s.obstacles=[{x:820,y:280,w:70,h:32,speed:140}];
    s.pickups=[{x:430,y:260,r:10,kind:'fuel'}];
    s.wind=42;
    return { screen: SCREEN_PLAY, best: 250 };
  }
  if(name==='end'){
    world.reset(); s.score=840; s.level=3; s.rings=4; s.ringsNeeded=8; s.lives=0; s.time=20; s.over=true; s.won=false;
    return { screen: SCREEN_OVER, best: 250 };
  }
  if(name==='win'){
    world.reset(); s.score=1230; s.level=3; s.rings=7; s.ringsNeeded=8; s.lives=2; s.time=28; s.won=true;
    return { screen: SCREEN_OVER, best: 250 };
  }
  return { screen: SCREEN_TITLE, best: 250 };
}
