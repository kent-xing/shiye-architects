import * as THREE from '../../vendor/three.module.min.js';

// Explicit panes only: no doors, frames, annex glazing, roof glazing or dark bases.
export const WINDOW_PANES = new Set([
  'inset-C-upper-middle','inset-C-upper-right','inset-C-lower-left',
  'inset-D-rear-small-upper','inset-D-rear-small-middle','inset-D-terrace-opening',
  'inset-A-return-upper','inset-A-return-middle','inset-A-return-lower',
  'inset-B-strip-upper','inset-B-strip-middle','inset-B-dark-recess',
  'inset-B-shaft-top','inset-B-shaft-upper','inset-B-shaft-middle','inset-B-shaft-lower',
  'bay-glass-A-box-window','bay-glass-D-box-window',
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // The original pane material is also used by doors.
    panes.push({mesh,originalColor:original.color.clone(),originalEmissive:original.emissive.clone(),originalIntensity:original.emissiveIntensity});
  });
  if(panes.length!==WINDOW_PANES.size)throw new Error(`窗片清单不匹配：${panes.length} / ${WINDOW_PANES.size}`);
  const warm=new THREE.Color(LIGHTING_DEFAULTS.color);
  function apply(amount,brightness=LIGHTING_DEFAULTS.brightness){
    for(const {mesh,originalColor,originalEmissive,originalIntensity} of panes){
      // Reduce reflected pane colour as the light comes on, so NoToneMapping does
      // not clip the warm colour to pure white. All changes stay on this pane material.
      mesh.material.color.copy(originalColor).multiplyScalar(1-.94*amount);
      if(amount===0){mesh.material.emissive.copy(originalEmissive);mesh.material.emissiveIntensity=originalIntensity;}
      else{mesh.material.emissive.copy(warm);mesh.material.emissiveIntensity=amount*brightness;}
    }
  }
  return {panes,apply};
}
