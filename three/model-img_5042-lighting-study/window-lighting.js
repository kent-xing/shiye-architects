import * as THREE from '../../vendor/three.module.min.js';

// Explicit facade panes from accepted IMG_5042. The two user-confirmed doors
// and four roof panes retain their source materials; no new geometry.
export const WINDOW_PANES = new Set([
  "Annex_|_front_horizontal_glazing_|_1_recessed_glazing",
  "Annex_|_rear_horizontal_glazing_|_1_recessed_glazing",
  "Annex_|_right_small_square_|_1_recessed_glazing",
  "Front_pavilion_|_entrance_face_|_1_recessed_glazing",
  "Front_pavilion_|_entrance_face_|_2_recessed_glazing",
  "Front_pavilion_|_outer_side_|_1_recessed_glazing",
  "Front_pavilion_|_outer_side_|_2_recessed_glazing",
  "Front_pavilion_|_passage_side_|_1_recessed_glazing",
  "Long_wing_|_central_side_|_1_recessed_glazing",
  "Long_wing_|_central_side_|_2_recessed_glazing",
  "Long_wing_|_courtyard_end_|_1_recessed_glazing",
  "Long_wing_|_entrance_end_|_1_recessed_glazing",
  "Long_wing_|_entrance_end_|_2_recessed_glazing",
  "Long_wing_|_outer_side_|_1_recessed_glazing",
  "Long_wing_|_outer_side_|_2_recessed_glazing",
  "Long_wing_|_outer_side_|_4_recessed_glazing",
  "Rear_pavilion_|_courtyard_face_|_1_recessed_glazing",
  "Rear_pavilion_|_courtyard_face_|_2_recessed_glazing",
  "Rear_pavilion_|_front_return_|_1_recessed_glazing",
  "Rear_pavilion_|_left_return_|_1_recessed_glazing",
  "Rear_pavilion_|_outer_side_|_1_recessed_glazing",
  "Rear_pavilion_|_outer_side_|_2_recessed_glazing",
  "Rear_pavilion_|_outer_side_|_3_recessed_glazing"
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
