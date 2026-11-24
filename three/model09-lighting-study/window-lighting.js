import * as THREE from '../../vendor/three.module.min.js';

// Explicit glazing from accepted model-09: 8 front + 7 stair-side + 4 clerestory + 1 rear.
// Both entrances, the triangular stair void and solid roof retain their original materials.
export const WINDOW_PANES = new Set([
  "Front_three_storey_facade_|_1_recessed_glazing",
  "Front_three_storey_facade_|_2_recessed_glazing",
  "Front_three_storey_facade_|_3_recessed_glazing",
  "Front_three_storey_facade_|_4_recessed_glazing",
  "Front_three_storey_facade_|_5_recessed_glazing",
  "Front_three_storey_facade_|_6_recessed_glazing",
  "Front_three_storey_facade_|_7_recessed_glazing",
  "Front_three_storey_facade_|_9_recessed_glazing",
  "Stair_side_two_visible_storeys_|_1_recessed_glazing",
  "Stair_side_two_visible_storeys_|_2_recessed_glazing",
  "Stair_side_two_visible_storeys_|_3_recessed_glazing",
  "Stair_side_two_visible_storeys_|_4_recessed_glazing",
  "Stair_side_two_visible_storeys_|_5_recessed_glazing",
  "Stair_side_two_visible_storeys_|_6_recessed_glazing",
  "Stair_side_two_visible_storeys_|_7_recessed_glazing",
  "Right_upper_clerestory_|_1_recessed_glazing",
  "Right_upper_clerestory_|_2_recessed_glazing",
  "Right_upper_clerestory_|_3_recessed_glazing",
  "Right_upper_clerestory_|_4_recessed_glazing",
  "Rear_return_recessed_glass"
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
