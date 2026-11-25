import * as THREE from './vendor/three.module.min.js';
import {loadModelScene} from './home-scene.js';

// One canvas/context for the entire page. Only the current model can animate.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const cache = new Map();
let renderer, current = null, desired = null, frame = 0, last = 0;
let lost = false, visible = true, renders = 0;
const resizeObserver = new ResizeObserver(() => { if(current) { size(); draw(); } });
const intersectionObserver = new IntersectionObserver(entries => {
  visible = entries.some(e => e.isIntersecting);
  if(visible) schedule(); else stop();
});

function ensureRenderer() {
  if(lost) throw new Error('WebGL unavailable');
  if(renderer) return;
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.domElement.className = 'model-canvas';
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true;
    const request = desired; desired = null; detach();
    request?.onState?.('error');
  });
}
function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
function detach() {
  stop(); resizeObserver.disconnect(); intersectionObserver.disconnect();
  current?.host.classList.remove('has-3d');
  renderer?.domElement.remove(); current = null;
}
function size() {
  if(!current) return;
  const w = current.host.clientWidth, h = current.host.clientHeight;
  if(!w || !h) return;
  renderer.setSize(w,h,false); current.entry.resize(w,h);
}
function draw() {
  if(!current || lost || document.hidden || !visible) return;
  current.entry.setAngle(current.angle);
  current.entry.setLight(current.amount);
  renderer.render(current.entry.scene,current.entry.camera); renders++;
}
function schedule() {
  if(!frame && current && !lost && !document.hidden && visible) frame = requestAnimationFrame(tick);
}
function tick(time) {
  frame = 0;
  if(!current) return;
  // Slow rotation needs at most 30 draws/second, even on 120 Hz displays.
  if(last && time-last < 1000/30-1) { schedule(); return; }
  const dt = last ? Math.min((time-last)/1000,.05) : 1/60; last = time;
  const goal = current.leaving ? 0 : Number(current.light);
  current.amount = reduced.matches ? goal : current.amount + Math.sign(goal-current.amount)*Math.min(Math.abs(goal-current.amount),dt/.32);
  if(current.leaving) {
    current.angle *= Math.exp(-dt*12);
    if(Math.abs(current.angle)<.001 && current.amount===0) { detach(); return; }
  } else if(current.rotating && !reduced.matches) current.angle -= dt*Math.PI*2/36;
  draw();
  if(current.leaving || current.amount!==goal || (current.rotating&&!reduced.matches)) schedule();
  else last = 0;
}
function trimCache() {
  while(cache.size>2) {
    const [id,entry] = [...cache].find(([,entry]) => entry!==current?.entry);
    cache.delete(id); entry.dispose();
  }
}
async function loadRequest(request, config, assets) {
  try {
    ensureRenderer();
    let entry = cache.get(request.id);
    if(!entry) {
      entry = await loadModelScene(config, assets);
      // A late result must not attach to a new host or repopulate a hidden page.
      if(desired!==request || assets.signal.aborted) { entry.dispose(); return; }
    }
    detach();
    cache.delete(request.id); cache.set(request.id,entry);
    current = {...request,request,entry,angle:0,amount:reduced.matches?1:0,light:true,rotating:!reduced.matches,leaving:false};
    visible = true;
    entry.configureRenderer(renderer);
    request.host.append(renderer.domElement); size(); draw();
    request.host.classList.add('has-3d');
    resizeObserver.observe(request.host); intersectionObserver.observe(request.host);
    trimCache(); request.onState?.('ready'); schedule();
  } catch(error) {
    if(desired!==request) return; // Leaving a card is cancellation, not a load error.
    desired = null; detach(); request.onState?.('error');
    console.warn('Model preview unavailable:',request.id,error.message);
  }
}
export function hasScene(id) { return cache.has(id); }
export function show(host,config,assets,onState) {
  const {id} = config;
  desired = {host,id,onState};
  if(current) detach();
  void loadRequest(desired,config,assets);
}
export function hide(immediate=false) {
  desired = null;
  if(!current) return;
  if(immediate || reduced.matches || document.hidden) { detach(); return; }
  current.leaving = true;
  current.angle = Math.atan2(Math.sin(current.angle),Math.cos(current.angle));
  schedule();
}
export function toggleRotation() {
  if(!current) return false;
  current.rotating = !current.rotating;
  // Reduced motion retains manual arrow/drag control only.
  if(reduced.matches) { current.rotating = false; return false; }
  last = 0; schedule(); return current.rotating;
}
export function toggleLight() {
  if(!current) return true;
  current.light = !current.light; schedule(); return current.light;
}
export function turn(delta) {
  if(!current) return;
  current.rotating = false; current.angle += delta; draw();
}
export function status() {
  return {id:current?.id||null,angle:current?.angle||0,amount:current?.amount||0,rotating:!!current?.rotating,light:current?.light??true,active:!!current,framePending:!!frame,cache:[...cache.keys()],contextCount:renderer?1:0,frameRateLimit:30,renders,visible,lost,renderer:renderer?{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}:null};
}
export function audit() { return current?.entry.audit(); }
document.addEventListener('visibilitychange',() => { if(document.hidden) stop(); else { last=0; draw(); schedule(); } });
reduced.addEventListener('change',() => { if(current) {current.rotating=false; current.amount=Number(current.light);draw();schedule();current.onState?.('ready');} });
window.addEventListener('pagehide',() => {desired=null;detach();for(const entry of cache.values())entry.dispose();cache.clear();});
