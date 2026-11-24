import * as THREE from '../../vendor/three.module.min.js';

// Explicit facade glazing from accepted model-06; exterior screens, canopies,
// roof apertures and the open entrance remain unlit with original depth rules.
export const WINDOW_PANES = new Set([
  "Front_left_broad_recessed_pane_glazing_0",
  "Front_left_narrow_recessed_pane_glazing_0",
  "Front_left_second_recessed_pane_glazing_0",
  "Front_right_broad_recessed_pane_glazing_0",
  "Front_right_narrow_recessed_pane_glazing_0",
  "Front_right_return_glazing_0",
  "Front_right_return_glazing_1",
  "Front_right_return_glazing_2",
  "Pavilion_recess_back_first_glazing_0",
  "Pavilion_recess_back_second_glazing_0",
  "Right_recessed_bay_0_glazing_0",
  "Right_recessed_bay_1_glazing_0",
  "Right_recessed_bay_2_glazing_0",
  "Right_recessed_bay_3_glazing_0",
  "Right_recessed_bay_4_glazing_0",
  "Right_recessed_bay_5_glazing_0",
  "Right_recessed_bay_6_glazing_0"
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // Keep every original and excluded material untouched.
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
